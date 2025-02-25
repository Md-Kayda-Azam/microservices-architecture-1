import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kafka } from 'kafkajs';
import { Permission, PermissionDocument } from '../model/permission.model';

@Injectable()
export class KafkaConsumer implements OnModuleInit {
  private kafka = new Kafka({ brokers: ['kafka:9092'] });
  private consumer = this.kafka.consumer({ groupId: 'permission-service' });
  private producer = this.kafka.producer();
  private readonly logger = new Logger(KafkaConsumer.name);

  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();

    // Subscribe to different topics
    await this.consumer.subscribe({
      topic: 'permission.create',
      fromBeginning: true,
    });
    await this.consumer.subscribe({
      topic: 'permission.update',
      fromBeginning: true,
    });
    await this.consumer.subscribe({
      topic: 'permission.delete',
      fromBeginning: true,
    });
    await this.consumer.subscribe({
      topic: 'permission.getById',
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
          case 'permission.create':
            await this.handleCreate(messageData);
            break;
          case 'permission.update':
            await this.handleUpdate(messageData);
            break;
          case 'permission.delete':
            await this.handleDelete(messageData);
            break;
          case 'permission.getById':
            await this.handleGetById(messageData);
            break;

          default:
            this.logger.warn(`❌ Unknown topic: ${topic}`);
        }
      },
    });
  }

  // ✅ Handle Create Permission
  private async handleCreate(messageData: any) {
    try {
      // Log or process the incoming event as needed
      this.logger.log(`✅ Permission Created: ${messageData.permissionId}`);

      // If you only need to send a response without saving data
      await this.producer.send({
        topic: 'permission.create.response',
        messages: [
          {
            value: JSON.stringify({
              message: 'Permission created successfully',
              permissionId: messageData.permissionId,
            }),
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `🚨 Error processing permission creation: ${error.message}`,
        error.stack,
      );
    }
  }

  // ✅ Handle Update Permission
  private async handleUpdate(messageData: any) {
    try {
      const { permissionId, ...updateData } = messageData;
      const updatedpermission = await this.permissionModel.findByIdAndUpdate(
        permissionId,
        updateData,
        { new: true },
      );

      if (!updatedpermission) {
        throw new NotFoundException(
          `Permission with ID ${permissionId} not found`,
        );
      }

      this.logger.log(`🔄 Permission Updated: ${updatedpermission._id}`);

      await this.producer.send({
        topic: 'permission.update.response',
        messages: [{ value: JSON.stringify(updatedpermission) }],
      });
    } catch (error) {
      this.logger.error(
        `🚨 Error updating permission: ${error.message}`,
        error.stack,
      );
    }
  }

  // ✅ Handle Delete Permission
  private async handleDelete(messageData: any) {
    try {
      const { permissionId } = messageData;

      this.logger.log(
        `🔍 Checking if permission exists before deleting: ${permissionId}`,
      );

      // Check if permission exists before deleting
      const existingPermission =
        await this.permissionModel.findById(permissionId);
      if (!existingPermission) {
        this.logger.warn(
          `⚠️ Permission with ID ${permissionId} already deleted or not found.`,
        );

        // 🔥 Send success message even if already deleted
        await this.producer.send({
          topic: 'permission.delete.response',
          messages: [
            { value: JSON.stringify({ permissionId, deleted: true }) },
          ],
        });

        return; // No need to delete again
      }

      // ✅ Delete permission if found
      await this.permissionModel.findByIdAndDelete(permissionId);
      this.logger.log(`🗑️ Permission Deleted: ${permissionId}`);

      // ✅ Send Kafka success message
      await this.producer.send({
        topic: 'permission.delete.response',
        messages: [{ value: JSON.stringify({ permissionId, deleted: true }) }],
      });
    } catch (error) {
      this.logger.error(
        `🚨 Error deleting permission: ${error.message}`,
        error.stack,
      );
    }
  }

  // ✅ Handle Get Permission by ID
  private async handleGetById(messageData: any) {
    try {
      const { permissionId } = messageData;
      const permission = await this.permissionModel.findById(permissionId);

      if (!permission) {
        throw new NotFoundException(
          `Permission with ID ${permissionId} not found`,
        );
      }

      this.logger.log(`📌 Permission Found: ${permission._id}`);

      await this.producer.send({
        topic: 'permission.getById.response',
        messages: [{ value: JSON.stringify(permission) }],
      });
    } catch (error) {
      this.logger.error(
        `🚨 Error fetching permission by ID: ${error.message}`,
        error.stack,
      );
    }
  }
}
