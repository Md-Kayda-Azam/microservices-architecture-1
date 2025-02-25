import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School, SchoolDocument } from './model/school.model';
import { CreateSchoolDto } from './dto/create-school.input';
import { UpdateSchoolDto } from './dto/update-school.input';
import { KafkaProducer } from './kafka/kafka.producer'; // Assuming Kafka producer is imported here

@Injectable()
export class SchoolService {
  private readonly logger = new Logger(SchoolService.name);

  constructor(
    @InjectModel(School.name)
    private readonly schoolModel: Model<SchoolDocument>,
    private readonly kafkaProducer: KafkaProducer, // Inject Kafka producer
  ) {}

  async create(createSchoolInput: CreateSchoolDto): Promise<Partial<School>> {
    try {
      // Create and save the school
      const school = new this.schoolModel(createSchoolInput);
      const savedSchool = await school.save();

      // Send event to Kafka topic using the new event method
      await this.kafkaProducer.sendSchoolCreatedEvent({
        schoolId: savedSchool._id,
        name: savedSchool.name,
        address: savedSchool.address,
        email: savedSchool.email,
        phoneNumber: savedSchool.phoneNumber,
      });

      return savedSchool.toObject();
    } catch (error) {
      throw new InternalServerErrorException(
        `School creation failed: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<School[]> {
    return this.schoolModel.find().exec();
  }

  async findOne(id: string): Promise<School> {
    const school = await this.schoolModel.findById(id).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
    return school;
  }

  async update(
    id: string,
    updateSchoolInput: UpdateSchoolDto,
  ): Promise<School> {
    const updatedSchool = await this.schoolModel
      .findByIdAndUpdate(id, updateSchoolInput, { new: true })
      .exec();
    if (!updatedSchool) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }

    // Send event to Kafka topic using the new event method
    await this.kafkaProducer.sendSchoolUpdatedEvent(
      updatedSchool._id.toString(),
      updateSchoolInput,
    );

    this.logger.log(`🔄 School Updated: ${updatedSchool._id}`);

    return updatedSchool;
  }

  async remove(id: string): Promise<School> {
    const deletedSchool = await this.schoolModel.findByIdAndDelete(id).exec();
    if (!deletedSchool) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }

    // Send event to Kafka topic using the new event method
    await this.kafkaProducer.sendSchoolDeletedEvent(
      deletedSchool._id.toString(),
    );

    this.logger.log(`🗑️ School Deleted: ${deletedSchool._id}`);

    return deletedSchool;
  }
}
