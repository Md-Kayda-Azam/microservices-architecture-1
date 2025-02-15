import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { ParentService } from './parent.service';
import { CreateParentInput } from './dto/create-parent.input';
import { UpdateParentInput } from './dto/update-parent.input';
import { Parent } from './model/parent.model';

@Resolver(() => Parent)
export class ParentResolver {
  constructor(private readonly parentService: ParentService) { }

  @Mutation(() => Parent)
  createParent(@Args('createParentInput') createParentInput: CreateParentInput) {
    return this.parentService.create(createParentInput);
  }

  @Query(() => [Parent], { name: 'parents' }) // Plural for better convention
  findAll() {
    return this.parentService.findAll();
  }

  @Query(() => Parent, { name: 'parent' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.parentService.findOne(id);
  }

  @Mutation(() => Parent)
  updateParent(@Args('updateParentInput') updateParentInput: UpdateParentInput) {
    if (!Types.ObjectId.isValid(updateParentInput.id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.parentService.update(updateParentInput.id, updateParentInput);
  }

  @Mutation(() => Parent)
  removeParent(@Args('id', { type: () => ID }) id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }
    return this.parentService.remove(id);
  }
}
