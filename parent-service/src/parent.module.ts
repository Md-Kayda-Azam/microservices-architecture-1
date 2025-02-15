import { Module } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentResolver } from './parent.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Parent, ParentSchema } from './model/parent.model';
import { KafkaModule } from './kafka.module';

@Module({
  imports: [
    KafkaModule,
    MongooseModule.forFeature([{ name: Parent.name, schema: ParentSchema }]),
    MongooseModule.forRoot("mongodb+srv://azam:azam@cluster0.vgsmn.mongodb.net/test-project"),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      debug: true,
      playground: true
    }),

  ],
  providers: [ParentResolver, ParentService],
})
export class ParentModule { }
