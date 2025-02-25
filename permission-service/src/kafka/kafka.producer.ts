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

  async sendPermissionCreatedEvent(permission: any) {
    await this.sendMessage('permission.create', permission);
    this.logger.log(
      `📢 Permission Created Event Sent: ${permission.permissionId}`,
    );
  }

  async sendPermissionUpdatedEvent(permissionId: string, updatedFields: any) {
    await this.sendMessage('permission.update', {
      permissionId,
      updatedFields,
    });
    this.logger.log(`📢 Permission Updated Event Sent: ${permissionId}`);
  }

  async sendPermissionDeletedEvent(permissionId: string) {
    await this.sendMessage('permission.delete', { permissionId });
    this.logger.log(`🗑️ Permission Deleted Event Sent: ${permissionId}`);
  }

  public async sendMessage(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      this.logger.log(`📤 Message sent to topic: ${topic}`);
    } catch (error) {
      this.logger.error(
        `❌ Error sending message to Kafka: ${error.message}`,
        error.stack,
      );
    }
  }
}
