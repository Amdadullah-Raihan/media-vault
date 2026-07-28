// ---------------------------------------------------------------------------
// MediaVault – Auth Service
//
// Handles admin authentication with scrypt password hashing and
// database-backed sessions. API keys are handled separately.
// ---------------------------------------------------------------------------

import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { SettingsRepository } from '../repositories/settings.repository';
import { SessionRepository } from '../repositories/session.repository';
import { getLogger } from '../utils/logger';

const scryptAsync = promisify(scrypt);

const SALT_KEY = 'admin_password_salt';
const HASH_KEY = 'admin_password_hash';
const USERNAME_KEY = 'admin_username';
const INITIALIZED_KEY = 'admin_initialized';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class AuthService {
  constructor(
    private readonly settings: SettingsRepository,
    private readonly sessions: SessionRepository,
  ) {}

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------

  async isInitialized(): Promise<boolean> {
    const val = await this.settings.get(INITIALIZED_KEY);
    return val === 'true';
  }

  async initialize(username: string, password: string): Promise<void> {
    const logger = getLogger();

    const salt = randomBytes(16).toString('hex');
    const hash = await this.hashPassword(password, salt);

    await this.settings.set(INITIALIZED_KEY, 'true');
    await this.settings.set(USERNAME_KEY, username);
    await this.settings.set(SALT_KEY, salt);
    await this.settings.set(HASH_KEY, hash);

    logger.info('Admin account initialized');
  }

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------

  async login(
    username: string,
    password: string,
  ): Promise<{ sessionId: string; username: string } | null> {
    const storedUsername = await this.settings.get(USERNAME_KEY);
    if (!storedUsername || storedUsername !== username) {
      // Constant-time rejection to prevent username enumeration
      await this.hashPassword('dummy', 'dummy');
      return null;
    }

    const salt = await this.settings.get(SALT_KEY);
    const storedHash = await this.settings.get(HASH_KEY);
    if (!salt || !storedHash) return null;

    const valid = await this.verifyPassword(password, salt, storedHash);
    if (!valid) return null;

    // Create session
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await this.sessions.create('admin', expiresAt);

    return { sessionId: session.id, username: storedUsername };
  }

  // -----------------------------------------------------------------------
  // Session validation
  // -----------------------------------------------------------------------

  async validateSession(sessionId: string): Promise<{ username: string } | null> {
    const session = await this.sessions.findById(sessionId);
    if (!session) return null;

    // Check expiration
    if (new Date() > session.expiresAt) {
      await this.sessions.delete(sessionId);
      return null;
    }

    // Extend session
    const newExpires = new Date(Date.now() + SESSION_DURATION_MS);
    await this.sessions.touch(sessionId);

    // Update expiresAt via raw update
    const { getPrisma } = await import('../utils/prisma');
    const prisma = getPrisma();
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: newExpires },
    });

    const storedUsername = await this.settings.get(USERNAME_KEY);
    return { username: storedUsername ?? 'admin' };
  }

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------

  async logout(sessionId: string): Promise<void> {
    await this.sessions.delete(sessionId);
  }

  // -----------------------------------------------------------------------
  // Change password
  // -----------------------------------------------------------------------

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const salt = await this.settings.get(SALT_KEY);
    const storedHash = await this.settings.get(HASH_KEY);
    if (!salt || !storedHash) return false;

    const valid = await this.verifyPassword(currentPassword, salt, storedHash);
    if (!valid) return false;

    const newSalt = randomBytes(16).toString('hex');
    const newHash = await this.hashPassword(newPassword, newSalt);

    await this.settings.set(SALT_KEY, newSalt);
    await this.settings.set(HASH_KEY, newHash);

    return true;
  }

  // -----------------------------------------------------------------------
  // Password helpers
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
