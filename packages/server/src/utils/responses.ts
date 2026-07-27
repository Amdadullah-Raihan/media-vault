// ---------------------------------------------------------------------------
// MediaVault – API Response Helpers
//
// Every response from the API uses one of these consistent shapes.
// Never return ad-hoc objects – always use these builders.
// ---------------------------------------------------------------------------

import { Response } from 'express';
import { PaginatedResult } from '../core/types';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Success builders
// ---------------------------------------------------------------------------

export function ok<T>(res: Response, data: T, statusCode = 200): void {
  const body: ApiSuccessResponse<T> = { success: true, data };
  res.status(statusCode).json(body);
}

export function created<T>(res: Response, data: T): void {
  ok(res, data, 201);
}

export function noContent(res: Response): void {
  res.status(204).send();
}

export function paginated<T>(res: Response, result: PaginatedResult<T>): void {
  ok(res, result);
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

export function error(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message, details },
  };
  res.status(statusCode).json(body);
}
