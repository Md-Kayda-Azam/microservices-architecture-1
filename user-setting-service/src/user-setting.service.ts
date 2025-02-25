import { Injectable } from '@nestjs/common';
import { CreateUserSettingInput } from './dto/create-user-setting.input';
import { UpdateUserSettingInput } from './dto/update-user-setting.input';

@Injectable()
export class UserSettingService {
  create(createUserSettingInput: CreateUserSettingInput) {
    return 'This action adds a new userSetting';
  }

  findAll() {
    return `This action returns all userSetting`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userSetting`;
  }

  update(id: number, updateUserSettingInput: UpdateUserSettingInput) {
    return `This action updates a #${id} userSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} userSetting`;
  }
}
