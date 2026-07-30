// ---------------------------------------------------------------------------
// MediaVault – Custom Error Classes
//
// Every layer throws domain-specific errors. The presentation layer catches
// them and transforms into consistent HTTP responses.
// ---------------------------------------------------------------------------

/**
 * Base class for all application errors. Never instantiate directly.
 */
export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;

  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

// ---------------------------------------------------------------------------
// 4xx Client Errors
// ---------------------------------------------------------------------------

export class NotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly errorCode = 'NOT_FOUND';

  public constructor(resource: string, id?: string) {
    const detail = id ? `${resource} with id "${id}" was not found` : `${resource} was not found`;
    super(detail);
  }
}

export class ValidationError extends AppError {
  public readonly statusCode = 400;
  public readonly errorCode = 'VALIDATION_ERROR';

  public constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;
  public readonly errorCode = 'UNAUTHORIZED';

  public constructor(message = 'Authentication is required') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  public readonly statusCode = 403;
  public readonly errorCode = 'FORBIDDEN';

  public constructor(message = 'You do not have permission to access this resource') {
    super(message);
  }
}

export class ConflictError extends AppError {
  public readonly statusCode = 409;
  public readonly errorCode = 'CONFLICT';

  public constructor(message: string) {
    super(message);
  }
}

export class PayloadTooLargeError extends AppError {
  public readonly statusCode = 413;
  public readonly errorCode = 'PAYLOAD_TOO_LARGE';

  public constructor(maxBytes: number) {
    super(`File exceeds the maximum upload size of ${String(maxBytes)} bytes`);
  }
}

export class UnsupportedMediaTypeError extends AppError {
  public readonly statusCode = 415;
  public readonly errorCode = 'UNSUPPORTED_MEDIA_TYPE';

  public constructor(mimeType: string) {
    super(`MIME type "${mimeType}" is not allowed`);
  }
}

export class RateLimitError extends AppError {
  public readonly statusCode = 429;
  public readonly errorCode = 'RATE_LIMIT_EXCEEDED';

  public constructor(message = 'Too many requests, please try again later') {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// 5xx Server Errors
// ---------------------------------------------------------------------------

export class InternalError extends AppError {
  public readonly statusCode = 500;
  public readonly errorCode = 'INTERNAL_ERROR';

  public constructor(message = 'An unexpected internal error occurred') {
    super(message);
  }
}

export class StorageError extends AppError {
  public readonly statusCode = 500;
  public readonly errorCode = 'STORAGE_ERROR';

  public constructor(message: string) {
    super(message);
  }
}

export class NotSupportedError extends AppError {
  public readonly statusCode = 501;
  public readonly errorCode = 'NOT_SUPPORTED';

  public constructor(feature: string) {
    super(`${feature} is not supported by the configured storage driver`);
  }
}
