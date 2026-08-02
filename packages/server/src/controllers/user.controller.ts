// ---------------------------------------------------------------------------
// MediaVault – User Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ok, created, noContent } from '../utils/responses';
import { CreateUserInput, UpdateUserInput } from '../core/types';

export class UserController {
  constructor(private readonly userService: UserService) {}

  private paramId(req: Request): string {
    const id = req.params.id;
    if (!id) throw new Error('Missing id param');
    return id;
  }

  private clientInfo(req: Request): { ip: string; userAgent: string } {
    const forwarded = req.headers['x-forwarded-for'];
    const ua = req.headers['user-agent'];
    return {
      ip: typeof forwarded === 'string' ? forwarded : (req.ip ?? 'unknown'),
      userAgent: typeof ua === 'string' ? ua : 'unknown',
    };
  }

  // -----------------------------------------------------------------------
  // GET /users
  // -----------------------------------------------------------------------

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profiles = await this.userService.listProfiles();
      ok(res, profiles);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // GET /users/:id
  // -----------------------------------------------------------------------

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.userService.getProfile(this.paramId(req));
      ok(res, profile);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // POST /users
  // -----------------------------------------------------------------------

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as Record<string, unknown>;
      const input: CreateUserInput = {
        username: body.username as string,
        email: body.email as string,
        password: body.password as string,
        firstName: body.firstName as string,
        lastName: body.lastName as string,
        roleId: body.roleId as string,
        assignedProjectIds: body.assignedProjectIds as string[] | undefined,
      };

      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      const profile = await this.userService.create(input, actorId, ip, userAgent);
      created(res, profile);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /users/:id
  // -----------------------------------------------------------------------

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as Record<string, unknown>;
      const input: UpdateUserInput = {};

      if (body.firstName !== undefined) input.firstName = body.firstName as string;
      if (body.lastName !== undefined) input.lastName = body.lastName as string;
      if (body.email !== undefined) input.email = body.email as string;
      if (body.roleId !== undefined) input.roleId = body.roleId as string;
      if (body.assignedProjectIds !== undefined)
        input.assignedProjectIds = body.assignedProjectIds as string[];
      if (body.status !== undefined) input.status = body.status as UpdateUserInput['status'];

      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      const profile = await this.userService.update(
        this.paramId(req),
        input,
        actorId,
        ip,
        userAgent,
      );
      ok(res, profile);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // DELETE /users/:id
  // -----------------------------------------------------------------------

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      await this.userService.softDelete(this.paramId(req), actorId, ip, userAgent);
      noContent(res);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // POST /users/:id/suspend
  // -----------------------------------------------------------------------

  suspend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      const profile = await this.userService.suspend(this.paramId(req), actorId, ip, userAgent);
      ok(res, profile);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // POST /users/:id/restore
  // -----------------------------------------------------------------------

  restore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      const profile = await this.userService.restore(this.paramId(req), actorId, ip, userAgent);
      ok(res, profile);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // POST /users/:id/unlock
  // -----------------------------------------------------------------------

  unlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      const profile = await this.userService.unlock(this.paramId(req), actorId, ip, userAgent);
      ok(res, profile);
    } catch (err) {
      next(err);
    }
  };
}
