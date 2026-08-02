// ---------------------------------------------------------------------------
// MediaVault – Role Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';
import { Role, CreateRoleInput } from '../core/types';

const COLLECTION = 'roles';

export class RoleRepository {
  private readonly store = getStore();

  public async create(input: CreateRoleInput & { isBuiltIn?: boolean }): Promise<Role> {
    const now = new Date();
    const role: Role = {
      id: uuidv4(),
      name: input.name,
      description: input.description,
      permissions: input.permissions,
      isBuiltIn: input.isBuiltIn ?? false,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.insert<Role>(COLLECTION, role);
  }

  public async findById(id: string): Promise<Role | undefined> {
    return this.store.findOne<Role>(COLLECTION, (r) => r.id === id);
  }

  public async findByName(name: string): Promise<Role | undefined> {
    return this.store.findOne<Role>(COLLECTION, (r) => r.name.toLowerCase() === name.toLowerCase());
  }

  public async findAll(): Promise<Role[]> {
    return this.store.all<Role>(COLLECTION);
  }

  public async findAllNonBuiltIn(): Promise<Role[]> {
    return this.store.findMany<Role>(COLLECTION, (r) => !r.isBuiltIn);
  }

  public async update(id: string, updater: (role: Role) => Role): Promise<Role | undefined> {
    return this.store.update<Role>(
      COLLECTION,
      (r) => r.id === id,
      (r) => ({
        ...updater(r),
        updatedAt: new Date(),
      }),
    );
  }

  public async delete(id: string): Promise<Role | undefined> {
    return this.store.delete<Role>(COLLECTION, (r) => r.id === id);
  }

  public async seedBuiltInRoles(
    roles: { id: string; name: string; description: string; permissions: string[] }[],
  ): Promise<void> {
    for (const role of roles) {
      const existing = await this.findById(role.id);
      if (!existing) {
        await this.create({ ...role, isBuiltIn: true });
      }
    }
  }
}
