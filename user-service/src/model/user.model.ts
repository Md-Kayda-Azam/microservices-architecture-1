import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true })
  @Field()
  firstName: string;

  @Prop({ required: true })
  @Field()
  lastName: string;

  @Field()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Field(() => ID, { nullable: true })
  @Prop({ required: true })
  role: string;

  @Field({ defaultValue: true })
  @Prop({ default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Prop()
  lastActive?: Date;

  @Field({ defaultValue: false })
  @Prop({ default: false })
  mfaEnabled: boolean;

  @Field({ nullable: true })
  @Prop()
  mfaSecret?: string;

  @Field(() => [String], { nullable: true })
  @Prop({ type: [String], default: [] })
  devices?: string[];

  @Field(() => [String], { nullable: true })
  @Prop({ type: [String], default: [] })
  notifications?: string[];

  @Field(() => ID, { nullable: true })
  settingsId?: string;

  @Field({ nullable: true })
  @Prop()
  lastPasswordChanged?: Date;

  @Field({ nullable: true })
  @Prop()
  resetPasswordToken?: string;

  @Field({ nullable: true })
  @Prop()
  resetPasswordExpires?: Date;

  @Field({ defaultValue: false })
  @Prop({ default: false })
  isVerified: boolean;

  @Field({ nullable: true })
  @Prop()
  verificationToken?: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
// import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

// export enum UserRole {
//   ADMIN = 'ADMIN',
//   SCHOOL_ADMIN = 'SCHOOL_ADMIN',
//   STUDENT = 'STUDENT',
//   PARENT = 'PARENT',
// }

// registerEnumType(UserRole, { name: 'UserRole' });

// @ObjectType()
// @Schema({ timestamps: true })
// export class User extends Document {
//   @Field(() => ID)
//   _id: string;

//   @Field()
//   @Prop({ required: true })
//   name: string;

//   @Field()
//   @Prop({ required: true, unique: true })
//   email: string;

//   @Prop({ required: true })
//   password: string;

//   @Field(() => UserRole)
//   @Prop({ required: true, enum: UserRole })
//   role: UserRole;

//   @Field({ nullable: true })
//   @Prop()
//   schoolId?: string;
// }

// export type UserDocument = User & Document;
// export const UserSchema = SchemaFactory.createForClass(User);
