// ---------------------------------------------------------------------------
// MediaVault – Validation Helpers
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { error } from '../utils/responses';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Express middleware factory: validates a specific request property against a
 * Zod schema. Sends a 400 response on failure.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = formatZodErrors(result.error);
      error(res, 400, 'VALIDATION_ERROR', 'Request validation failed', details);
      return;
    }

    // Replace the request property with the parsed (and coerced) value
    req[target] = result.data as Record<string, unknown>;
    next();
  };
}

function formatZodErrors(zodError: ZodError): { path: string; message: string }[] {
  return zodError.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));
}
