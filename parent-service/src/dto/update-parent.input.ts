import { CreateParentInput } from './create-parent.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateParentInput extends PartialType(CreateParentInput) {
  @Field(() => ID)
  id: string;
}
