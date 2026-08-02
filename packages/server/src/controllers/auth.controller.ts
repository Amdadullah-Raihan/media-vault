// ---------------------------------------------------------------------------
// MediaVault – Auth Controller (v2 — multi-user)
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ok, error } from '../utils/responses';

const SESSION_COOKIE = 'mv_sid';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

function clientInfo(req: Request): { ip: string; userAgent: string } {
  const forwarded = req.headers['x-forwarded-for'];
  const ua = req.headers['user-agent'];
  return {
    ip: typeof forwarded === 'string' ? forwarded : (req.ip ?? 'unknown'),
    userAgent: typeof ua === 'string' ? ua : 'unknown',
  };
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // -----------------------------------------------------------------------
  // POST /auth/login
  // -----------------------------------------------------------------------

  login = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      error(res, 400, 'BAD_REQUEST', 'Username/email and password are required.');
      return;
    }

    const { ip, userAgent } = clientInfo(req);
    const result = await this.authService.login(username, password, ip, userAgent);

    if (!result) {
      error(res, 401, 'UNAUTHORIZED', 'Invalid credentials.');
      return;
    }

    res.cookie(SESSION_COOKIE, result.sessionId, COOKIE_OPTIONS);
    ok(res, {
      id: result.sessionId,
      user: result.user,
      createdAt: new Date().toISOString(),
    });
  };

  // -----------------------------------------------------------------------
  // POST /auth/logout
  // -----------------------------------------------------------------------

  logout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const sessionId = req.cookies[SESSION_COOKIE] as string | undefined;

    if (sessionId) {
      const { ip, userAgent } = clientInfo(req);
      await this.authService.logout(sessionId, ip, userAgent);
    }

    res.clearCookie(SESSION_COOKIE, { path: '/' });
    ok(res, null);
  };

  // -----------------------------------------------------------------------
  // GET /auth/session
  // -----------------------------------------------------------------------

  session = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const sessionId = req.cookies[SESSION_COOKIE] as string | undefined;

    if (!sessionId) {
      error(res, 401, 'UNAUTHORIZED', 'No active session.');
      return;
    }

    const session = await this.authService.validateSession(sessionId);

    if (!session) {
      res.clearCookie(SESSION_COOKIE, { path: '/' });
      error(res, 401, 'UNAUTHORIZED', 'Session expired or invalid.');
      return;
    }

    ok(res, {
      id: sessionId,
      user: session.user,
      createdAt: new Date().toISOString(),
    });
  };

  // -----------------------------------------------------------------------
  // POST /auth/change-password
  // -----------------------------------------------------------------------

  changePassword = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { currentPassword, newPassword } = req.body as Record<string, unknown>;

    if (
      !currentPassword ||
      !newPassword ||
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      error(res, 400, 'BAD_REQUEST', 'Current and new password are required.');
      return;
    }

    if (newPassword.length < 8) {
      error(res, 400, 'BAD_REQUEST', 'New password must be at least 8 characters.');
      return;
    }

    const userId = req.userId;
    if (!userId) {
      error(res, 401, 'UNAUTHORIZED', 'No active session.');
      return;
    }

    const { ip, userAgent } = clientInfo(req);
    const changed = await this.authService.changePassword(
      userId,
      currentPassword,
      newPassword,
      ip,
      userAgent,
    );

    if (!changed) {
      error(res, 400, 'BAD_REQUEST', 'Current password is incorrect.');
      return;
    }

    ok(res, null);
  };
}
