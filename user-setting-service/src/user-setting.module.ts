import { Module } from '@nestjs/common';
import { UserSettingService } from './user-setting.service';
import { UserSettingResolver } from './user-setting.resolver';

@Module({
  providers: [UserSettingResolver, UserSettingService],
})
export class UserSettingModule {}
