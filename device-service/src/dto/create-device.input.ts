import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateDeviceInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
