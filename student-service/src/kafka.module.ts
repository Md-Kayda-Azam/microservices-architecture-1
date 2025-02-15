import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaProducer } from './kafka/kafka.producer';
import { KafkaConsumer } from './kafka/kafka.consumer';
import { Student, StudentSchema } from './model/student.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]), // ✅ StudentModel Import করা হলো
    ],
    providers: [KafkaProducer, KafkaConsumer],
    exports: [KafkaProducer, KafkaConsumer], // ✅ Export করা হলো যাতে অন্য মডিউলে ব্যবহার করা যায়
})
export class KafkaModule { }

