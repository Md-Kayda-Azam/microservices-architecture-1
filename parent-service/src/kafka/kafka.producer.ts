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

    async connectProducer() {
        await this.producer.connect();
        this.logger.log('🚀 Kafka Producer Connected');
    }

    async sendParentCreatedEvent(parent: any) {
        await this.sendMessage('parent.create', parent);
        this.logger.log(`📢 Parent Created Event Sent: ${parent.parentId}`);
    }

    async sendParentUpdatedEvent(parentId: string, updatedFields: any) {
        await this.sendMessage('parent.update', { parentId, updatedFields });
        this.logger.log(`📢 Parent Updated Event Sent: ${parentId}`);
    }

    async sendParentDeletedEvent(parentId: string) {
        await this.sendMessage('parent.delete', { parentId });
        this.logger.log(`🗑️ Parent Deleted Event Sent: ${parentId}`);
    }

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
