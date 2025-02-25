import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService {
    private kafka = new Kafka({
        clientId: 'api-gateway',
        brokers: ['localhost:9092'],
    });

    producer = this.kafka.producer();
    consumer = this.kafka.consumer({ groupId: 'api-gateway-group' });

    async sendMessage(topic: string, message: any) {
        await this.producer.connect();
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        await this.producer.disconnect();
    }
}
