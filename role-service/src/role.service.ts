import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Role, RoleDocument } from './model/role.model';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { KafkaProducer } from './kafka/kafka.producer';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  /**
   * Create role method
   * @param createRoleInput
   * @returns
   */
  async create(createRoleInput: CreateRoleInput): Promise<Partial<Role>> {
    try {
      // ✅ Check if input is valid (Ensure required fields are present)
      if (
        !createRoleInput ||
        !createRoleInput.name ||
        !createRoleInput.permissions
      ) {
        throw new BadRequestException(
          'Role name and description are required.',
        );
      }

      // ✅ Create new role
      const role = new this.roleModel(createRoleInput);
      const savedRole = await role.save();

      // Using the sendParentCreatedEvent method here
      await this.kafkaProducer.sendRoleCreatedEvent({
        roleId: savedRole._id,
        name: savedRole.name,
        permissions: savedRole.permissions,
        isActive: savedRole.isActive,
      });

      return savedRole.toObject();
    } catch (error) {
      // ✅ Handle duplicate key error (MongoDB unique constraint violation)
      if (error.code === 11000 && error.keyPattern?.name) {
        throw new BadRequestException(
          'This role name already exists. Please use another name.',
        );
      } else {
        throw new InternalServerErrorException(
          `role creation failed: ${error.message}`,
        );
      }
    }
  }

  /**
   * Find all roles method
   * @param options
   * @returns
   */
  async findAll(
    options: { limit?: number; page?: number; sort?: any } = {},
  ): Promise<Role[]> {
    const { limit = 10, page = 1, sort = {} } = options;
    const skip = (page - 1) * limit;

    return this.roleModel.find().sort(sort).skip(skip).limit(limit).exec();
  }

  /**
   * Find one role method
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<Role> {
    try {
      // ✅ Validate if ID is a valid MongoDB ObjectId
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const role = await this.roleModel.findById(id).exec();

      // ✅ If no role found, throw NotFoundException
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      return role;
    } catch (error) {
      // ✅ Handle unexpected errors
      throw new InternalServerErrorException(
        `An error occurred: ${error.message}`,
      );
    }
  }

  /**
   * Update role method
   * @param id
   * @param updateRole
   * @returns
   */
  async update(id: string, updateRoleInput: UpdateRoleInput): Promise<Role> {
    try {
      // ✅ ID ফরম্যাট চেক (যদি অবৈধ হয় তাহলে BadRequestException)
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      // ✅ Update data validation (Ensure input is not empty)
      if (!updateRoleInput || Object.keys(updateRoleInput).length === 0) {
        throw new BadRequestException(`Update data cannot be empty`);
      }

      // ✅ ডাটাবেজ আপডেট করুন
      const updateRole = await this.roleModel
        .findByIdAndUpdate(
          id,
          updateRoleInput,
          { new: true, runValidators: true }, // ✅ Validation enforce
        )
        .exec();

      // ✅ যদি ID ডাটাবেজে না থাকে
      if (!updateRole) {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }

      //  ✅ Kafka event (Optional)
      await this.kafkaProducer.sendRoleUpdatedEvent(
        updateRole._id,
        updateRoleInput,
      );

      return updateRole;
    } catch (error) {
      // ✅ Internal server error handle
      throw new InternalServerErrorException(
        `An error occurred while updating: ${error.message}`,
      );
    }
  }

  /**
   *  Remove role method
   * @param id
   * @returns
   */
  async remove(id: string): Promise<Role> {
    try {
      // ✅ Check if ID is provided
      if (!id) {
        throw new BadRequestException('Role ID is required.');
      }

      // ✅ Validate MongoDB ObjectId
      if (!isValidObjectId(id)) {
        throw new BadRequestException('Invalid Role ID format.');
      }

      // ✅ Find and delete the role
      const deletedRole = await this.roleModel.findByIdAndDelete(id).exec();

      if (!deletedRole) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }

      //  ✅ If using Kafka, trigger event after deletion
      await this.kafkaProducer.sendRoleDeletedEvent(deletedRole._id);

      return deletedRole;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete role: ${error.message}`,
      );
    }
  }

  /**
   * Multiple role creation method
   * @param input
   * @returns
   */
  async createMany(input: CreateRoleInput[]): Promise<Role[]> {
    const createdRoles = await this.roleModel.insertMany(input);
    return createdRoles.map((perm) => perm.toObject()); // ✅ Convert to plain objects
  }
}
