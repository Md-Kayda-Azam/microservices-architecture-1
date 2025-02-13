import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { School } from './model/school.model';
import { UpdateSchoolDto } from './dto/update-school.input';
import { CreateSchoolDto } from './dto/create-school.input';

@Injectable()
export class SchoolService {
  constructor(@InjectModel(School.name) private readonly schoolModel: Model<School>) { }

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const newSchool = new this.schoolModel(createSchoolDto);
    return newSchool.save();
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

  async update(id: string, updateSchoolInput: UpdateSchoolDto): Promise<School> {
    const updatedSchool = await this.schoolModel.findByIdAndUpdate(id, updateSchoolInput, { new: true }).exec();
    if (!updatedSchool) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
    return updatedSchool;
  }

  async remove(id: string): Promise<School> {
    const deletedSchool = await this.schoolModel.findByIdAndDelete(id).exec();
    if (!deletedSchool) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
    return deletedSchool;
  }
}