// ---------------------------------------------------------------------------
// MediaVault – Auth Service
//
// Hybrid auth: env vars (ADMIN_USERNAME / ADMIN_PASSWORD) are defaults.
// Dashboard credential changes persist to the Settings table and override
// env values on subsequent logins.
// ---------------------------------------------------------------------------

import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { SettingsRepository } from '../repositories/settings.repository';
import { SessionRepository } from '../repositories/session.repository';
import { getLogger } from '../utils/logger';

const scryptAsync = promisify(scrypt);

const DB_USERNAME = 'admin_username';
const DB_PASSWORD_HASH = 'admin_password_hash';
const DB_PASSWORD_SALT = 'admin_password_salt';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export class AuthService {
  constructor(
    private readonly settings: SettingsRepository,
    private readonly sessions: SessionRepository,
    private readonly envUsername: string,
    private readonly envPassword: string,
  ) {}

  // -----------------------------------------------------------------------
  // Effective credentials (DB override > env default)
  // -----------------------------------------------------------------------

  async getUsername(): Promise<string> {
    const dbUser = await this.settings.get(DB_USERNAME);
    return dbUser ?? this.envUsername;
  }

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------

  async login(
    username: string,
    password: string,
  ): Promise<{ sessionId: string; username: string } | null> {
    const effectiveUsername = await this.getUsername();

    if (username !== effectiveUsername) {
      await this.hashPassword('dummy', 'dummy');
      return null;
    }

    const dbHash = await this.settings.get(DB_PASSWORD_HASH);
    const dbSalt = await this.settings.get(DB_PASSWORD_SALT);

    if (dbHash && dbSalt) {
      // DB override (hashed)
      const valid = await this.verifyPassword(password, dbSalt, dbHash);
      if (!valid) return null;
    } else {
      // Env default (plaintext)
      if (password !== this.envPassword) return null;
    }

    const logger = getLogger();
    logger.info('Admin login successful');

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await this.sessions.create('admin', expiresAt);

    return { sessionId: session.id, username: effectiveUsername };
  }

  // -----------------------------------------------------------------------
  // Session validation
  // -----------------------------------------------------------------------

  async validateSession(sessionId: string): Promise<{ username: string } | null> {
    const session = await this.sessions.findById(sessionId);
    if (!session) return null;

    if (new Date() > session.expiresAt) {
      await this.sessions.delete(sessionId);
      return null;
    }

    const newExpires = new Date(Date.now() + SESSION_DURATION_MS);
    await this.sessions.touch(sessionId);

    const { getPrisma } = await import('../utils/prisma');
    const prisma = getPrisma();
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: newExpires },
    });

    return { username: await this.getUsername() };
  }

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------

  async logout(sessionId: string): Promise<void> {
    await this.sessions.delete(sessionId);
  }

  // -----------------------------------------------------------------------
  // Change password (dashboard)
  // -----------------------------------------------------------------------

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    // Verify current password
    const dbHash = await this.settings.get(DB_PASSWORD_HASH);
    const dbSalt = await this.settings.get(DB_PASSWORD_SALT);

    if (dbHash && dbSalt) {
      const valid = await this.verifyPassword(currentPassword, dbSalt, dbHash);
      if (!valid) return false;
    } else {
      if (currentPassword !== this.envPassword) return false;
    }

    // Store new hashed password
    const salt = randomBytes(16).toString('hex');
    const hash = await this.hashPassword(newPassword, salt);
    await this.settings.set(DB_PASSWORD_SALT, salt);
    await this.settings.set(DB_PASSWORD_HASH, hash);

    const logger = getLogger();
    logger.info('Admin password changed');

    return true;
  }

  // -----------------------------------------------------------------------
  // Change username (dashboard)
  // -----------------------------------------------------------------------

  async changeUsername(newUsername: string): Promise<void> {
    await this.settings.set(DB_USERNAME, newUsername);
    const logger = getLogger();
    logger.info('Admin username changed');
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private async hashPassword(password: string, salt: string): Promise<string> {
    const derivedKey = await scryptAsync(password, salt, 64);
    return (derivedKey as Buffer).toString('hex');
  }

  private async verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
    const derivedKey = await scryptAsync(password, salt, 64);
    const derivedHash = (derivedKey as Buffer).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const derivedBuf = Buffer.from(derivedHash, 'hex');
    if (hashBuf.length !== derivedBuf.length) return false;
    return timingSafeEqual(hashBuf, derivedBuf);
  }
}
