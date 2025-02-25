import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserSettingInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
