// ---------------------------------------------------------------------------
// MediaVault – Authentication Middleware
//
// Two auth paths:
//   1. Session cookie (dashboard admins) → projectId = null, isAdmin = true
//   2. API key header (applications)      → projectId = <id>, isAdmin = false
//
// When auth is disabled, requests pass through with projectId = null.
//
// In v2, session-based users also get req.userPermissions and req.userRoleId
// resolved from their assigned role.
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { UserStatus } from '../core/types';
import { BuiltInRole, BUILT_IN_ROLE_PERMISSIONS } from '../auth/permissions';
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
      /** Resolved permissions for the authenticated user (session auth only). */
      userPermissions: string[] | null;
      /** The user's role ID (session auth only). */
      userRoleId: string | null;
      /** The authenticated user ID (session auth only). */
      userId: string | null;
    }
  }
}

const sessionRepo = new SessionRepository();
const apiKeyRepo = new ApiKeyRepository();
const userRepo = new UserRepository();
const roleRepo = new RoleRepository();

/**
 * Middleware that authenticates via session cookie (dashboard) or API key (apps).
 * Also resolves user permissions for session-based auth.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const config = getConfig();

  // Auth disabled – allow all requests through
  if (!config.auth.enabled) {
    req.projectId = null;
    req.isAdmin = false;
    req.userPermissions = null;
    req.userRoleId = null;
    req.userId = null;
    next();
    return;
  }

  // -----------------------------------------------------------------------
  // Path 1: Dashboard session cookie
  // -----------------------------------------------------------------------

  const sessionId = req.cookies[SESSION_COOKIE] as string | undefined;

  if (sessionId) {
    const session = await sessionRepo.findById(sessionId);

    if (session && new Date() <= session.expiresAt) {
      const user = await userRepo.findById(session.adminId);

      if (user && user.status === UserStatus.Active) {
        // Touch session (extend expiry)
        const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        sessionRepo.updateExpiry(sessionId, newExpires).catch(() => {
          /* best-effort */
        });

        // Resolve permissions
        const permissions = await resolvePermissions(user.roleId);

        req.projectId = null;
        req.isAdmin = true;
        req.userPermissions = permissions;
        req.userRoleId = user.roleId;
        req.userId = user.id;

        // Update last active
        userRepo
          .update(user.id, (u) => ({ ...u, lastActiveAt: new Date() }))
          .catch(() => {
            /* best-effort */
          });

        next();
        return;
      }

      // User not found or inactive — clear session
      await sessionRepo.delete(sessionId).catch(() => {
        /* best-effort */
      });
    }

    // Expired or not found — clear cookie
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

  const keyRecord = await apiKeyRepo.findByKey(apiKey);

  if (!keyRecord) {
    error(res, 401, 'UNAUTHORIZED', 'Invalid API key.');
    return;
  }

  // Update last used timestamp (fire-and-forget)
  apiKeyRepo.updateLastUsed(keyRecord.id).catch(() => {
    /* best-effort */
  });

  req.projectId = keyRecord.projectId;
  req.isAdmin = false;
  req.userPermissions = null;
  req.userRoleId = null;
  req.userId = null;
  next();
}

// ---------------------------------------------------------------------------
// Permission resolution helper
// ---------------------------------------------------------------------------

async function resolvePermissions(roleId: string): Promise<string[]> {
  if (Object.values(BuiltInRole).includes(roleId as BuiltInRole)) {
    return BUILT_IN_ROLE_PERMISSIONS[roleId as BuiltInRole];
  }
  const role = await roleRepo.findById(roleId);
  return role?.permissions ?? [];
}

/**
 * Middleware that optionally authenticates — populates req.projectId / req.isAdmin
 * when valid credentials are present, but never rejects. Downstream handlers
 * can use these fields to gate access (e.g. private vs public files).
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const config = getConfig();

  // Auth disabled – allow all requests through
  if (!config.auth.enabled) {
    req.projectId = null;
    req.isAdmin = false;
    req.userPermissions = null;
    req.userRoleId = null;
    req.userId = null;
    next();
    return;
  }

  // Try session cookie
  const sessionId = req.cookies[SESSION_COOKIE] as string | undefined;
  if (sessionId) {
    const session = await sessionRepo.findById(sessionId);
    if (session && new Date() <= session.expiresAt) {
      const user = await userRepo.findById(session.adminId);
      if (user && user.status === UserStatus.Active) {
        const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        sessionRepo.updateExpiry(sessionId, newExpires).catch(() => {
          /* best-effort */
        });
        const permissions = await resolvePermissions(user.roleId);
        req.projectId = null;
        req.isAdmin = true;
        req.userPermissions = permissions;
        req.userRoleId = user.roleId;
        req.userId = user.id;
        next();
        return;
      }
      await sessionRepo.delete(sessionId).catch(() => {
        /* best-effort */
      });
    }
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  // Try API key
  const apiKey = req.headers[config.auth.apiKeyHeader];
  if (apiKey && typeof apiKey === 'string') {
    const keyRecord = await apiKeyRepo.findByKey(apiKey);
    if (keyRecord) {
      apiKeyRepo.updateLastUsed(keyRecord.id).catch(() => {
        /* best-effort */
      });
      req.projectId = keyRecord.projectId;
      req.isAdmin = false;
      req.userPermissions = null;
      req.userRoleId = null;
      req.userId = null;
      next();
      return;
    }
  }

  // No credentials — still pass through, but unauthenticated
  req.projectId = null;
  req.isAdmin = false;
  req.userPermissions = null;
  req.userRoleId = null;
  req.userId = null;
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
