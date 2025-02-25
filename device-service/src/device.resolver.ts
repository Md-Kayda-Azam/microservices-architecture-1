import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DeviceService } from './device.service';
import { Device } from './entities/device.entity';
import { CreateDeviceInput } from './dto/create-device.input';
import { UpdateDeviceInput } from './dto/update-device.input';

@Resolver(() => Device)
export class DeviceResolver {
  constructor(private readonly deviceService: DeviceService) {}

  @Mutation(() => Device)
  createDevice(@Args('createDeviceInput') createDeviceInput: CreateDeviceInput) {
    return this.deviceService.create(createDeviceInput);
  }

  @Query(() => [Device], { name: 'device' })
  findAll() {
    return this.deviceService.findAll();
  }

  @Query(() => Device, { name: 'device' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.deviceService.findOne(id);
  }

  @Mutation(() => Device)
  updateDevice(@Args('updateDeviceInput') updateDeviceInput: UpdateDeviceInput) {
    return this.deviceService.update(updateDeviceInput.id, updateDeviceInput);
  }

  @Mutation(() => Device)
  removeDevice(@Args('id', { type: () => Int }) id: number) {
    return this.deviceService.remove(id);
  }
}
