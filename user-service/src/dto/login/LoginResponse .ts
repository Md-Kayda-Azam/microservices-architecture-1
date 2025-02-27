import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class LoginResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  userId: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  refreshToken?: string;
}

@ObjectType()
export class RefreshTokenResponse {
  @Field()
  accessToken: string;
}

@ObjectType()
export class getProfile {
  @Field(() => ID)
  _id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}
