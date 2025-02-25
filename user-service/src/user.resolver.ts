import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { User } from './model/user.model';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';



@Resolver(() => User)
export class UserResolver {
  constructor(private readonly UserService: UserService) { }

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.UserService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })  // Plural name for better GraphQL convention
  findAll() {
    return this.UserService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => String }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.UserService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('id') id: string, @Args('updateUserInput') updateUserInput: UpdateUserInput) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.UserService.update(id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => ID }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.UserService.remove(id);
  }
}