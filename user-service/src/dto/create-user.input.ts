import { Field, InputType, ID } from '@nestjs/graphql';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @Field()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId({ message: 'Role must be a valid MongoDB ObjectId' })
  role: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId({ message: 'School must be a valid MongoDB ObjectId' })
  school: string;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  lastActive?: Date;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mfaSecret?: string;

  @Field(() => [DeviceInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Devices array cannot be empty if provided' })
  devices?: DeviceInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Notifications array cannot be empty if provided' })
  @IsString({ each: true, message: 'Each notification must be a string' })
  notifications?: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId({ message: 'Settings ID must be a valid MongoDB ObjectId' })
  settingsId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  lastPasswordChanged?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resetPasswordToken?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  resetPasswordExpires?: Date;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  verificationToken?: string;
}

@InputType()
export class DeviceInput {
  @Field()
  @IsString()
  deviceId: string;

  @Field()
  @IsString()
  ipAddress: string;

  @Field()
  @IsString()
  userAgent: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;
}
