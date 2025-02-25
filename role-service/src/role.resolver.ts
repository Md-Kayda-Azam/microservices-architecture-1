import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from './model/role.model';
import { RoleService } from './role.service';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';

@Resolver(() => Role)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  // ✅ Create role with advanced validation
  @Mutation(() => Role)
  async createRole(@Args('createRoleInput') createRoleInput: CreateRoleInput) {
    console.log('Create Role Input:', createRoleInput);

    if (
      !createRoleInput ||
      !createRoleInput.name ||
      !createRoleInput.permissions
    ) {
      throw new BadRequestException('Both name and permissions are required.');
    }

    return this.roleService.create(createRoleInput);
  }

  // ✅ Find all roles
  @Query(() => [Role], { name: 'roles' })
  async findAll() {
    try {
      return await this.roleService.findAll();
    } catch (error) {
      throw new NotFoundException('No roles found.');
    }
  }

  // ✅ Find one role by ID with validation
  @Query(() => Role, { name: 'role' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    if (!id) {
      throw new BadRequestException('Role ID is required.');
    }

    // Validate the ID format
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new BadRequestException('Invalid Role ID format.');
    }

    try {
      return await this.roleService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }
  }

  // ✅ Update role with advanced validation
  @Mutation(() => Role)
  async updateRole(@Args('updateRoleInput') updateRoleInput: UpdateRoleInput) {
    if (!updateRoleInput || !updateRoleInput.id) {
      throw new BadRequestException('Role ID is required to update.');
    }

    // Check if the role exists before updating
    const existingRole = await this.roleService.findOne(updateRoleInput.id);
    if (!existingRole) {
      throw new NotFoundException(
        `role with ID ${updateRoleInput.id} not found.`,
      );
    }

    return this.roleService.update(updateRoleInput.id, updateRoleInput);
  }

  // ✅ Remove role with advanced validation
  @Mutation(() => Role)
  async removeRole(@Args('id', { type: () => ID }) id: string) {
    if (!id) {
      throw new BadRequestException('Role ID is required to delete.');
    }

    // Validate the ID format
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new BadRequestException('Invalid Role ID format.');
    }

    const deletedRole = await this.roleService.remove(id);
    if (!deletedRole) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    return deletedRole;
  }

  // ✅ Create multiple roles with validation
  @Mutation(() => [Role])
  async createManyRoles(
    @Args('input', { type: () => [CreateRoleInput] }) input: CreateRoleInput[],
  ): Promise<Role[]> {
    if (!input || input.length === 0) {
      throw new BadRequestException('At least one role must be provided.');
    }

    // Check for duplicate role names in the array
    const uniqueNames = new Set();
    for (const role of input) {
      if (uniqueNames.has(role.name)) {
        throw new BadRequestException(
          `Duplicate role name detected: ${role.name}.`,
        );
      }
      uniqueNames.add(role.name);
    }

    return this.roleService.createMany(input);
  }
}
