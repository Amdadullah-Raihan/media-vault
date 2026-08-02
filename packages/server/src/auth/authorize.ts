// ---------------------------------------------------------------------------
// MediaVault – Authorization Middleware
//
// After authentication, this middleware checks whether the user has the
// required permission. Use after `authenticate` in route definitions.
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/responses';

/**
 * Require a specific permission. Must be used after `authenticate`.
 *
 * @example
 * router.post('/users', authenticate, authorize('users.create'), userController.create);
 */
export function authorize(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Auth disabled — pass through
    if (req.userPermissions === null && !req.isAdmin && !req.projectId) {
      next();
      return;
    }

    // API key auth — skip permission checks (they use project-scoped access)
    if (!req.isAdmin && req.projectId) {
      next();
      return;
    }

    if (!req.userPermissions || req.userPermissions.length === 0) {
      error(res, 403, 'FORBIDDEN', 'You do not have permission to access this resource.');
      return;
    }

    const perms = req.userPermissions;
    const hasPermission = requiredPermissions.some((perm) => perms.includes(perm));

    if (!hasPermission) {
      error(res, 403, 'FORBIDDEN', 'You do not have permission to access this resource.');
      return;
    }

    next();
  };
}

/**
 * Require Owner role. Must be used after `authenticate`.
 */
export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAdmin) {
    error(res, 403, 'FORBIDDEN', 'Only the Owner can perform this action.');
    return;
  }

  if (req.userRoleId !== 'owner') {
    error(res, 403, 'FORBIDDEN', 'Only the Owner can perform this action.');
    return;
  }

  next();
}
