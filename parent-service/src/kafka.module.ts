import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaProducer } from './kafka/kafka.producer';
import { KafkaConsumer } from './kafka/kafka.consumer';
import { Parent, ParentSchema } from './model/parent.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Parent.name, schema: ParentSchema }]), // ✅ StudentModel Import করা হলো
    ],
    providers: [KafkaProducer, KafkaConsumer],
    exports: [KafkaProducer, KafkaConsumer], // ✅ Export করা হলো যাতে অন্য মডিউলে ব্যবহার করা যায়
})
export class KafkaModule { }

