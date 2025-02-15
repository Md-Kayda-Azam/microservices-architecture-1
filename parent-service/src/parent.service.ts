import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parent, ParentDocument } from './model/parent.model';
import { CreateParentInput } from './dto/create-parent.input';
import { UpdateParentInput } from './dto/update-parent.input';
import { KafkaProducer } from './kafka/kafka.producer';

@Injectable()
export class ParentService {

  private readonly logger = new Logger(ParentService.name);

  constructor(
    @InjectModel(Parent.name) private readonly parentModel: Model<ParentDocument>,
    private readonly kafkaProducer: KafkaProducer,
  ) { }

  async create(createParentInput: CreateParentInput): Promise<Partial<Parent>> {
    try {


      // 1️⃣ Check if Parent already exists in DB
      const existingParent = await this.parentModel.findOne({ email: createParentInput.email, schoolId: createParentInput.schoolId }).exec();
      if (existingParent) {
        this.logger.warn(`⚠️ Parent already exists with email: ${createParentInput.email} for schoolId: ${createParentInput.schoolId}`);
        return existingParent.toObject();
      }


      const parent = new this.parentModel(createParentInput);
      const savedParent = await parent.save();

      // Using the sendParentCreatedEvent method here
      await this.kafkaProducer.sendParentCreatedEvent({
        parentId: savedParent._id,
        name: savedParent.name,
        address: savedParent.address,
        email: savedParent.email,
        phoneNumber: savedParent.phoneNumber,
        schoolId: savedParent.schoolId,
        studentId: savedParent.studentId,
      });

      return savedParent.toObject();
    } catch (error) {
      throw new InternalServerErrorException(`Parent creation failed: ${error.message}`);
    }
  }

  async findAll(): Promise<Parent[]> {
    return this.parentModel.find().exec();
  }

  async findOne(id: string): Promise<Parent> {
    const parent = await this.parentModel.findById(id).exec();
    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }
    return parent;
  }

  async update(id: string, updateParentInput: UpdateParentInput): Promise<Parent> {
    const updatedParent = await this.parentModel.findByIdAndUpdate(id, updateParentInput, { new: true }).exec();
    if (!updatedParent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    await this.kafkaProducer.sendParentUpdatedEvent(updatedParent._id, updateParentInput);

    return updatedParent;
  }

  async remove(id: string): Promise<Parent> {
    const deletedParent = await this.parentModel.findByIdAndDelete(id).exec();
    if (!deletedParent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    await this.kafkaProducer.sendParentDeletedEvent(deletedParent._id);

    return deletedParent;
  }

}
