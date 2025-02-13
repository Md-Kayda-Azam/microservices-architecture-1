import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Kafka } from "kafkajs";
import { School, SchoolDocument } from "../model/school.model";

@Injectable()
export class KafkaConsumer implements OnModuleInit {
    private kafka = new Kafka({ brokers: ['kafka:9092'] });
    private consumer = this.kafka.consumer({ groupId: 'school-service' });
    private producer = this.kafka.producer();
    private readonly logger = new Logger(KafkaConsumer.name);

    constructor(@InjectModel(School.name) private schoolModel: Model<SchoolDocument>) { }

    async onModuleInit() {
        await this.consumer.connect();
        await this.producer.connect();
        await this.consumer.subscribe({ topic: 'school.getById', fromBeginning: true });

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) {
                    this.logger.warn('⚠️ Received empty message');
                    return;
                }

                const { schoolId } = JSON.parse(message.value.toString());

                try {
                    // Fetch the school data from MongoDB
                    const school = await this.schoolModel.findById(schoolId).exec();
                    console.log(school, "School Service Data");
                    if (school) {
                        this.logger.log(`📢 Sending School Data for ID: ${schoolId}`);

                        await this.producer.send({
                            topic: 'school.getById.response',
                            messages: [{ value: JSON.stringify(school) }],
                        });
                    } else {
                        this.logger.warn(`❌ School with ID: ${schoolId} not found`);
                    }
                } catch (error) {
                    this.logger.error(`🚨 Error processing school data for ID: ${schoolId}`, error.stack);
                }
            },
        });
    }
}
