import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserSetting {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
