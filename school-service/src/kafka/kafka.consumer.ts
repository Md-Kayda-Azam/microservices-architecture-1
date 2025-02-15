import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kafka } from 'kafkajs';
import { School, SchoolDocument } from '../model/school.model';

@Injectable()
export class KafkaConsumer {
    private kafka = new Kafka({ brokers: ['kafka:9092'] });
    private consumer = this.kafka.consumer({ groupId: 'school-service' });
    private producer = this.kafka.producer();
    private readonly logger = new Logger(KafkaConsumer.name);

    constructor(@InjectModel(School.name) private schoolModel: Model<SchoolDocument>) { }

    async onModuleInit() {
        await this.consumer.connect();
        await this.producer.connect();

        // Subscribe to topics
        await this.consumer.subscribe({ topic: 'school.create', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'school.update', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'school.delete', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'school.getById', fromBeginning: true });


        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                if (!message.value) {
                    this.logger.warn('⚠️ Received empty message');
                    return;
                }

                const messageData = JSON.parse(message.value.toString());

                switch (topic) {
                    case 'school.create':
                        await this.handleCreate(messageData);
                        break;
                    case 'school.update':
                        await this.handleUpdate(messageData);
                        break;
                    case 'school.delete':
                        await this.handleDelete(messageData);
                        break;
                    case 'school.getById':
                        await this.handleGetById(messageData);
                        break;
                    default:
                        this.logger.warn(`❌ Unknown topic: ${topic}`);
                }
            },
        });
    }

    private async handleCreate(messageData: any) {
        try {

            this.logger.log(`✅ School Created: ${messageData.schoolId}`);

            await this.producer.send({
                topic: 'school.create.response',
                messages: [{ value: JSON.stringify({ message: 'Parent created successfully', schoolId: messageData.schoolId }) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error creating school: ${error.message}`, error.stack);
        }
    }

    private async handleUpdate(messageData: any) {
        try {
            const { schoolId, ...updateData } = messageData;
            const updatedSchool = await this.schoolModel.findByIdAndUpdate(schoolId, updateData, { new: true });

            if (!updatedSchool) {
                throw new NotFoundException(`School with ID ${schoolId} not found`);
            }

            this.logger.log(`🔄 School Updated: ${updatedSchool._id}`);

            await this.producer.send({
                topic: 'school.update.response',
                messages: [{ value: JSON.stringify(updatedSchool) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error updating school: ${error.message}`, error.stack);
        }
    }

    private async handleDelete(messageData: any) {
        try {
            const { schoolId } = messageData;
            const deletedSchool = await this.schoolModel.findByIdAndDelete(schoolId);

            if (!deletedSchool) {
                throw new NotFoundException(`School with ID ${schoolId} not found`);
            }

            this.logger.log(`🗑️ School Deleted: ${deletedSchool._id}`);

            await this.producer.send({
                topic: 'school.delete.response',
                messages: [{ value: JSON.stringify({ schoolId, deleted: true }) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error deleting school: ${error.message}`, error.stack);
        }
    }

    private async handleGetById(messageData: any) {
        const { schoolId } = messageData;
        try {
            const school = await this.schoolModel.findById(schoolId);
            if (!school) {
                throw new NotFoundException(`School with ID ${schoolId} not found`);
            }

            this.logger.log(`📚 Retrieved School: ${school._id}`);

            // Send response message with the school data
            await this.producer.send({
                topic: 'school.getById.response',
                messages: [{ value: JSON.stringify(school) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error retrieving school by ID: ${error.message}`, error.stack);
        }
    }
}
