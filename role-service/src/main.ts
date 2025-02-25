import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RoleModule } from './role.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(RoleModule);
  const configService = app.get(ConfigService);
  // Kafka Microservice Configuration for Permission Service
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'], // Kafka broker address (Docker container or server)
      },
      consumer: {
        groupId: 'role-service', // Group ID for this service
      },
    },
  });
  // Start the microservices
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT') ?? 3006);
}
bootstrap();
