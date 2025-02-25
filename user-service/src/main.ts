import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserModule } from './user.module';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);

  // Kafka Microservice Configuration for User Service
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       brokers: ['kafka:9092'], // Kafka broker address (Docker container or server)
  //     },
  //     consumer: {
  //       groupId: 'user-service', // Group ID for this service
  //     },
  //   },
  // });

  // Start the microservices
  // await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004);
}

bootstrap();
