import { Injectable, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaProducer {
    private readonly kafka = new Kafka({ brokers: ['kafka:9092'] });
    private readonly producer = this.kafka.producer();
    private readonly logger = new Logger(KafkaProducer.name);

    constructor() {
        this.connectProducer();
    }

    private async connectProducer() {
        try {
            await this.producer.connect();
            this.logger.log('🚀 Kafka Student Producer Connected');
        } catch (error) {
            this.logger.error(`❌ Kafka Connection Failed: ${error.message}`);
        }
    }

    // ✅ Student তৈরি হলে ইভেন্ট পাঠাবে
    public async sendStudentCreatedEvent(student: any) {
        await this.sendMessage('student.create', student);
        this.logger.log(`📢 Student Created Event Sent: ${student.studentId}`);
    }

    // ✅ Student আপডেট হলে ইভেন্ট পাঠাবে
    public async sendStudentUpdatedEvent(studentId: string, updatedFields: any) {
        await this.sendMessage('student.update', { studentId, updatedFields });
        this.logger.log(`📢 Student Updated Event Sent: ${studentId}`);
    }

    // ✅ Student মুছে ফেলা হলে ইভেন্ট পাঠাবে
    public async sendStudentDeletedEvent(studentId: string) {
        await this.sendMessage('student.delete', { studentId });
        this.logger.log(`🗑️ Student Deleted Event Sent: ${studentId}`);
    }

    // ✅ Reusable Kafka Message Sender
    public async sendMessage(topic: string, message: any) {
        try {
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(message) }],
            });
            this.logger.log(`📤 Message sent to topic: ${topic}`);
        } catch (error) {
            this.logger.error(`❌ Error sending message to Kafka: ${error.message}`, error.stack);
        }
    }
}
