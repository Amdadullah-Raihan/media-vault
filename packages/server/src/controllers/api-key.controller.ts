// ---------------------------------------------------------------------------
// MediaVault – API Key Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services';
import { CreateApiKeyInput } from '../core/types';
import { ok, created, noContent } from '../utils/responses';

export class ApiKeyController {
  private readonly service = new ApiKeyService();

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, label } = req.body as Record<string, unknown>;
      const input: CreateApiKeyInput = {
        projectId: projectId as string,
        label: label as string | undefined,
      };
      const result = await this.service.create(input);
      created(res, result);
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const keys = projectId
        ? await this.service.listByProjectId(projectId)
        : await this.service.listAll();
      ok(res, keys);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' },
        });
        return;
      }
      const id = req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'id param is required' },
        });
        return;
      }
      await this.service.delete(id, projectId);
      noContent(res);
    } catch (err) {
      next(err);
    }
  };
}
