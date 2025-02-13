import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class School {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
