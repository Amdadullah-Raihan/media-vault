// ---------------------------------------------------------------------------
// MediaVault – Auth Service
//
// Simple env-based admin authentication with database-backed sessions.
// Credentials are set via ADMIN_USERNAME / ADMIN_PASSWORD environment
// variables. Change them in .env and restart the server.
// ---------------------------------------------------------------------------

import { SessionRepository } from '../repositories/session.repository';
import { getLogger } from '../utils/logger';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class AuthService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly adminUsername: string,
    private readonly adminPassword: string,
  ) {}

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------

  async login(
    username: string,
    password: string,
  ): Promise<{ sessionId: string; username: string } | null> {
    if (username !== this.adminUsername || password !== this.adminPassword) {
      return null;
    }

    const logger = getLogger();
    logger.info('Admin login successful');

    // Create session
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await this.sessions.create('admin', expiresAt);

    return { sessionId: session.id, username: this.adminUsername };
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

    const { getPrisma } = await import('../utils/prisma');
    const prisma = getPrisma();
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: newExpires },
    });

    return { username: this.adminUsername };
  }

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------

  async logout(sessionId: string): Promise<void> {
    await this.sessions.delete(sessionId);
  }
}
