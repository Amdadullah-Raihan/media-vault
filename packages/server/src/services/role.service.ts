// ---------------------------------------------------------------------------
// MediaVault – Role Service
// ---------------------------------------------------------------------------

import { RoleRepository } from '../repositories/role.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { Role, CreateRoleInput, UpdateRoleInput } from '../core/types';
import { NotFoundError, ConflictError, ForbiddenError } from '../core/errors';
import { BuiltInRole } from '../auth/permissions';
import { getLogger } from '../utils/logger';

export class RoleService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly audit: AuditRepository,
  ) {}

  // -----------------------------------------------------------------------
  // Create
  // -----------------------------------------------------------------------

  async create(
    input: CreateRoleInput,
    actorId: string,
    ip: string,
    userAgent: string,
  ): Promise<Role> {
    const existing = await this.roles.findByName(input.name);
    if (existing) {
      throw new ConflictError(`Role "${input.name}" already exists`);
    }

    const role = await this.roles.create(input);

    await this.audit.create({
      userId: actorId,
      action: 'role_created',
      resourceType: 'role',
      resourceId: role.id,
      newValue: { name: role.name, permissions: role.permissions },
      ip,
      userAgent,
    });

    const logger = getLogger();
    logger.info({ roleId: role.id, name: role.name }, 'Role created');

    return role;
  }

  // -----------------------------------------------------------------------
  // Read
  // -----------------------------------------------------------------------

  async getById(id: string): Promise<Role> {
    const role = await this.roles.findById(id);
    if (!role) {
      throw new NotFoundError('Role', id);
    }
    return role;
  }

  async getAll(): Promise<Role[]> {
    return this.roles.findAll();
  }

  // -----------------------------------------------------------------------
  // Update
  // -----------------------------------------------------------------------

  async update(
    id: string,
    input: UpdateRoleInput,
    actorId: string,
    ip: string,
    userAgent: string,
  ): Promise<Role> {
    const role = await this.getById(id);

    if (role.isBuiltIn) {
      throw new ForbiddenError('Cannot modify built-in roles');
    }

    if (input.name) {
      const existing = await this.roles.findByName(input.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Role "${input.name}" already exists`);
      }
    }

    const updated = await this.roles.update(id, (r) => ({
      ...r,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.permissions !== undefined && { permissions: input.permissions }),
    }));

    if (!updated) {
      throw new NotFoundError('Role', id);
    }

    await this.audit.create({
      userId: actorId,
      action: 'role_updated',
      resourceType: 'role',
      resourceId: id,
      previousValue: { name: role.name, permissions: role.permissions },
      newValue: { name: updated.name, permissions: updated.permissions },
      ip,
      userAgent,
    });

    return updated;
  }

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  async delete(id: string, actorId: string, ip: string, userAgent: string): Promise<void> {
    const role = await this.getById(id);

    if (role.isBuiltIn) {
      throw new ForbiddenError('Cannot delete built-in roles');
    }

    // Prevent deleting the Owner role
    if (id === String(BuiltInRole.Owner)) {
      throw new ForbiddenError('Cannot delete the Owner role');
    }

    await this.roles.delete(id);

    await this.audit.create({
      userId: actorId,
      action: 'role_deleted',
      resourceType: 'role',
      resourceId: id,
      previousValue: { name: role.name },
      ip,
      userAgent,
    });
  }

  // -----------------------------------------------------------------------
  // Duplicate
  // -----------------------------------------------------------------------

  async duplicate(id: string, actorId: string, ip: string, userAgent: string): Promise<Role> {
    const role = await this.getById(id);

    const baseName = `Copy of ${role.name}`;
    let name = baseName;
    let counter = 1;
    while (await this.roles.findByName(name)) {
      counter++;
      name = `${baseName} (${String(counter)})`;
    }

    return this.create(
      {
        name,
        description: role.description,
        permissions: [...role.permissions],
      },
      actorId,
      ip,
      userAgent,
    );
  }
}
