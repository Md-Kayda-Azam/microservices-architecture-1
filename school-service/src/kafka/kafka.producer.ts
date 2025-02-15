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
            this.logger.log('🚀 Kafka School Producer Connected');
        } catch (error) {
            this.logger.error(`❌ Kafka Connection Failed: ${error.message}`);
        }
    }

    public async sendSchoolCreatedEvent(school: any) {
        await this.sendMessage('school.create', school);
        this.logger.log(`📢 School Created Event Sent: ${school.schoolId}`);
    }

    public async sendSchoolUpdatedEvent(schoolId: string, updatedFields: any) {
        await this.sendMessage('school.update', { schoolId, updatedFields });
        this.logger.log(`📢 School Updated Event Sent: ${schoolId}`);
    }

    public async sendSchoolDeletedEvent(schoolId: string) {
        await this.sendMessage('school.delete', { schoolId });
        this.logger.log(`🗑️ School Deleted Event Sent: ${schoolId}`);
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
