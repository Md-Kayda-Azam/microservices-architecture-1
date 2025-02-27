import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Device, DeviceDocument } from './model/device.model';
import { CreateDeviceInput } from './dto/create-device.input';
import { UpdateDeviceInput } from './dto/update-device.input';
// import { KafkaProducer } from './kafka/kafka.producer';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
    // private readonly kafkaProducer: KafkaProducer,
  ) {}

  async create(createDeviceInput: CreateDeviceInput): Promise<Partial<Device>> {
    try {
      if (
        !createDeviceInput ||
        !createDeviceInput.userAgent ||
        !createDeviceInput.ipAddress ||
        !createDeviceInput.userId
      ) {
        throw new BadRequestException('Device name and type are required.');
      }

      const device = new this.deviceModel(createDeviceInput);
      const savedDevice = await device.save();

      // await this.kafkaProducer.sendDeviceCreatedEvent({
      //   deviceId: savedDevice._id,
      //   name: savedDevice.name,
      //   type: savedDevice.type,
      //   status: savedDevice.status,
      // });

      return savedDevice.toObject();
    } catch (error) {
      throw new InternalServerErrorException(
        `Device creation failed: ${error.message}`,
      );
    }
  }

  async findAll(
    options: { limit?: number; page?: number; sort?: any } = {},
  ): Promise<Device[]> {
    const { limit = 10, page = 1, sort = {} } = options;
    const skip = (page - 1) * limit;

    return this.deviceModel.find().sort(sort).skip(skip).limit(limit).exec();
  }

  async findOne(id: string): Promise<Device> {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const device = await this.deviceModel.findById(id).exec();
      if (!device) {
        throw new NotFoundException(`Device with ID ${id} not found`);
      }

      return device;
    } catch (error) {
      throw new InternalServerErrorException(
        `An error occurred: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateDeviceInput: UpdateDeviceInput,
  ): Promise<Device> {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      if (!updateDeviceInput || Object.keys(updateDeviceInput).length === 0) {
        throw new BadRequestException(`Update data cannot be empty`);
      }

      const updatedDevice = await this.deviceModel
        .findByIdAndUpdate(id, updateDeviceInput, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedDevice) {
        throw new NotFoundException(`Device with ID ${id} not found`);
      }

      // await this.kafkaProducer.sendDeviceUpdatedEvent(
      //   updatedDevice._id,
      //   updateDeviceInput,
      // );

      return updatedDevice;
    } catch (error) {
      throw new InternalServerErrorException(
        `An error occurred while updating: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<Device> {
    try {
      if (!id) {
        throw new BadRequestException('Device ID is required.');
      }

      if (!isValidObjectId(id)) {
        throw new BadRequestException('Invalid Device ID format.');
      }

      const deletedDevice = await this.deviceModel.findByIdAndDelete(id).exec();
      if (!deletedDevice) {
        throw new NotFoundException(`Device with ID ${id} not found.`);
      }

      // await this.kafkaProducer.sendDeviceDeletedEvent(deletedDevice._id);

      return deletedDevice;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete device: ${error.message}`,
      );
    }
  }
}
