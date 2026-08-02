// ---------------------------------------------------------------------------
// MediaVault – Global Error Handler Middleware
//
// Catches all errors thrown from controllers/services and maps them to
// consistent JSON responses.
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/errors';
import { error } from '../utils/responses';
import { getLogger } from '../utils/logger';
import multer from 'multer';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const logger = getLogger();

  // Multer errors (file too large, wrong field name, etc.)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error(res, 413, 'PAYLOAD_TOO_LARGE', 'File exceeds the maximum upload size');
      return;
    }
    error(res, 400, 'UPLOAD_ERROR', err.message);
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    error(res, err.statusCode, err.errorCode, err.message, err.details);
    return;
  }

  // Unexpected errors — log and return generic 500
  logger.error({ err }, 'Unhandled error');
  error(res, 500, 'INTERNAL_ERROR', 'An unexpected internal error occurred');
}
