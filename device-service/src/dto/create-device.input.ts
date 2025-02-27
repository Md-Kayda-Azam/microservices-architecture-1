import { Field, InputType, ID } from '@nestjs/graphql';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

@InputType()
export class CreateDeviceInput {
  @Field()
  @IsString({ message: 'Device ID must be a string.' })
  @IsNotEmpty({ message: 'User deviceId is required.' })
  deviceId?: string;

  @Field()
  @IsString({ message: 'User Agent must be a string.' })
  @IsNotEmpty({ message: 'User Agent is required.' })
  userAgent: string;

  @Field()
  @IsString({ message: 'IP Address must be a string.' })
  @IsNotEmpty({ message: 'IP Address is required.' })
  @Matches(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    { message: 'Invalid IP address format.' },
  )
  ipAddress: string;

  @Field({ nullable: true })
  @IsDate({ message: 'Last login must be a valid date.' })
  @IsOptional()
  lastLogin?: Date;

  @Field(() => ID)
  @IsString({ message: 'User ID must be a string.' })
  @IsNotEmpty({ message: 'User ID is required.' })
  @IsUUID('4', { message: 'Invalid User ID format.' })
  userId: string;
}
