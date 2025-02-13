import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateStudentDto {
  @Field(() => String, { description: 'Name of the student' })
  name: string;

  @Field(() => String, { description: 'Address of the student' })
  address: string;

  @Field(() => String, { description: 'Phone number of the student' })
  phoneNumber: string;

  @Field(() => String, { description: 'Email of the student' })
  email: string;

  @Field(() => String, { description: 'School ID of the student' })
  schoolId: string;
}