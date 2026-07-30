// ---------------------------------------------------------------------------
// MediaVault – Authentication Middleware
//
// Two auth paths:
//   1. Session cookie (dashboard admins) → projectId = null, isAdmin = true
//   2. API key header (applications)      → projectId = <id>, isAdmin = false
//
// When auth is disabled, requests pass through with projectId = null.
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config';
import { getPrisma } from '../utils/prisma';
import { error } from '../utils/responses';

const SESSION_COOKIE = 'mv_sid';

/**
 * Extend Express Request to carry authenticated context.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** The project ID that owns the API key, or null. */
      projectId: string | null;
      /** Whether the request comes from an admin dashboard session. */
      isAdmin: boolean;
    }
  }
}

/**
 * Middleware that authenticates via session cookie (dashboard) or API key (apps).
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const config = getConfig();

  // Auth disabled – allow all requests through
  if (!config.auth.enabled) {
    req.projectId = null;
    req.isAdmin = false;
    next();
    return;
  }

  const prisma = getPrisma();

  // -----------------------------------------------------------------------
  // Path 1: Dashboard session cookie
  // -----------------------------------------------------------------------

  const sessionId = req.cookies[SESSION_COOKIE] as string | undefined;

  if (sessionId) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });

    if (session && new Date() <= session.expiresAt) {
      // Touch session (extend expiry)
      prisma.session
        .update({
          where: { id: sessionId },
          data: { lastActivity: new Date(), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        })
        .catch(() => {
          /* best-effort */
        });

      req.projectId = null;
      req.isAdmin = true;
      next();
      return;
    }

    // Expired or not found — clear cookie
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
        /* best-effort */
      });
    }
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  // -----------------------------------------------------------------------
  // Path 2: API key header (applications)
  // -----------------------------------------------------------------------

  const apiKey = req.headers[config.auth.apiKeyHeader];

  if (!apiKey || typeof apiKey !== 'string') {
    error(
      res,
      401,
      'UNAUTHORIZED',
      'Authentication required. Provide a session cookie or API key.',
    );
    return;
  }

  const keyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    select: { id: true, projectId: true },
  });

  if (!keyRecord) {
    error(res, 401, 'UNAUTHORIZED', 'Invalid API key.');
    return;
  }

  // Update last used timestamp (fire-and-forget)
  prisma.apiKey
    .update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {
      /* best-effort */
    });

  req.projectId = keyRecord.projectId;
  req.isAdmin = false;
  next();
}

/**
 * Middleware that ensures a project context exists. Admins bypass this check.
 */
export function requireProject(req: Request, res: Response, next: NextFunction): void {
  if (req.isAdmin) {
    next();
    return;
  }

  if (!req.projectId) {
    error(res, 403, 'FORBIDDEN', 'A project context is required for this endpoint.');
    return;
  }
  next();
}
