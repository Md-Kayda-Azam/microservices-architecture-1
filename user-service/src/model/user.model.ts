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

  @Field(() => ID, { nullable: true })
  @Prop({ required: true })
  school: string;

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

  @Field(() => [Device], { nullable: true })
  @Prop({
    type: [
      {
        _id: String,
        deviceId: String,
        ipAddress: String,
        userAgent: String,
        location: String,
      },
    ],
    default: [],
  })
  devices?: Device[];

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
  verificationOTP?: string;

  @Field({ nullable: true })
  @Prop()
  verificationOtpExpires?: Date;

  @Field({ nullable: true })
  @Prop()
  verificationToken?: string;

  @Field({ defaultValue: false })
  @Prop({ default: false })
  isDeleted: boolean;

  @Field({ nullable: true })
  @Prop()
  otpRequestedAt?: Date;

  @Field({ defaultValue: 0 })
  @Prop({ default: 0 })
  otpRequestCount?: number;

  @Field({ nullable: true })
  @Prop()
  otpBlockedUntil?: Date;

  @Field({ nullable: true })
  @Prop({ type: String, default: null })
  refreshToken?: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

@ObjectType()
export class Device {
  @Field()
  _id: string;

  @Field()
  deviceId: string;

  @Field()
  ipAddress: string;

  @Field()
  userAgent: string;

  @Field({ nullable: true })
  location?: string;
}
