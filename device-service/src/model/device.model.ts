import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
@ObjectType()
export class Device {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  deviceId: string;

  @Field()
  @Prop({ required: true })
  userAgent: string;

  @Field()
  @Prop({ required: true })
  ipAddress: string;

  @Field({ nullable: true })
  @Prop()
  lastLogin?: Date;

  @Field(() => ID)
  @Prop({ type: String, required: true })
  userId: string; // User-এর ID সংরক্ষণ
}

export type DeviceDocument = Device & Document;
export const DeviceSchema = SchemaFactory.createForClass(Device);
