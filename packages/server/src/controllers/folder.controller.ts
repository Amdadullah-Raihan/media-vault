// ---------------------------------------------------------------------------
// MediaVault – Folder Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { FolderService } from '../services';
import { CreateFolderInput, PaginationParams } from '../core/types';
import { ok, created, noContent } from '../utils/responses';

export class FolderController {
  private readonly service = new FolderService();

  private paramId(req: Request): string {
    const id = req.params.id;
    if (!id) throw new Error('Missing id param');
    return id;
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, parentId, name } = req.body as Record<string, unknown>;
      const input: CreateFolderInput = {
        projectId: projectId as string,
        parentId: (parentId as string | null) ?? null,
        name: name as string,
      };
      const folder = await this.service.create(input);
      created(res, folder);
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const folder = await this.service.getById(this.paramId(req));
      ok(res, folder);
    } catch (err) {
      next(err);
    }
  };

  public listByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params: PaginationParams = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      };
      const projectId = req.query.projectId as string;
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' },
        });
        return;
      }
      const result = await this.service.listByProjectId(projectId, params);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };

  public children = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const children = await this.service.listChildren(this.paramId(req));
      ok(res, children);
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
