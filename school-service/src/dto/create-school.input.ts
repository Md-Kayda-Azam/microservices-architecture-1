import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateSchoolDto {
  @Field()
  name: string;

  @Field()
  address: string;

  @Field()
  phoneNumber: string;

  @Field()
  email: string;
}