import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './model/student.model';
import { CreateStudentDto } from './dto/create-student.input';
import { UpdateStudentDto } from './dto/update-student.input';
import { KafkaProducer } from './kafka/kafka.producer';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectModel(Student.name) private readonly studentModel: Model<StudentDocument>,
    private readonly kafkaProducer: KafkaProducer
  ) { }

  async create(createStudentInput: CreateStudentDto): Promise<Partial<Student>> {
    try {
      const { schoolId, ...otherData } = createStudentInput;

      // Create and save the student
      const student = new this.studentModel({ ...otherData, schoolId });
      const savedStudent = await student.save();

      // Send event to Kafka topic via KafkaProducer
      await this.kafkaProducer.sendStudentCreatedEvent({
        studentId: savedStudent._id,
        schoolId: savedStudent.schoolId,
        name: savedStudent.name,
        address: savedStudent.name,
        phoneNumber: savedStudent.phoneNumber,
        email: savedStudent.email,
      });

      return savedStudent.toObject();
    } catch (error) {
      throw new InternalServerErrorException(`Student creation failed: ${error.message}`);
    }
  }

  async findAll(): Promise<Student[]> {
    return this.studentModel.find().exec();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(id: string, updateStudentInput: UpdateStudentDto): Promise<Student> {
    const updatedStudent = await this.studentModel.findByIdAndUpdate(id, updateStudentInput, { new: true }).exec();
    if (!updatedStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Send event to Kafka topic via KafkaProducer
    await this.kafkaProducer.sendStudentUpdatedEvent(updatedStudent._id, updateStudentInput);

    this.logger.log(`🔄 Student Updated: ${updatedStudent._id}`);

    return updatedStudent;
  }

  async remove(id: string): Promise<Student> {
    const deletedStudent = await this.studentModel.findByIdAndDelete(id).exec();
    if (!deletedStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Send event to Kafka topic via KafkaProducer
    await this.kafkaProducer.sendStudentDeletedEvent(deletedStudent._id);

    this.logger.log(`🗑️ Student Deleted: ${deletedStudent._id}`);

    return deletedStudent;
  }
}
