// ---------------------------------------------------------------------------
// MediaVault – Role Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { ok, created, noContent } from '../utils/responses';
import { CreateRoleInput, UpdateRoleInput } from '../core/types';

export class RoleController {
  constructor(private readonly roleService: RoleService) {}

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
  // GET /roles
  // -----------------------------------------------------------------------

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.roleService.getAll();
      ok(res, roles);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // GET /roles/:id
  // -----------------------------------------------------------------------

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = await this.roleService.getById(this.paramId(req));
      ok(res, role);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // POST /roles
  // -----------------------------------------------------------------------

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as Record<string, unknown>;
      const input: CreateRoleInput = {
        name: body.name as string,
        description: body.description as string,
        permissions: body.permissions as string[],
      };

      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      const role = await this.roleService.create(input, actorId, ip, userAgent);
      created(res, role);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /roles/:id
  // -----------------------------------------------------------------------

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as Record<string, unknown>;
      const input: UpdateRoleInput = {};

      if (body.name !== undefined) input.name = body.name as string;
      if (body.description !== undefined) input.description = body.description as string;
      if (body.permissions !== undefined) input.permissions = body.permissions as string[];

      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      const role = await this.roleService.update(this.paramId(req), input, actorId, ip, userAgent);
      ok(res, role);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // DELETE /roles/:id
  // -----------------------------------------------------------------------

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      await this.roleService.delete(this.paramId(req), actorId, ip, userAgent);
      noContent(res);
    } catch (err) {
      next(err);
    }
  };

  // -----------------------------------------------------------------------
  // POST /roles/:id/duplicate
  // -----------------------------------------------------------------------

  duplicate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip, userAgent } = this.clientInfo(req);
      const actorId = req.userId ?? 'system';
      const role = await this.roleService.duplicate(this.paramId(req), actorId, ip, userAgent);
      created(res, role);
    } catch (err) {
      next(err);
    }
  };
}
