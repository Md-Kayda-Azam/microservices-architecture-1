import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

@InputType()
export class CreatePermissionInput {
  @Field()
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name is required.' })
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters.' })
  @Matches(/^[a-zA-Z0-9\s\-_,.()]+$/, {
    message: 'Name contains invalid characters.',
  })
  name: string;

  @Field({ nullable: true })
  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  @Length(5, 255, { message: 'Description must be between 5 and 255 characters.' })
  description?: string;

  @Field()
  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsOptional()
  isActive?: boolean;
}