import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { User } from './model/user.model';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { BadRequestException, UseGuards } from '@nestjs/common';
import {
  LoginResponse,
  RefreshTokenResponse,
} from './dto/login/LoginResponse ';
import { LoginInput } from './dto/login/LoginInput ';
import { CurrentUser } from './auth/current-user.decorator';
import { GqlAuthGuard } from './auth/gql-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return await this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  async findAll() {
    return await this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return await this.userService.findOne(id);
  }

  @Mutation(() => User)
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    if (!Types.ObjectId.isValid(updateUserInput.id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return await this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  async removeUser(@Args('id', { type: () => ID }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ObjectId format');
    }
    return await this.userService.softDelete(id);
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context('req') request: Request,
  ): Promise<LoginResponse> {
    return this.userService.login(loginInput, request);
  }

  @Mutation(() => LoginResponse, { description: 'Verify email with OTP' })
  async verifyEmailWithOTP(
    @Args('email') email: string,
    @Args('otp') otp: string,
    @Context('req') request: Request,
  ): Promise<LoginResponse> {
    try {
      return await this.userService.verifyEmailWithOTP(email, otp, request);
    } catch (error) {
      throw new BadRequestException(`Verification failed: ${error.message}`);
    }
  }

  // auth.resolver.ts
  @Mutation(() => RefreshTokenResponse)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    try {
      return await this.userService.refreshToken(refreshToken);
    } catch (error) {
      throw new BadRequestException(`Token refresh failed: ${error.message}`);
    }
  }

  @Query(() => User, { name: 'profile' }) // 'profile' নাম দিয়েছো, 'getProfile' না
  @UseGuards(GqlAuthGuard)
  async getProfile(@CurrentUser() user: any): Promise<User> {
    console.log('Current User:', user); // ডিবাগ করার জন্য
    return this.userService.getProfile(user.userId); // userId দিয়ে ডাটা আনো
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@CurrentUser() user: any) {
    await this.userService.logout(user.userId);
    return true;
  }
}
