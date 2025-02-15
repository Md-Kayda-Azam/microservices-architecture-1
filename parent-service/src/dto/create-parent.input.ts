import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateParentInput {
  @Field()
  name: string;

  @Field()
  address: string;

  @Field()
  phoneNumber: string;

  @Field()
  email: string;

  @Field()
  schoolId: string;

  @Field()
  studentId: string;
}
