import { NestFactory } from '@nestjs/core';
import { ParentModule } from './parent.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ParentModule);

  // Kafka Microservice Configuration for Parent Service
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'], // Kafka broker address (Docker container or server)
      },
      consumer: {
        groupId: 'parent-service', // Group ID for this service
      },
    },
  });

  // Start the microservices
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
