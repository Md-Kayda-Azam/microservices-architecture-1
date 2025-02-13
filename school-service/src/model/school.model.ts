import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType() // GraphQL object type
@Schema()
export class School {
    @Field(() => ID)
    _id: string; // Mongoose সাধারণত _id ব্যবহার করে, GraphQL ID হিসেবে একে প্রকাশ করা হয়েছে।

    @Field()
    @Prop({ required: true }) // Required field
    name: string;

    @Field()
    @Prop({ required: true })
    address: string;

    @Field()
    @Prop({ required: true })
    phoneNumber: string;

    @Field()
    @Prop({ required: true })
    email: string;
}

// Mongoose-এর জন্য Document টাইপ ডিফাইন করা
export type SchoolDocument = School & Document;
export const SchoolSchema = SchemaFactory.createForClass(School);
