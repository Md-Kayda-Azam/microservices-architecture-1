import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './model/student.model';
import { CreateStudentDto } from './dto/create-student.input';
import { UpdateStudentDto } from './dto/update-student.input';
import { KafkaProducer } from './kafka/kafka.producer';


@Injectable()
export class StudentService {
  constructor(@InjectModel(Student.name) private readonly studentModel: Model<Student>,
    private readonly kafkaProducer: KafkaProducer) { }

  async create(createStudentInput: CreateStudentDto): Promise<Partial<Student>> {
    const { schoolId, ...otherData } = createStudentInput;

    // Kafka service call for fetching school data
    const schoolData: any = await this.kafkaProducer.requestSchoolData(schoolId);
    console.log(schoolData, "student service a school data");
    if (!schoolData) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    const school = {
      _id: schoolData._id,
      name: schoolData.name,
      address: schoolData.address,
      phoneNumber: schoolData.phoneNumber,
      email: schoolData.email
    };

    // Create and save the student
    const student = new this.studentModel({ ...otherData, schoolId });
    const savedStudent = await student.save();

    // Return the saved student along with full school info
    return {
      ...savedStudent.toObject(),
      school
    } as Partial<Student>; // ✅ Fixing the TypeScript error
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
    return updatedStudent;
  }

  async remove(id: string): Promise<Student> {
    const deletedStudent = await this.studentModel.findByIdAndDelete(id).exec();
    if (!deletedStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return deletedStudent;
  }
}