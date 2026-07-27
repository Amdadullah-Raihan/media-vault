// ---------------------------------------------------------------------------
// MediaVault – Authentication Middleware
//
// Supports API key authentication via a configurable header. When auth is
// disabled, requests pass through with projectId = null.
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config';
import { getPrisma } from '../utils/prisma';
import { error } from '../utils/responses';
import { UnauthorizedError, ForbiddenError } from '../core/errors';

/**
 * Extend Express Request to carry authenticated context.
 */
declare global {
  namespace Express {
    interface Request {
      /** The project ID that owns the API key, or null if auth is disabled. */
      projectId: string | null;
    }
  }
}

/**
 * Middleware that extracts and validates the API key from the request header.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const config = getConfig();

  // Auth disabled – allow all requests through
  if (!config.auth.enabled) {
    req.projectId = null;
    next();
    return;
  }

  const apiKey = req.headers[config.auth.apiKeyHeader];

  if (!apiKey || typeof apiKey !== 'string') {
    error(res, 401, 'UNAUTHORIZED', 'API key is required. Provide it via the X-Api-Key header.');
    return;
  }

  const prisma = getPrisma();

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
      // Best-effort – don't block the request
    });

  req.projectId = keyRecord.projectId;
  next();
}

/**
 * Middleware that ensures a project context exists (auth was provided or
 * endpoints that don't require project-scoping bypass this).
 */
export function requireProject(req: Request, res: Response, next: NextFunction): void {
  if (!req.projectId) {
    error(res, 403, 'FORBIDDEN', 'A project context is required for this endpoint.');
    return;
  }
  next();
}

// Re-export errors for convenience
export { UnauthorizedError, ForbiddenError };
