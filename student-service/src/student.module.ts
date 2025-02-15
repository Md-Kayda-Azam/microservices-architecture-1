import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentResolver } from './student.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './model/student.model';
import { KafkaModule } from './kafka.module';

@Module({
  imports: [
    KafkaModule,
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    MongooseModule.forRoot("mongodb+srv://azam:azam@cluster0.vgsmn.mongodb.net/test-project"),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      debug: true,
      playground: true,
    }),
  ],
  providers: [StudentResolver, StudentService],
  exports: [MongooseModule],
})
export class StudentModule { }
