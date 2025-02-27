import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from './kafka.module';
import { User, UserSchema } from './model/user.model';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    // KafkaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Q7k9P2mX4vR8tW5wY3nF6jH0eD9cA9bB',
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forRoot(
      process.env.MONGO_URL ??
        'mongodb+srv://azam:azam@cluster0.vgsmn.mongodb.net/test-project',
    ),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      context: ({ req }) => ({ req }), // req পাস করো
      debug: true,
      playground: true,
    }),
  ],
  providers: [UserResolver, UserService, JwtStrategy],
  exports: [MongooseModule],
})
export class UserModule {}
