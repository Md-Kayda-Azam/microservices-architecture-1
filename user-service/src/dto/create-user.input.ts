import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from 'src/model/user.model';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true })
  schoolId?: string;
}
