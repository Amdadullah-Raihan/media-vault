// ---------------------------------------------------------------------------
// MediaVault – Project Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services';
import { CreateProjectInput, PaginationParams } from '../core/types';
import { ok, created, noContent } from '../utils/responses';

export class ProjectController {
  private readonly service = new ProjectService();

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input: CreateProjectInput = {
        name: req.body.name as string,
        description: req.body.description ?? null,
      };
      const project = await this.service.create(input);
      created(res, project);
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.service.getById(req.params.id!);
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
      await this.service.delete(req.params.id!);
      noContent(res);
    } catch (err) {
      next(err);
    }
  };
}
