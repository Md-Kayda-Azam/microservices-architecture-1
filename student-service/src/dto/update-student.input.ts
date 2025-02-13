import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { CreateStudentDto } from './create-student.input';

@InputType()
export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @Field(() => ID)
  id: string;
}