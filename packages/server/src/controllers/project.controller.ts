// ---------------------------------------------------------------------------
// MediaVault – Project Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services';
import { CreateProjectInput, PaginationParams } from '../core/types';
import { ok, created, noContent } from '../utils/responses';

export class ProjectController {
  private readonly service = new ProjectService();

  private paramId(req: Request): string {
    const id = req.params.id;
    if (!id) throw new Error('Missing id param');
    return id;
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description } = req.body as Record<string, unknown>;
      const input: CreateProjectInput = {
        name: name as string,
        description: (description as string | null | undefined) ?? null,
      };
      const project = await this.service.create(input);
      created(res, project);
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.service.getById(this.paramId(req));
      ok(res, project);
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params: PaginationParams = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      };
      const result = await this.service.list(params);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(this.paramId(req));
      noContent(res);
    } catch (err) {
      next(err);
    }
  };
}
