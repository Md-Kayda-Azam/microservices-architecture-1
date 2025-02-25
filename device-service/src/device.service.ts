import { Injectable } from '@nestjs/common';
import { CreateDeviceInput } from './dto/create-device.input';
import { UpdateDeviceInput } from './dto/update-device.input';

@Injectable()
export class DeviceService {
  create(createDeviceInput: CreateDeviceInput) {
    return 'This action adds a new device';
  }

  findAll() {
    return `This action returns all device`;
  }

  findOne(id: number) {
    return `This action returns a #${id} device`;
  }

  update(id: number, updateDeviceInput: UpdateDeviceInput) {
    return `This action updates a #${id} device`;
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }
}
