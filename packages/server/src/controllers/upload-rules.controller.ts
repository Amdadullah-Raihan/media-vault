// ---------------------------------------------------------------------------
// MediaVault – Upload Rules Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { UploadRuleService } from '../services/upload-rule.service';
import { ok } from '../utils/responses';

export class UploadRulesController {
  private readonly service = new UploadRuleService();

  // GET /upload-rules
  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.seedIfEmpty();
      const rules = await this.service.getAll();
      ok(res, rules);
    } catch (err) {
      next(err);
    }
  };

  // PATCH /upload-rules/category/:category
  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = req.params.category;
      if (!category) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Category is required' },
        });
        return;
      }
      const { enabled, maxSize } = req.body as Record<string, unknown>;
      const result = await this.service.updateCategory(category, {
        enabled: typeof enabled === 'boolean' ? enabled : undefined,
        maxSize: typeof maxSize === 'number' ? maxSize : undefined,
      });
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };

  // PATCH /upload-rules/extension/:category/:extension
  updateExtension = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = req.params.category;
      const extension = req.params.extension;
      if (!category || !extension) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Category and extension are required' },
        });
        return;
      }
      const { enabled, maxSize } = req.body as Record<string, unknown>;
      const result = await this.service.updateExtension(category, extension, {
        enabled: typeof enabled === 'boolean' ? enabled : undefined,
        maxSize: maxSize === null || typeof maxSize === 'number' ? maxSize : undefined,
      });
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };
}
