import { IsNotEmpty, IsString, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateRoleInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => [String])
  @ArrayNotEmpty()
  @ArrayUnique()
  permissions: string[];
}

