// ---------------------------------------------------------------------------
// MediaVault – User Service
// ---------------------------------------------------------------------------

import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { User, UserProfile, CreateUserInput, UpdateUserInput, UserStatus } from '../core/types';
import { NotFoundError, ConflictError, ForbiddenError } from '../core/errors';
import { getLogger } from '../utils/logger';
import { BuiltInRole } from '../auth/permissions';

const scryptAsync = promisify(scrypt);

export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly audit: AuditRepository,
  ) {}

  // -----------------------------------------------------------------------
  // Password helpers
  // -----------------------------------------------------------------------

  private async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64);
    return {
      hash: (derivedKey as Buffer).toString('hex'),
      salt,
    };
  }

  async verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
    const derivedKey = await scryptAsync(password, salt, 64);
    const derivedHash = (derivedKey as Buffer).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const derivedBuf = Buffer.from(derivedHash, 'hex');
    if (hashBuf.length !== derivedBuf.length) return false;
    return timingSafeEqual(hashBuf, derivedBuf);
  }

  // -----------------------------------------------------------------------
  // Create user
  // -----------------------------------------------------------------------

  async create(
    input: CreateUserInput,
    createdBy: string,
    ip: string,
    userAgent: string,
  ): Promise<UserProfile> {
    // Check username uniqueness
    const existingUsername = await this.users.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictError(`Username "${input.username}" is already taken`);
    }

    // Check email uniqueness
    const existingEmail = await this.users.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError(`Email "${input.email}" is already in use`);
    }

    // Validate role exists
    const role = await this.roles.findById(input.roleId);
    if (!role) {
      throw new NotFoundError('Role', input.roleId);
    }

    const { hash, salt } = await this.hashPassword(input.password);

    const user = await this.users.create({
      ...input,
      passwordHash: hash,
      passwordSalt: salt,
      createdBy,
    });

    await this.audit.create({
      userId: createdBy,
      action: 'user_created',
      resourceType: 'user',
      resourceId: user.id,
      newValue: { username: user.username, email: user.email, roleId: user.roleId },
      ip,
      userAgent,
    });

    const logger = getLogger();
    logger.info({ userId: user.id, username: user.username }, 'User created');

    return this.users.toProfile(user);
  }

  // -----------------------------------------------------------------------
  // Get user
  // -----------------------------------------------------------------------

  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  async getProfile(id: string): Promise<UserProfile> {
    const user = await this.getById(id);
    return this.users.toProfile(user);
  }

  async listProfiles(): Promise<UserProfile[]> {
    return this.users.listProfiles();
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.findByEmail(email);
  }

  // -----------------------------------------------------------------------
  // Update user
  // -----------------------------------------------------------------------

  async update(
    targetId: string,
    input: UpdateUserInput,
    actorId: string,
    ip: string,
    userAgent: string,
  ): Promise<UserProfile> {
    const user = await this.getById(targetId);

    // Cannot modify Owner role unless you are the Owner
    if (
      user.roleId === String(BuiltInRole.Owner) &&
      input.roleId &&
      input.roleId !== String(BuiltInRole.Owner)
    ) {
      throw new ForbiddenError('Cannot change the Owner role');
    }

    if (input.email) {
      const existing = await this.users.findByEmail(input.email);
      if (existing && existing.id !== targetId) {
        throw new ConflictError(`Email "${input.email}" is already in use`);
      }
    }

    if (input.roleId) {
      const role = await this.roles.findById(input.roleId);
      if (!role) {
        throw new NotFoundError('Role', input.roleId);
      }
    }

    const previous = { ...user };
    const updated = await this.users.update(targetId, (u) => ({
      ...u,
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.firstName !== undefined || input.lastName !== undefined
        ? {
            displayName: `${input.firstName ?? u.firstName} ${input.lastName ?? u.lastName}`.trim(),
          }
        : {}),
      ...(input.email !== undefined && { email: input.email.toLowerCase() }),
      ...(input.roleId !== undefined && { roleId: input.roleId }),
      ...(input.assignedProjectIds !== undefined && {
        assignedProjectIds: input.assignedProjectIds,
      }),
      ...(input.status !== undefined && { status: input.status }),
    }));

    if (!updated) {
      throw new NotFoundError('User', targetId);
    }

    await this.audit.create({
      userId: actorId,
      action: 'user_updated',
      resourceType: 'user',
      resourceId: targetId,
      previousValue: { roleId: previous.roleId, status: previous.status },
      newValue: { roleId: updated.roleId, status: updated.status },
      ip,
      userAgent,
    });

    return this.users.toProfile(updated);
  }

  // -----------------------------------------------------------------------
  // Delete / status management
  // -----------------------------------------------------------------------

  async softDelete(
    targetId: string,
    actorId: string,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    const user = await this.getById(targetId);

    if (user.roleId === String(BuiltInRole.Owner)) {
      throw new ForbiddenError('Cannot delete the Owner account');
    }

    await this.users.update(targetId, (u) => ({
      ...u,
      status: UserStatus.Disabled,
    }));

    await this.audit.create({
      userId: actorId,
      action: 'user_deleted',
      resourceType: 'user',
      resourceId: targetId,
      previousValue: { username: user.username },
      ip,
      userAgent,
    });
  }

  async suspend(
    targetId: string,
    actorId: string,
    ip: string,
    userAgent: string,
  ): Promise<UserProfile> {
    const user = await this.getById(targetId);
    if (user.roleId === String(BuiltInRole.Owner)) {
      throw new ForbiddenError('Cannot suspend the Owner account');
    }

    const updated = await this.users.update(targetId, (u) => ({
      ...u,
      status: UserStatus.Suspended,
    }));
    if (!updated) throw new NotFoundError('User', targetId);

    await this.audit.create({
      userId: actorId,
      action: 'user_suspended',
      resourceType: 'user',
      resourceId: targetId,
      previousValue: { status: UserStatus.Active },
      ip,
      userAgent,
    });

    return this.users.toProfile(updated);
  }

  async restore(
    targetId: string,
    actorId: string,
    ip: string,
    userAgent: string,
  ): Promise<UserProfile> {
    const user = await this.getById(targetId);

    const updated = await this.users.update(targetId, (u) => ({
      ...u,
      status: UserStatus.Active,
      loginAttempts: 0,
      lockedUntil: null,
    }));
    if (!updated) throw new NotFoundError('User', targetId);

    await this.audit.create({
      userId: actorId,
      action: 'user_restored',
      resourceType: 'user',
      resourceId: targetId,
      previousValue: { status: user.status },
      ip,
      userAgent,
    });

    return this.users.toProfile(updated);
  }

  async unlock(
    targetId: string,
    actorId: string,
    ip: string,
    userAgent: string,
  ): Promise<UserProfile> {
    await this.getById(targetId); // validates existence

    const updated = await this.users.update(targetId, (u) => ({
      ...u,
      status: UserStatus.Active,
      loginAttempts: 0,
      lockedUntil: null,
    }));
    if (!updated) throw new NotFoundError('User', targetId);

    await this.audit.create({
      userId: actorId,
      action: 'account_unlocked',
      resourceType: 'user',
      resourceId: targetId,
      ip,
      userAgent,
    });

    return this.users.toProfile(updated);
  }

  // -----------------------------------------------------------------------
  // Account locking
  // -----------------------------------------------------------------------

  async recordFailedLogin(userId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) return;

    const attempts = user.loginAttempts + 1;
    const maxAttempts = 5; // TODO: make configurable

    if (attempts >= maxAttempts) {
      await this.users.update(userId, (u) => ({
        ...u,
        loginAttempts: attempts,
        status: UserStatus.Locked,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      }));
    } else {
      await this.users.update(userId, (u) => ({
        ...u,
        loginAttempts: attempts,
      }));
    }
  }

  async recordSuccessfulLogin(userId: string): Promise<void> {
    await this.users.update(userId, (u) => ({
      ...u,
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
      ...(u.status === UserStatus.Pending ? { status: UserStatus.Active } : {}),
    }));
  }

  // -----------------------------------------------------------------------
  // Password management
  // -----------------------------------------------------------------------

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const user = await this.getById(userId);

    const valid = await this.verifyPassword(currentPassword, user.passwordSalt, user.passwordHash);
    if (!valid) return false;

    if (newPassword.length < 8) {
      throw new ConflictError('New password must be at least 8 characters');
    }

    const { hash, salt } = await this.hashPassword(newPassword);
    await this.users.update(userId, (u) => ({
      ...u,
      passwordHash: hash,
      passwordSalt: salt,
    }));

    await this.audit.create({
      userId,
      action: 'password_changed',
      resourceType: 'user',
      resourceId: userId,
      ip,
      userAgent,
    });

    return true;
  }

  // -----------------------------------------------------------------------
  // Owner check
  // -----------------------------------------------------------------------

  async isOwner(userId: string): Promise<boolean> {
    const user = await this.users.findById(userId);
    return user?.roleId === BuiltInRole.Owner;
  }
}
