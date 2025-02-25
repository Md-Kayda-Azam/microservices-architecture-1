import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ArrayNotEmpty, ArrayUnique } from 'class-validator';

@ObjectType()
@Schema({ timestamps: true })
export class Role extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true, unique: true })
  name: string; // রোলের নাম যেমন ADMIN, TEACHER ইত্যাদি

  @Field(() => [String]) // Explicitly specify that 'permissions' is an array of strings
  @Prop({ type: [{ type: String }] })
  @ArrayNotEmpty()
  @ArrayUnique()
  permissions: string[]; // রোলের সাথে সম্পর্কিত পারমিশন

  @Field()
  @Prop({ default: true })
  isActive: boolean; // রোল অ্যাক্টিভ কিনা
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);
