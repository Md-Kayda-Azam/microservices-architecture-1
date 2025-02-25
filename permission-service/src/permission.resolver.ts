import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PermissionService } from './permission.service';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { Permission } from './model/permission.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Resolver(() => Permission)
export class PermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}

  // ✅ Create permission with advanced validation
  @Mutation(() => Permission)
  async createPermission(
    @Args('createPermissionInput') createPermissionInput: CreatePermissionInput,
  ) {
    if (
      !createPermissionInput ||
      !createPermissionInput.name ||
      !createPermissionInput.description
    ) {
      throw new BadRequestException(
        'Both name and description are required to create a permission.',
      );
    }

    // Validate if the permission name already exists
    const existingPermission = await this.permissionService.findByName(
      createPermissionInput.name,
    );
    if (existingPermission) {
      throw new BadRequestException(
        'A permission with this name already exists. Please choose another name.',
      );
    }

    return this.permissionService.create(createPermissionInput);
  }

  // ✅ Find all permissions
  @Query(() => [Permission], { name: 'permissions' })
  async findAll() {
    try {
      return await this.permissionService.findAll();
    } catch (error) {
      throw new NotFoundException('No permissions found.');
    }
  }

  // ✅ Find one permission by ID with validation
  @Query(() => Permission, { name: 'permission' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    if (!id) {
      throw new BadRequestException('Permission ID is required.');
    }

    // Validate the ID format
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new BadRequestException('Invalid Permission ID format.');
    }

    try {
      return await this.permissionService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Permission with ID ${id} not found.`);
    }
  }

  // ✅ Update permission with advanced validation
  @Mutation(() => Permission)
  async updatePermission(
    @Args('updatePermissionInput') updatePermissionInput: UpdatePermissionInput,
  ) {
    if (!updatePermissionInput || !updatePermissionInput.id) {
      throw new BadRequestException('Permission ID is required to update.');
    }

    // Check if the permission exists before updating
    const existingPermission = await this.permissionService.findOne(
      updatePermissionInput.id,
    );
    if (!existingPermission) {
      throw new NotFoundException(
        `Permission with ID ${updatePermissionInput.id} not found.`,
      );
    }

    return this.permissionService.update(
      updatePermissionInput.id,
      updatePermissionInput,
    );
  }

  // ✅ Remove permission with advanced validation
  @Mutation(() => Permission)
  async removePermission(@Args('id', { type: () => ID }) id: string) {
    if (!id) {
      throw new BadRequestException('Permission ID is required to delete.');
    }

    // Validate the ID format
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new BadRequestException('Invalid Permission ID format.');
    }

    const deletedPermission = await this.permissionService.remove(id);
    if (!deletedPermission) {
      throw new NotFoundException(`Permission with ID ${id} not found.`);
    }

    return deletedPermission;
  }

  // ✅ Create multiple permissions with validation
  @Mutation(() => [Permission])
  async createManyPermissions(
    @Args('input', { type: () => [CreatePermissionInput] })
    input: CreatePermissionInput[],
  ): Promise<Permission[]> {
    if (!input || input.length === 0) {
      throw new BadRequestException(
        'At least one permission must be provided.',
      );
    }

    // Check for duplicate permission names in the array
    const uniqueNames = new Set();
    for (const permission of input) {
      if (uniqueNames.has(permission.name)) {
        throw new BadRequestException(
          `Duplicate permission name detected: ${permission.name}.`,
        );
      }
      uniqueNames.add(permission.name);
    }

    return this.permissionService.createMany(input);
  }

  @Query(() => Permission)
  async validatePermissions(
    @Args('permissionIds', { type: () => [String] }) permissionIds: string[],
  ) {
    return this.permissionService.validatePermissions(permissionIds);
  }
}
