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

  async sendRoleCreatedEvent(role: any) {
    await this.sendMessage('role.create', role);
    this.logger.log(`📢 Role Created Event Sent: ${role.roleId}`);
  }

  async sendRoleUpdatedEvent(roleId: string, updatedFields: any) {
    await this.sendMessage('role.update', {
      roleId,
      updatedFields,
    });
    this.logger.log(`📢 Role Updated Event Sent: ${roleId}`);
  }

  async sendRoleDeletedEvent(roleId: string) {
    await this.sendMessage('role.delete', { roleId });
    this.logger.log(`🗑️ Role Deleted Event Sent: ${roleId}`);
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
