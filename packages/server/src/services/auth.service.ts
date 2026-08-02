// ---------------------------------------------------------------------------
// MediaVault – Auth Service (v2 — multi-user)
//
// Supports:
//   - Multiple user accounts (not just one admin)
//   - Login via username or email
//   - Session management
//   - Account locking after failed attempts
//   - Owner migration from legacy env credentials
// ---------------------------------------------------------------------------

import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { UserService } from './user.service';
import { User, UserStatus } from '../core/types';
import { BuiltInRole, BUILT_IN_ROLE_PERMISSIONS } from '../auth/permissions';
import { getLogger } from '../utils/logger';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export interface LoginResult {
  sessionId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    roleId: string;
    permissions: string[];
  };
}

export interface SessionValidation {
  user: {
    id: string;
    username: string;
    displayName: string;
    roleId: string;
    permissions: string[];
    assignedProjectIds: string[];
  };
}

export class AuthService {
  private readonly userService: UserService;

  constructor(
    private readonly sessions: SessionRepository,
    private readonly users: UserRepository,
    private readonly roles: RoleRepository,
    private readonly audit: AuditRepository,
    private readonly envUsername: string,
    private readonly envPassword: string,
  ) {
    this.userService = new UserService(users, roles, audit);
  }

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------

  async login(
    identifier: string,
    password: string,
    ip: string,
    userAgent: string,
  ): Promise<LoginResult | null> {
    // Try to find user by username or email
    let user =
      (await this.users.findByUsername(identifier)) ?? (await this.users.findByEmail(identifier));

    // Fallback: legacy env-credential admin (Owner migration)
    if (!user && identifier === this.envUsername) {
      user = await this.users.findByUsername(this.envUsername);
      if (!user) {
        user = await this.migrateOwner(identifier, password, ip, userAgent);
        if (!user) return null;
      }
    }

    if (!user) {
      await this.dummyCheck();
      return null;
    }

    // Check account status
    if (user.status === UserStatus.Locked) {
      if (user.lockedUntil && new Date() < user.lockedUntil) {
        return null;
      }
      await this.users.update(user.id, (u) => ({
        ...u,
        status: UserStatus.Active,
        loginAttempts: 0,
        lockedUntil: null,
      }));
    }

    if (user.status !== UserStatus.Active && user.status !== UserStatus.Pending) {
      return null;
    }

    // Verify password
    const valid = await this.userService.verifyPassword(
      password,
      user.passwordSalt,
      user.passwordHash,
    );
    if (!valid) {
      await this.userService.recordFailedLogin(user.id);
      await this.audit.create({
        userId: user.id,
        action: 'login',
        resourceType: 'auth',
        success: false,
        ip,
        userAgent,
      });
      return null;
    }

    // Success
    await this.userService.recordSuccessfulLogin(user.id);

    const permissions = await this.resolvePermissions(user);

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await this.sessions.create(user.id, expiresAt);

    await this.audit.create({
      userId: user.id,
      action: 'login',
      resourceType: 'auth',
      success: true,
      ip,
      userAgent,
    });

    const logger = getLogger();
    logger.info({ userId: user.id, username: user.username }, 'User logged in');

    return {
      sessionId: session.id,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        roleId: user.roleId,
        permissions,
      },
    };
  }

  // -----------------------------------------------------------------------
  // Session validation
  // -----------------------------------------------------------------------

  async validateSession(sessionId: string): Promise<SessionValidation | null> {
    const session = await this.sessions.findById(sessionId);
    if (!session) return null;

    if (new Date() > session.expiresAt) {
      await this.sessions.delete(sessionId);
      return null;
    }

    const user = await this.users.findById(session.adminId);
    if (!user) {
      await this.sessions.delete(sessionId);
      return null;
    }

    if (user.status !== UserStatus.Active && user.status !== UserStatus.Pending) {
      await this.sessions.delete(sessionId);
      return null;
    }

    const newExpires = new Date(Date.now() + SESSION_DURATION_MS);
    await this.sessions.updateExpiry(sessionId, newExpires);
    await this.sessions.touch(sessionId);

    await this.users.update(user.id, (u) => ({
      ...u,
      lastActiveAt: new Date(),
    }));

    const permissions = await this.resolvePermissions(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        roleId: user.roleId,
        permissions,
        assignedProjectIds: user.assignedProjectIds,
      },
    };
  }

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------

  async logout(sessionId: string, ip: string, userAgent: string): Promise<void> {
    const session = await this.sessions.findById(sessionId);
    if (session) {
      await this.sessions.delete(sessionId);
      await this.audit.create({
        userId: session.adminId,
        action: 'logout',
        resourceType: 'auth',
        ip,
        userAgent,
      });
    }
  }

  // -----------------------------------------------------------------------
  // Change password (current user)
  // -----------------------------------------------------------------------

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    return this.userService.changePassword(userId, currentPassword, newPassword, ip, userAgent);
  }

  // -----------------------------------------------------------------------
  // Permission resolution
  // -----------------------------------------------------------------------

  private async resolvePermissions(user: User): Promise<string[]> {
    if (Object.values(BuiltInRole).includes(user.roleId as BuiltInRole)) {
      return BUILT_IN_ROLE_PERMISSIONS[user.roleId as BuiltInRole];
    }
    const role = await this.roles.findById(user.roleId);
    return role?.permissions ?? [];
  }

  // -----------------------------------------------------------------------
  // Owner migration (first-ever login with env credentials)
  // -----------------------------------------------------------------------

  private async migrateOwner(
    username: string,
    password: string,
    ip: string,
    userAgent: string,
  ): Promise<User | undefined> {
    if (password !== this.envPassword) return undefined;

    await this.seedBuiltInRoles();

    const logger = getLogger();
    logger.info('Migrating env admin to Owner account');

    const user = await this.users.create({
      username,
      email: 'admin@mediavault.local',
      password: '',
      firstName: 'MediaVault',
      lastName: 'Owner',
      roleId: BuiltInRole.Owner,
      passwordHash: '',
      passwordSalt: '',
      createdBy: 'system',
    });

    // Store hashed password directly
    const { scrypt, randomBytes } = await import('node:crypto');
    const { promisify } = await import('node:util');
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await promisify(scrypt)(password, salt, 64);
    const hash = (derivedKey as Buffer).toString('hex');

    await this.users.update(user.id, (u) => ({
      ...u,
      passwordHash: hash,
      passwordSalt: salt,
      status: UserStatus.Active,
    }));

    await this.audit.create({
      userId: user.id,
      action: 'owner_migrated',
      resourceType: 'system',
      resourceId: user.id,
      ip,
      userAgent,
    });

    return this.users.findById(user.id);
  }

  // -----------------------------------------------------------------------
  // Seed built-in roles on first use
  // -----------------------------------------------------------------------

  async seedBuiltInRoles(): Promise<void> {
    const builtIns = [
      {
        id: BuiltInRole.Owner,
        name: 'Owner',
        description: 'Unrestricted access to all features and settings.',
        permissions: BUILT_IN_ROLE_PERMISSIONS[BuiltInRole.Owner],
      },
      {
        id: BuiltInRole.Administrator,
        name: 'Administrator',
        description: 'Full administrative access except Owner-only operations.',
        permissions: BUILT_IN_ROLE_PERMISSIONS[BuiltInRole.Administrator],
      },
      {
        id: BuiltInRole.Manager,
        name: 'Manager',
        description:
          'Operational administrator — manages projects, files, API keys, and upload rules.',
        permissions: BUILT_IN_ROLE_PERMISSIONS[BuiltInRole.Manager],
      },
      {
        id: BuiltInRole.Developer,
        name: 'Developer',
        description: 'Can manage files and API keys within assigned projects.',
        permissions: BUILT_IN_ROLE_PERMISSIONS[BuiltInRole.Developer],
      },
      {
        id: BuiltInRole.Viewer,
        name: 'Viewer',
        description: 'Read-only access to assigned projects.',
        permissions: BUILT_IN_ROLE_PERMISSIONS[BuiltInRole.Viewer],
      },
    ];

    await this.roles.seedBuiltInRoles(builtIns);
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private async dummyCheck(): Promise<void> {
    const { scrypt, timingSafeEqual } = await import('node:crypto');
    const { promisify } = await import('node:util');
    const derivedKey = await promisify(scrypt)('dummy', '00'.repeat(16), 64);
    const derivedHash = (derivedKey as Buffer).toString('hex');
    timingSafeEqual(Buffer.from(derivedHash, 'hex'), Buffer.from('00'.repeat(128), 'hex'));
  }
}
