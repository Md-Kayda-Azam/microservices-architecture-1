import { Injectable, OnModuleInit } from "@nestjs/common";
import { Kafka } from "kafkajs";

@Injectable()
export class KafkaProducer implements OnModuleInit {
    private kafka = new Kafka({ brokers: ['kafka:9092'] });
    private producer = this.kafka.producer();
    private consumer = this.kafka.consumer({ groupId: 'student-service' });

    async onModuleInit() {
        await this.producer.connect();
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: 'school.getById.response', fromBeginning: true });
    }

    async requestSchoolData(schoolId: string) {
        await this.producer.send({
            topic: 'school.getById',
            messages: [{ value: JSON.stringify({ schoolId }) }],
        });

        console.log(`📢 Requested School Data for ID: ${schoolId}`);

        return new Promise((resolve, reject) => {
            this.consumer.run({
                eachMessage: async ({ message }) => {
                    if (!message.value) return;
                    const schoolData = JSON.parse(message.value.toString());
                    console.log(schoolData, "Student Service school Data");

                    if (schoolData._id === schoolId) {
                        console.log(`✅ Received School Data for ID: ${schoolId}`);
                        resolve(schoolData);
                    }
                },
            });
        });
    }
}
