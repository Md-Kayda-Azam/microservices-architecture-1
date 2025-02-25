import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kafka } from 'kafkajs';
import { Role, RoleDocument } from '../model/role.model';

@Injectable()
export class KafkaConsumer implements OnModuleInit {
  private kafka = new Kafka({ brokers: ['kafka:9092'] });
  private consumer = this.kafka.consumer({ groupId: 'role-service' });
  private producer = this.kafka.producer();
  private readonly logger = new Logger(KafkaConsumer.name);

  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();

    // Subscribe to different topics
    await this.consumer.subscribe({
      topic: 'role.create',
      fromBeginning: true,
    });
    await this.consumer.subscribe({
      topic: 'role.update',
      fromBeginning: true,
    });
    await this.consumer.subscribe({
      topic: 'role.delete',
      fromBeginning: true,
    });
    await this.consumer.subscribe({
      topic: 'role.getById',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) {
          this.logger.warn('⚠️ Received empty message');
          return;
        }

        const messageData = JSON.parse(message.value.toString());

        switch (topic) {
          case 'role.create':
            await this.handleCreate(messageData);
            break;
          case 'role.update':
            await this.handleUpdate(messageData);
            break;
          case 'role.delete':
            await this.handleDelete(messageData);
            break;
          case 'role.getById':
            await this.handleGetById(messageData);
            break;
          default:
            this.logger.warn(`❌ Unknown topic: ${topic}`);
        }
      },
    });
  }

  // ✅ Handle Create Role
  private async handleCreate(messageData: any) {
    try {
      // Log or process the incoming event as needed
      this.logger.log(`✅ Role Created successfully: ${messageData.roleId}`);

      // If you only need to send a response without saving data
      await this.producer.send({
        topic: 'role.create.response',
        messages: [
          {
            value: JSON.stringify({
              message: 'Role created successfully',
              roleId: messageData.roleId,
            }),
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `🚨 Error processing role creation: ${error.message}`,
        error.stack,
      );
    }
  }

  // ✅ Handle Update Role
  private async handleUpdate(messageData: any) {
    try {
      const { roleId, ...updateData } = messageData;
      const updatedRole = await this.roleModel.findByIdAndUpdate(
        roleId,
        updateData,
        { new: true },
      );

      if (!updatedRole) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      this.logger.log(`🔄 Role Updated successfully: ${updatedRole._id}`);

      await this.producer.send({
        topic: 'role.update.response',
        messages: [
          {
            value: JSON.stringify({
              updatedRole: updatedRole._id,
              message: 'Role updated successfully',
            }),
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `🚨 Error updating role: ${error.message}`,
        error.stack,
      );
    }
  }

  // ✅ Handle Delete Role
  private async handleDelete(messageData: any) {
    try {
      const { roleId } = messageData;

      this.logger.log(`🔍 Checking if role exists before deleting: ${roleId}`);

      // Check if Role exists before deleting
      const existingRole = await this.roleModel.findById(roleId);
      if (!existingRole) {
        this.logger.warn(
          `⚠️ Role with ID ${roleId} already deleted or not found.`,
        );

        // 🔥 Send success message even if already deleted
        await this.producer.send({
          topic: 'role.delete.response',
          messages: [{ value: JSON.stringify({ roleId, deleted: true }) }],
        });

        return; // No need to delete again
      }

      // ✅ Delete role if found
      await this.roleModel.findByIdAndDelete(roleId);
      this.logger.log(`🗑️ Role Deleted: ${roleId}`);

      // ✅ Send Kafka success message
      await this.producer.send({
        topic: 'role.delete.response',
        messages: [{ value: JSON.stringify({ roleId, deleted: true }) }],
      });
    } catch (error) {
      this.logger.error(
        `🚨 Error deleting Role: ${error.message}`,
        error.stack,
      );
    }
  }

  // ✅ Handle Get Role by ID
  private async handleGetById(messageData: any) {
    try {
      const { roleId } = messageData;
      const role = await this.roleModel.findById(roleId);

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      this.logger.log(`📌 Role Found: ${role._id}`);

      await this.producer.send({
        topic: 'role.getById.response',
        messages: [{ value: JSON.stringify(role) }],
      });
    } catch (error) {
      this.logger.error(
        `🚨 Error fetching role by ID: ${error.message}`,
        error.stack,
      );
    }
  }
}
