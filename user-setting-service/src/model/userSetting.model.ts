import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class UserSettings extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({ required: true })
  userId: string; // User ID রেফারেন্স

  @Field({ defaultValue: 'en' })
  @Prop({ default: 'en' })
  language: string;

  @Field({ defaultValue: 'light' })
  @Prop({ default: 'light' })
  theme: string;

  @Field({ defaultValue: true })
  @Prop({ default: true })
  emailNotifications: boolean;

  @Field({ defaultValue: true })
  @Prop({ default: true })
  pushNotifications: boolean;
}

export type UserSettingsDocument = UserSettings & Document;
export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
