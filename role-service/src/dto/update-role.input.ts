import { IsBoolean } from 'class-validator';
import { CreateRoleInput } from './create-role.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateRoleInput extends PartialType(CreateRoleInput) {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @IsBoolean()
  isActive?: boolean;
}
