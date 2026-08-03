// ---------------------------------------------------------------------------
// MediaVault – User Repository
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../utils/store';
import { User, CreateUserInput, UserProfile } from '../core/types';

const COLLECTION = 'users';

function toProfile(user: User): UserProfile {
  return {
    id: user.id,
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    status: user.status,
    roleId: user.roleId,
    assignedProjectIds: user.assignedProjectIds,
    preferredLanguage: user.preferredLanguage,
    timezone: user.timezone,
    lastLoginAt: user.lastLoginAt,
    lastActiveAt: user.lastActiveAt,
    createdBy: user.createdBy,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserRepository {
  private readonly store = getStore();

  public async create(
    input: CreateUserInput & { passwordHash: string; passwordSalt: string; createdBy: string },
  ): Promise<User> {
    const now = new Date();
    const displayName = `${input.firstName} ${input.lastName}`.trim();
    const user: User = {
      id: uuidv4(),
      avatar: null,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName,
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      passwordSalt: input.passwordSalt,
      status: 'pending' as User['status'],
      roleId: input.roleId,
      assignedProjectIds: input.assignedProjectIds ?? [],
      preferredLanguage: 'en',
      timezone: 'UTC',
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      lastActiveAt: null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.insert<User>(COLLECTION, user);
  }

  public async findById(id: string): Promise<User | undefined> {
    return this.store.findOne<User>(COLLECTION, (u) => u.id === id);
  }

  public async findByUsername(username: string): Promise<User | undefined> {
    return this.store.findOne<User>(COLLECTION, (u) => u.username === username.toLowerCase());
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return this.store.findOne<User>(COLLECTION, (u) => u.email === email.toLowerCase());
  }

  public async findAll(): Promise<User[]> {
    return this.store.all<User>(COLLECTION);
  }

  public async listNonDeleted(): Promise<User[]> {
    return this.store.findMany<User>(COLLECTION, (u) => u.status !== 'deleted');
  }

  public async count(): Promise<number> {
    return this.store.count<User>(COLLECTION);
  }

  public async update(id: string, updater: (user: User) => User): Promise<User | undefined> {
    return this.store.update<User>(
      COLLECTION,
      (u) => u.id === id,
      (u) => ({
        ...updater(u),
        updatedAt: new Date(),
      }),
    );
  }

  public async delete(id: string): Promise<User | undefined> {
    return this.store.delete<User>(COLLECTION, (u) => u.id === id);
  }

  /** Convert a User entity to a safe public profile. */
  public toProfile(user: User): UserProfile {
    return toProfile(user);
  }

  public async findProfileById(id: string): Promise<UserProfile | undefined> {
    const user = await this.findById(id);
    return user ? toProfile(user) : undefined;
  }

  public async listProfiles(): Promise<UserProfile[]> {
    const users = await this.listNonDeleted();
    return users.map(toProfile);
  }
}
