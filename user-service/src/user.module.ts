import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from './kafka.module';
import { User, UserSchema } from './model/user.model';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    // KafkaModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forRoot(
      // 'mongodb+srv://azam:azam@cluster0.vgsmn.mongodb.net/test-project',
      'mongodb+srv://azam:azam@cluster0.vgsmn.mongodb.net/test-project',
    ),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      debug: true,
      playground: true,
    }),
  ],
  providers: [UserResolver, UserService],
  exports: [MongooseModule],
})
export class UserModule {}
