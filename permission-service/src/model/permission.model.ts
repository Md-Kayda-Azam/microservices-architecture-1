import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt timestamps
export class Permission extends Document {
    @Field(() => ID)
    _id: string;

    @Field()
    @Prop({ required: true })
    name: string; // Permission name (e.g., 'Manage Users', 'View Reports')

    @Field({ nullable: true })
    @Prop()
    description?: string; // Optional description for the permission

    @Field()
    @Prop({ required: true, default: true })
    isActive: boolean; // To indicate if the permission is currently active
}

export type PermissionDocument = Permission & Document;
export const PermissionSchema = SchemaFactory.createForClass(Permission);
