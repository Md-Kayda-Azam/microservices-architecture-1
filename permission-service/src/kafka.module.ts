import { Module } from '@nestjs/common';
import { KafkaProducer } from './kafka/kafka.producer';
import { KafkaConsumer } from './kafka/kafka.consumer';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './model/permission.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Permission.name, schema: PermissionSchema }]),
    ],
    providers: [KafkaProducer, KafkaConsumer],
    exports: [KafkaProducer, KafkaConsumer], // ✅ Export করা হলো যাতে অন্য মডিউলে ব্যবহার করা যায়
})
export class KafkaModule { }

