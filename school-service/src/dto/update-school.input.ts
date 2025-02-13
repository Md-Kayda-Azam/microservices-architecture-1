import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateSchoolDto } from './create-school.input';

@InputType()
export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {
  @Field(() => ID)
  id: string;
}