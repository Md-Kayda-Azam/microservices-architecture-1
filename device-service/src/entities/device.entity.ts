import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Device {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
