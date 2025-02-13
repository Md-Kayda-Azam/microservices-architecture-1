import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { School } from './school.model'; // School মডেল ইমপোর্ট করুন

@ObjectType()
@Schema()
export class Student extends Document {
    @Field(() => ID)
    _id: string; // MongoDB সাধারণত `_id` রাখে, তাই এটা ঠিক রাখুন

    @Field()
    @Prop({ required: true })
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

    @Field()
    @Prop({ required: true })
    schoolId: string;

    // 👇 নতুনভাবে School সম্পর্কিত তথ্য যুক্ত করুন
    @Field(() => School, { nullable: true }) // GraphQL-এ একে nullable রাখুন
    school?: School;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
