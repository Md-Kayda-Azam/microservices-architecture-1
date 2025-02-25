import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './model/user.model';
import { KafkaProducer } from './kafka/kafka.producer';
import { KafkaConsumer } from './kafka/Kafka.consumer';



@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    providers: [KafkaProducer, KafkaConsumer],
    exports: [KafkaProducer, KafkaConsumer],
})
export class KafkaModule { }
