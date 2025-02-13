import { NestFactory } from '@nestjs/core';
import { SchoolModule } from './school.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(SchoolModule);

  // Kafka Microservice Configuration
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'], // Kafka broker address
      },
      consumer: {
        groupId: 'school-service', // Group ID for this service
      },
    },
  });

  // Start the application and listen for incoming requests
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();