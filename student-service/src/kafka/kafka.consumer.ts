import { Injectable, OnModuleInit, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Kafka } from "kafkajs";
import { Student, StudentDocument } from "../model/student.model";

@Injectable()
export class KafkaConsumer implements OnModuleInit {
    private kafka = new Kafka({ brokers: ['kafka:9092'] });
    private consumer = this.kafka.consumer({ groupId: 'student-service' });
    private producer = this.kafka.producer();
    private readonly logger = new Logger(KafkaConsumer.name);

    constructor(@InjectModel(Student.name) private studentModel: Model<StudentDocument>) { }

    async onModuleInit() {
        await this.consumer.connect();
        await this.producer.connect();

        // Subscribe to topics
        await this.consumer.subscribe({ topic: 'student.create', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'student.update', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'student.delete', fromBeginning: true });
        await this.consumer.subscribe({ topic: 'student.getById', fromBeginning: true });

        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                if (!message.value) {
                    this.logger.warn('⚠️ Received empty message');
                    return;
                }

                const messageData = JSON.parse(message.value.toString());

                switch (topic) {
                    case 'student.create':
                        await this.handleCreate(messageData);
                        break;
                    case 'student.update':
                        await this.handleUpdate(messageData);
                        break;
                    case 'student.delete':
                        await this.handleDelete(messageData);
                        break;
                    case 'student.getById':
                        await this.handleGetById(messageData);
                        break;
                    default:
                        this.logger.warn(`❌ Unknown topic: ${topic}`);
                }
            },
        });
    }

    // ✅ Handle Create Student
    private async handleCreate(messageData: any) {
        try {

            this.logger.log(`✅ Student Created: ${messageData.studentId}`);

            await this.producer.send({
                topic: 'student.create.response',
                messages: [{ value: JSON.stringify({ message: 'Student created successfully', studentId: messageData.studentId }) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error creating student: ${error.message}`, error.stack);
        }
    }

    // ✅ Handle Update Student
    private async handleUpdate(messageData: any) {
        try {
            const { studentId, ...updateData } = messageData;
            const updatedStudent = await this.studentModel.findByIdAndUpdate(studentId, updateData, { new: true });

            if (!updatedStudent) {
                throw new NotFoundException(`Student with ID ${studentId} not found`);
            }

            this.logger.log(`🔄 Student Updated: ${updatedStudent._id}`);

            await this.producer.send({
                topic: 'student.update.response',
                messages: [{ value: JSON.stringify(updatedStudent) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error updating student: ${error.message}`, error.stack);
        }
    }

    // ✅ Handle Delete Student
    private async handleDelete(messageData: any) {
        try {
            const { studentId } = messageData;
            const deletedStudent = await this.studentModel.findByIdAndDelete(studentId);

            if (!deletedStudent) {
                throw new NotFoundException(`Student with ID ${studentId} not found`);
            }

            this.logger.log(`🗑️ Student Deleted: ${deletedStudent._id}`);

            await this.producer.send({
                topic: 'student.delete.response',
                messages: [{ value: JSON.stringify({ studentId, deleted: true }) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error deleting student: ${error.message}`, error.stack);
        }
    }

    // ✅ Handle Get Student by ID
    private async handleGetById(messageData: any) {
        try {
            const { studentId } = messageData;
            const student = await this.studentModel.findById(studentId);

            if (!student) {
                throw new NotFoundException(`Student with ID ${studentId} not found`);
            }

            this.logger.log(`📌 Student Found: ${student._id}`);

            await this.producer.send({
                topic: 'student.getById.response',
                messages: [{ value: JSON.stringify(student) }],
            });
        } catch (error) {
            this.logger.error(`🚨 Error fetching student by ID: ${error.message}`, error.stack);
        }
    }
}
