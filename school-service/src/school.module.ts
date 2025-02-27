import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolResolver } from './school.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from './model/school.model';
import { KafkaModule } from './kafka.module';

@Module({
  imports: [
    KafkaModule,
    MongooseModule.forRoot("mongodb+srv://azam:azam@cluster0.vgsmn.mongodb.net/test-project"),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      debug: true,
      playground: true,
    }),
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
  ],
  providers: [SchoolResolver, SchoolService],
})
export class SchoolModule { }
