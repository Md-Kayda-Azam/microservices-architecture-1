import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class Notification {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  type: string;

  @Field()
  @Prop({ required: true })
  message: string;

  @Field()
  @Prop({ default: false })
  read: boolean;

  @Field(() => ID)
  @Prop({ type: String, required: true })
  userId: string; // User-এর ID সংরক্ষণ
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
