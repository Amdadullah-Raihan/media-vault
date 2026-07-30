// ---------------------------------------------------------------------------
// MediaVault – Auth Controller
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

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // -----------------------------------------------------------------------
  // POST /auth/login
  // -----------------------------------------------------------------------

  login = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      error(res, 400, 'BAD_REQUEST', 'Username and password are required.');
      return;
    }

    const result = await this.authService.login(username, password);

    if (!result) {
      error(res, 401, 'UNAUTHORIZED', 'Invalid username or password.');
      return;
    }

    res.cookie(SESSION_COOKIE, result.sessionId, COOKIE_OPTIONS);
    ok(res, {
      id: result.sessionId,
      username: result.username,
      createdAt: new Date().toISOString(),
    });
  };

  // -----------------------------------------------------------------------
  // POST /auth/logout
  // -----------------------------------------------------------------------

  logout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const sessionId = req.cookies[SESSION_COOKIE] as string | undefined;

    if (sessionId) {
      await this.authService.logout(sessionId);
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

    ok(res, { id: sessionId, username: session.username, createdAt: new Date().toISOString() });
  };
}
