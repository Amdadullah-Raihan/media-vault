// ---------------------------------------------------------------------------
// MediaVault – File Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services';
import { PaginationParams, FileVisibility } from '../core/types';
import { ok, created, noContent } from '../utils/responses';
import path from 'node:path';

export class FileController {
  private readonly service = new FileService();

  // ---------------------------------------------------------------------------
  // Upload
  // ---------------------------------------------------------------------------

  public upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'No file provided' },
        });
        return;
      }

      const projectId = req.body.projectId as string;
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'projectId is required' },
        });
        return;
      }

      const metadata = await this.service.upload(projectId, file, {
        folderId: (req.body.folderId as string | null) ?? null,
        visibility: req.body.visibility as FileVisibility | undefined,
      });

      created(res, metadata);
    } catch (err) {
      next(err);
    }
  };

  // ---------------------------------------------------------------------------
  // Download
  // ---------------------------------------------------------------------------

  public download = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { metadata, stream } = await this.service.download(req.params.id!);

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalFilename}"`);
      res.setHeader('Content-Length', metadata.size);

      stream.pipe(res);
      stream.on('error', (err) => next(err));
    } catch (err) {
      next(err);
    }
  };

  // ---------------------------------------------------------------------------
  // Stream (range-request aware)
  // ---------------------------------------------------------------------------

  public stream = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const range = req.headers.range;
      const { metadata, stream, start, end, totalSize } = await this.service.stream(
        req.params.id!,
        range,
      );

      const chunkSize = end - start + 1;

      if (range) {
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
      } else {
        res.setHeader('Content-Length', totalSize);
      }

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${metadata.originalFilename}"`);

      stream.pipe(res);
      stream.on('error', (err) => next(err));
    } catch (err) {
      next(err);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metadata = await this.service.getById(req.params.id!);
      ok(res, metadata);
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

      const projectId = req.query.projectId as string;
      const folderId = req.query.folderId as string;

      if (folderId) {
        const result = await this.service.listByFolderId(folderId, params);
        ok(res, result);
      } else if (projectId) {
        const result = await this.service.listByProjectId(projectId, params);
        ok(res, result);
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'projectId or folderId query parameter is required',
          },
        });
      }
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metadata = await this.service.update(req.params.id!, {
        folderId: req.body.folderId as string | null | undefined,
        visibility: req.body.visibility as FileVisibility | undefined,
      });
      ok(res, metadata);
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
