import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}
export type StudentDocument = Student & Document;
export const StudentSchema = SchemaFactory.createForClass(Student);
