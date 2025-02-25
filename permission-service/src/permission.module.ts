import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PermissionResolver } from './permission.resolver';
import { PermissionService } from './permission.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './model/permission.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaModule } from './kafka.module';

@Module({
  imports: [
    KafkaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb+srv://azam:azam@cluster0.vgsmn.mongodb.net/test-project',
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      debug: true,
      playground: true,
    }),
  ],
  providers: [PermissionResolver, PermissionService],
})
export class PermissionModule {}
