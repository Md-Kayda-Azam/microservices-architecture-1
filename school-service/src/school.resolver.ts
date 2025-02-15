import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SchoolService } from './school.service';

import { Types } from 'mongoose';
import { School } from './model/school.model';
import { CreateSchoolDto } from './dto/create-school.input';
import { UpdateSchoolDto } from './dto/update-school.input';

@Resolver(() => School)
export class SchoolResolver {
  constructor(private readonly schoolService: SchoolService) { }

  @Mutation(() => School)
  createSchool(@Args('createSchoolInput') createSchoolInput: CreateSchoolDto) {
    return this.schoolService.create(createSchoolInput);
  }

  @Query(() => [School], { name: 'schools' })  // Plural name for better GraphQL convention
  findAll() {
    return this.schoolService.findAll();
  }

  @Query(() => School, { name: 'school' })
  findOne(@Args('id', { type: () => String }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.schoolService.findOne(id);
  }

  @Mutation(() => School)
  updateSchool(@Args('id') id: string, @Args('updateSchoolInput') updateSchoolInput: UpdateSchoolDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.schoolService.update(id, updateSchoolInput);
  }

  @Mutation(() => School)
  removeSchool(@Args('id', { type: () => ID }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.schoolService.remove(id);
  }
}