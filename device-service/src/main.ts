import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DeviceModule } from './device.module';

async function bootstrap() {
  const app = await NestFactory.create(DeviceModule);
  const configService = app.get(ConfigService);
  // Kafka Microservice Configuration for Permission Service
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
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
