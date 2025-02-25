import { Injectable, OnModuleInit, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Kafka } from "kafkajs";
import { User, UserDocument } from "src/model/user.model";

@Injectable()
export class KafkaConsumer implements OnModuleInit {
    private kafka = new Kafka({ brokers: ['kafka:9092'] });
    private consumer = this.kafka.consumer({ groupId: 'user-service' });
    private producer = this.kafka.producer();
    private readonly logger = new Logger(KafkaConsumer.name);

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async onModuleInit() {
        await this.consumer.connect();
        await this.producer.connect();

        // Subscribe to topics
        await this.consumer.subscribe({ topic: 'user.create', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'user.update', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'user.delete', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'user.getById', fromBeginning: true });

        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                if (!message.value) {
                    this.logger.warn('⚠️ Received empty message');
                    return;
                }

                const messageData = JSON.parse(message.value.toString());

                switch (topic) {
                    case 'user.create':
                        await this.handleCreate(messageData);
                        break;
                    case 'user.update':
                        await this.handleUpdate(messageData);
                        break;
                    case 'user.delete':
                        await this.handleDelete(messageData);
                        break;
                    case 'user.getById':
                        await this.handleGetById(messageData);
                        break;
                    default:
                        this.logger.warn(`❌ Unknown topic: ${topic}`);
                }
            },
        });
    }

    // ✅ Handle Create User
    private async handleCreate(messageData: any) {
        try {

            this.logger.log(`✅ User Created: ${messageData.userId}`);

            await this.producer.send({
                topic: 'user.create.response',
                messages: [{ value: JSON.stringify({ message: 'User created successfully', userId: messageData.userId }) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error creating user: ${error.message}`, error.stack);
        }
    }

    // ✅ Handle Update User
    private async handleUpdate(messageData: any) {
        try {
            const { userId, ...updateData } = messageData;
            const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });

            if (!updatedUser) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            this.logger.log(`🔄 User Updated: ${updatedUser._id}`);

            await this.producer.send({
                topic: 'user.update.response',
                messages: [{ value: JSON.stringify(updatedUser) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error updating user: ${error.message}`, error.stack);
        }
    }

    // ✅ Handle Delete User
    private async handleDelete(messageData: any) {
        try {
            const { userId } = messageData;

            this.logger.log(`🔍 Checking if user exists before deleting: ${userId}`);

            // Check if student exists before deleting
            const existingUser = await this.userModel.findById(userId);
            if (!existingUser) {
                this.logger.warn(`⚠️ User with ID ${userId} already deleted or not found.`);

                // 🔥 Even if already deleted, send success message to Kafka
                await this.producer.send({
                    topic: 'student.delete.response',
                    messages: [{ value: JSON.stringify({ userId, deleted: true }) }],
                });

                return; // No need to delete again
            }

            // ✅ Delete user if found
            await this.userModel.findByIdAndDelete(userId);
            this.logger.log(`🗑️ User Deleted: ${userId}`);

            // ✅ Send Kafka success message
            await this.producer.send({
                topic: 'user.delete.response',
                messages: [{ value: JSON.stringify({ userId, deleted: true }) }],
            });

        } catch (error) {
            this.logger.error(`🚨 Error deleting user: ${error.message}`, error.stack);
        }
    }


    // ✅ Handle Get User by ID
    private async handleGetById(messageData: any) {
        try {
            const { userId } = messageData;
            const user = await this.userModel.findById(userId);

            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            this.logger.log(`📌 User Found: ${user._id}`);

            await this.producer.send({
                topic: 'user.getById.response',
                messages: [{ value: JSON.stringify(user) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error fetching user by ID: ${error.message}`, error.stack);
        }
    }
}
