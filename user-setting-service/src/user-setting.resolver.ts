import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserSettingService } from './user-setting.service';
import { UserSetting } from './entities/user-setting.entity';
import { CreateUserSettingInput } from './dto/create-user-setting.input';
import { UpdateUserSettingInput } from './dto/update-user-setting.input';

@Resolver(() => UserSetting)
export class UserSettingResolver {
  constructor(private readonly userSettingService: UserSettingService) {}

  @Mutation(() => UserSetting)
  createUserSetting(@Args('createUserSettingInput') createUserSettingInput: CreateUserSettingInput) {
    return this.userSettingService.create(createUserSettingInput);
  }

  @Query(() => [UserSetting], { name: 'userSetting' })
  findAll() {
    return this.userSettingService.findAll();
  }

  @Query(() => UserSetting, { name: 'userSetting' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userSettingService.findOne(id);
  }

  @Mutation(() => UserSetting)
  updateUserSetting(@Args('updateUserSettingInput') updateUserSettingInput: UpdateUserSettingInput) {
    return this.userSettingService.update(updateUserSettingInput.id, updateUserSettingInput);
  }

  @Mutation(() => UserSetting)
  removeUserSetting(@Args('id', { type: () => Int }) id: number) {
    return this.userSettingService.remove(id);
  }
}
