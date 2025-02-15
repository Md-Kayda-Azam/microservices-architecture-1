import { Injectable, OnModuleInit, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Kafka } from "kafkajs";
import { Parent, ParentDocument } from "../model/parent.model";

@Injectable()
export class KafkaConsumer implements OnModuleInit {
    private kafka = new Kafka({ brokers: ['kafka:9092'] });
    private consumer = this.kafka.consumer({ groupId: 'parent-service' });
    private producer = this.kafka.producer();
    private readonly logger = new Logger(KafkaConsumer.name);

    constructor(@InjectModel(Parent.name) private parentModel: Model<ParentDocument>) { }

    async onModuleInit() {
        await this.consumer.connect();
        await this.producer.connect();

        // Subscribe to different topics
        await this.consumer.subscribe({ topic: 'parent.create', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'parent.update', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'parent.delete', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'parent.getById', fromBeginning: true });

        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                if (!message.value) {
                    this.logger.warn('⚠️ Received empty message');
                    return;
                }

                const messageData = JSON.parse(message.value.toString());

                switch (topic) {
                    case 'parent.create':
                        await this.handleCreate(messageData);
                        break;
                    case 'parent.update':
                        await this.handleUpdate(messageData);
                        break;
                    case 'parent.delete':
                        await this.handleDelete(messageData);
                        break;
                    case 'parent.getById':
                        await this.handleGetById(messageData);
                        break;
                    default:
                        this.logger.warn(`❌ Unknown topic: ${topic}`);
                }
            },
        });
    }

    // ✅ Handle Create Parent
    private async handleCreate(messageData: any) {
        try {
            // Log or process the incoming event as needed
            this.logger.log(`✅ Parent Created: ${messageData.parentId}`);

            // If you only need to send a response without saving data
            await this.producer.send({
                topic: 'parent.create.response',
                messages: [{ value: JSON.stringify({ message: 'Parent created successfully', parentId: messageData.parentId }) }],
            });

        } catch (error) {
            this.logger.error(`🚨 Error processing parent creation: ${error.message}`, error.stack);
        }
    }


    // ✅ Handle Update Parent
    private async handleUpdate(messageData: any) {
        try {
            const { parentId, ...updateData } = messageData;
            const updatedParent = await this.parentModel.findByIdAndUpdate(parentId, updateData, { new: true });

            if (!updatedParent) {
                throw new NotFoundException(`Parent with ID ${parentId} not found`);
            }

            this.logger.log(`🔄 Parent Updated: ${updatedParent._id}`);

            await this.producer.send({
                topic: 'parent.update.response',
                messages: [{ value: JSON.stringify(updatedParent) }],
            });

        } catch (error) {
            this.logger.error(`🚨 Error updating parent: ${error.message}`, error.stack);
        }
    }

    // ✅ Handle Delete Parent
    private async handleDelete(messageData: any) {
        try {
            const { parentId } = messageData;
            const deletedParent = await this.parentModel.findByIdAndDelete(parentId);

            if (!deletedParent) {
                throw new NotFoundException(`Parent with ID ${parentId} not found`);
            }

            this.logger.log(`🗑️ Parent Deleted: ${deletedParent._id}`);

            await this.producer.send({
                topic: 'parent.delete.response',
                messages: [{ value: JSON.stringify({ parentId, deleted: true }) }],
            });

        } catch (error) {
            this.logger.error(`🚨 Error deleting parent: ${error.message}`, error.stack);
        }
    }

    // ✅ Handle Get Parent by ID
    private async handleGetById(messageData: any) {
        try {
            const { parentId } = messageData;
            const parent = await this.parentModel.findById(parentId);

            if (!parent) {
                throw new NotFoundException(`Parent with ID ${parentId} not found`);
            }

            this.logger.log(`📌 Parent Found: ${parent._id}`);

            await this.producer.send({
                topic: 'parent.getById.response',
                messages: [{ value: JSON.stringify(parent) }],
            });

        } catch (error) {
            this.logger.error(`🚨 Error fetching parent by ID: ${error.message}`, error.stack);
        }
    }
}
