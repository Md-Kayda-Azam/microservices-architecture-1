import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType() // GraphQL object type
@Schema()
export class School {
    @Field(() => ID)
    _id: string;

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
}

export type SchoolDocument = School & Document;
export const SchoolSchema = SchemaFactory.createForClass(School);
