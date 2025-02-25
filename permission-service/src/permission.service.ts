import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Permission, PermissionDocument } from './model/permission.model';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { KafkaProducer } from './kafka/kafka.producer';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  /**
   * Create permission method
   * @param createPermissionInput
   * @returns
   */
  async create(
    createPermissionInput: CreatePermissionInput,
  ): Promise<Partial<Permission>> {
    try {
      // ✅ Check if input is valid (Ensure required fields are present)
      if (
        !createPermissionInput ||
        !createPermissionInput.name ||
        !createPermissionInput.description
      ) {
        throw new BadRequestException(
          'Permission name and description are required.',
        );
      }

      // ✅ Ensure isActive is set to true if not provided
      if (createPermissionInput.isActive === undefined) {
        createPermissionInput.isActive = true;
      }

      // ✅ Create new permission
      const permission = new this.permissionModel(createPermissionInput);
      const savedPermission = await permission.save();

      // // Using the sendParentCreatedEvent method here
      await this.kafkaProducer.sendPermissionCreatedEvent({
        permissionId: savedPermission._id,
        name: savedPermission.name,
        description: savedPermission.description,
        isActive: savedPermission.isActive,
      });

      return savedPermission.toObject();
    } catch (error) {
      // ✅ Handle duplicate key error (MongoDB unique constraint violation)
      if (error.code === 11000 && error.keyPattern?.name) {
        throw new BadRequestException(
          'This permission name already exists. Please use another name.',
        );
      } else {
        throw new InternalServerErrorException(
          `Permission creation failed: ${error.message}`,
        );
      }
    }
  }

  /**
   * Find all permissions method
   * @param options
   * @returns
   */
  async findAll(
    options: { limit?: number; page?: number; sort?: any } = {},
  ): Promise<Permission[]> {
    const { limit = 10, page = 1, sort = {} } = options;
    const skip = (page - 1) * limit;

    return this.permissionModel
      .find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Find one permission method
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<Permission> {
    try {
      // ✅ Validate if ID is a valid MongoDB ObjectId
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const permission = await this.permissionModel.findById(id).exec();

      // ✅ If no permission found, throw NotFoundException
      if (!permission) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      return permission;
    } catch (error) {
      // ✅ Handle unexpected errors
      throw new InternalServerErrorException(
        `An error occurred: ${error.message}`,
      );
    }
  }

  /**
   * Update permission method
   * @param id
   * @param updatePermission
   * @returns
   */
  async update(
    id: string,
    updatePermissionInput: UpdatePermissionInput,
  ): Promise<Permission> {
    try {
      // ✅ ID ফরম্যাট চেক (যদি অবৈধ হয় তাহলে BadRequestException)
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      // ✅ Update data validation (Ensure input is not empty)
      if (
        !updatePermissionInput ||
        Object.keys(updatePermissionInput).length === 0
      ) {
        throw new BadRequestException(`Update data cannot be empty`);
      }

      // ✅ ডাটাবেজ আপডেট করুন
      const updatePermission = await this.permissionModel
        .findByIdAndUpdate(
          id,
          updatePermissionInput,
          { new: true, runValidators: true }, // ✅ Validation enforce
        )
        .exec();

      // ✅ যদি ID ডাটাবেজে না থাকে
      if (!updatePermission) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      // ✅ Kafka event (Optional)
      await this.kafkaProducer.sendPermissionUpdatedEvent(
        updatePermission._id,
        updatePermissionInput,
      );

      return updatePermission;
    } catch (error) {
      // ✅ Internal server error handle
      throw new InternalServerErrorException(
        `An error occurred while updating: ${error.message}`,
      );
    }
  }

  /**
   *  Remove permission method
   * @param id
   * @returns
   */
  async remove(id: string): Promise<Permission> {
    try {
      // ✅ Check if ID is provided
      if (!id) {
        throw new BadRequestException('Permission ID is required.');
      }

      // ✅ Validate MongoDB ObjectId
      if (!isValidObjectId(id)) {
        throw new BadRequestException('Invalid Permission ID format.');
      }

      // ✅ Find and delete the permission
      const deletedPermission = await this.permissionModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedPermission) {
        throw new NotFoundException(`Permission with ID ${id} not found.`);
      }

      // ✅ If using Kafka, trigger event after deletion
      await this.kafkaProducer.sendPermissionDeletedEvent(
        deletedPermission._id,
      );

      return deletedPermission;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete permission: ${error.message}`,
      );
    }
  }

  /**
   * Multiple permission creation method
   * @param input
   * @returns
   */
  async createMany(input: CreatePermissionInput[]): Promise<Permission[]> {
    const createdPermissions = await this.permissionModel.insertMany(input);
    return createdPermissions.map((perm) => perm.toObject()); // ✅ Convert to plain objects
  }

  /**
   * Find permission by name
   * @param name
   * @returns
   */
  async findByName(name: string): Promise<Permission> {
    const permission = await this.permissionModel.findOne({ name }).exec();

    if (!permission) {
      throw new NotFoundException(`Permission with name ${name} not found`);
    }

    return permission;
  }

  /**
   * Validate permissions method
   * @param permissionIds
   * @returns
   */
  async validatePermissions(permissionIds: string[]) {
    try {
      // MongoDB query to find permissions by _id
      const permissions = await this.permissionModel.find({
        _id: { $in: permissionIds },
      });

      if (permissions.length === 0) {
        return {
          message: 'Permissions Invalidated!',
        };
      } else {
        return {
          message: 'Permissions validated successfully',
          permissions,
        };
      }
    } catch (error) {
      throw new Error('Error while validating permissions: ' + error.message);
    }
  }
}
