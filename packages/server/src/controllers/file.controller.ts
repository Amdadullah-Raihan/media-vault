// ---------------------------------------------------------------------------
// MediaVault – File Controller
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services';
import { FileVisibility } from '../core/types';
import { ok, created, noContent } from '../utils/responses';

export class FileController {
  private readonly service = new FileService();

  private paramId(req: Request): string {
    const id = req.params.id;
    if (!id) throw new Error('Missing id param');
    return id;
  }

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

      const { projectId, folderId, visibility } = req.body as Record<string, unknown>;
      if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'projectId is required' },
        });
        return;
      }

      const metadata = await this.service.upload(projectId, file, {
        folderId: (folderId as string | null) ?? null,
        visibility: visibility as FileVisibility | undefined,
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
      const { metadata, stream } = await this.service.download(this.paramId(req));

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalFilename}"`);
      res.setHeader('Content-Length', metadata.size);

      stream.pipe(res);
      stream.on('error', (err) => {
        next(err);
      });
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
        this.paramId(req),
        range,
      );

      const chunkSize = end - start + 1;

      if (range) {
        res.status(206);
        res.setHeader(
          'Content-Range',
          `bytes ${String(start)}-${String(end)}/${String(totalSize)}`,
        );
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
      } else {
        res.setHeader('Content-Length', totalSize);
      }

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${metadata.originalFilename}"`);

      stream.pipe(res);
      stream.on('error', (err) => {
        next(err);
      });
    } catch (err) {
      next(err);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metadata = await this.service.getById(this.paramId(req));
      ok(res, metadata);
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const projectId = req.query.projectId as string | undefined;
      const folderId = req.query.folderId as string | undefined;
      const search = req.query.search as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

      const result = await this.service.list({
        projectId,
        folderId,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      ok(res, result);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { folderId, visibility } = req.body as Record<string, unknown>;
      const metadata = await this.service.update(this.paramId(req), {
        folderId: folderId as string | null | undefined,
        visibility: visibility as FileVisibility | undefined,
      });
      ok(res, metadata);
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
