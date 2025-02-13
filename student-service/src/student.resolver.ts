import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.input';
import { Student } from './model/student.model';
import { UpdateStudentDto } from './dto/update-student.input';


@Resolver(() => Student)
export class StudentResolver {
  constructor(private readonly StudentService: StudentService) { }

  @Mutation(() => Student)
  createStudent(@Args('createStudentInput') createStudentInput: CreateStudentDto) {
    return this.StudentService.create(createStudentInput);
  }

  @Query(() => [Student], { name: 'students' })  // Plural name for better GraphQL convention
  findAll() {
    return this.StudentService.findAll();
  }

  @Query(() => Student, { name: 'student' })
  findOne(@Args('id', { type: () => String }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.StudentService.findOne(id);
  }

  @Mutation(() => Student)
  updateStudent(@Args('updateStudentInput') updateStudentInput: UpdateStudentDto) {
    if (!Types.ObjectId.isValid(updateStudentInput.id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.StudentService.update(updateStudentInput.id, updateStudentInput);
  }

  @Mutation(() => Student)
  removeStudent(@Args('id', { type: () => ID }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.StudentService.remove(id);
  }
}