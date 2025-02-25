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
            this.logger.log('🚀 Kafka User Producer Connected');
        } catch (error) {
            this.logger.error(`❌ Kafka Connection Failed: ${error.message}`);
        }
    }

    // ✅ User তৈরি হলে ইভেন্ট পাঠাবে
    public async sendUserCreatedEvent(user: any) {
        await this.sendMessage('user.create', user);
        this.logger.log(`📢 User Created Event Sent: ${user.userId}`);
    }

    // ✅ User আপডেট হলে ইভেন্ট পাঠাবে
    public async sendUserUpdatedEvent(userId: string, updatedFields: any) {
        await this.sendMessage('user.update', { userId, updatedFields });
        this.logger.log(`📢 User Updated Event Sent: ${userId}`);
    }

    // ✅ User মুছে ফেলা হলে ইভেন্ট পাঠাবে
    public async sendUserDeletedEvent(userId: string) {
        await this.sendMessage('user.delete', { userId });
        this.logger.log(`🗑️ User Deleted Event Sent: ${userId}`);
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
