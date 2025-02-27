import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { DeviceService } from './device.service';
import { CreateDeviceInput } from './dto/create-device.input';
import { Device } from './model/device.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Resolver(() => Device)
export class DeviceResolver {
  constructor(private readonly deviceService: DeviceService) {}

  // ✅ Create a new device with validation
  @Mutation(() => Device)
  async createDevice(
    @Args('createDeviceInput') createDeviceInput: CreateDeviceInput,
  ) {
    if (
      !createDeviceInput ||
      !createDeviceInput.userAgent ||
      !createDeviceInput.ipAddress ||
      !createDeviceInput.userId
    ) {
      throw new BadRequestException(
        'User Agent, IP Address, and User ID are required to create a device.',
      );
    }

    return this.deviceService.create(createDeviceInput);
  }

  // ✅ Retrieve all devices
  @Query(() => [Device], { name: 'devices' })
  async findAll() {
    try {
      return await this.deviceService.findAll();
    } catch (error) {
      throw new NotFoundException('No devices found.');
    }
  }

  // ✅ Retrieve a single device by ID with validation
  @Query(() => Device, { name: 'device' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    if (!id) {
      throw new BadRequestException('Device ID is required.');
    }

    // Validate ID format (assuming MongoDB ObjectId)
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new BadRequestException('Invalid Device ID format.');
    }

    try {
      return await this.deviceService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Device with ID ${id} not found.`);
    }
  }

  // ✅ Remove a device by ID with validation
  @Mutation(() => Device)
  async removeDevice(@Args('id', { type: () => ID }) id: string) {
    if (!id) {
      throw new BadRequestException('Device ID is required to delete.');
    }

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new BadRequestException('Invalid Device ID format.');
    }

    const deletedDevice = await this.deviceService.remove(id);
    if (!deletedDevice) {
      throw new NotFoundException(`Device with ID ${id} not found.`);
    }

    return deletedDevice;
  }
}
