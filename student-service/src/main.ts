import { NestFactory } from '@nestjs/core';
import { StudentModule } from './student.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(StudentModule);

  // Kafka Microservice Configuration for Student Service
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'], // Kafka broker address (Docker container or server)
      },
      consumer: {
        groupId: 'student-service', // Group ID for this service
      },
    },
  });

  // Start the microservices
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3002);
}

bootstrap();