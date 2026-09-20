import { Request, Response, NextFunction } from 'express';
import { log } from '../logger';

export interface DatabaseErrorLike extends Error {
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
  code?: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = 'API_ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(resource + ' not found', 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class DatabaseConnectionError extends APIError {
  constructor(message = 'Database connection failed') {
    super(message, 503, 'DATABASE_CONNECTION_ERROR');
    this.name = 'DatabaseConnectionError';
  }
}

function isDatabaseError(error: unknown): error is DatabaseErrorLike {
  return Boolean(error && typeof error === 'object' && 'errno' in error);
}

function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

function databaseErrorResponse(error: DatabaseErrorLike): Pick<APIError, 'status' | 'code' | 'message'> {
  switch (error.errno) {
    case 1062:
      return { status: 409, code: 'DUPLICATE_ENTRY', message: 'The requested record already exists' };
    case 1452:
      return { status: 400, code: 'FOREIGN_KEY_CONSTRAINT', message: 'The request references an unavailable record' };
    case 1054:
      return { status: 500, code: 'DATABASE_SCHEMA_ERROR', message: 'The database schema is not compatible with this service' };
    case 1146:
      return { status: 503, code: 'DATABASE_NOT_READY', message: 'The database schema is not ready' };
    default:
      return { status: 503, code: 'DATABASE_ERROR', message: 'The database operation could not be completed' };
  }
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = String(res.locals.requestId || 'unknown');
  log('error', 'Request failed', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    errorType: error instanceof Error ? error.name : 'UnknownError',
    errorMessage: isDatabaseError(error) ? 'database operation failed' : error instanceof Error ? error.message : 'unknown error',
  });

  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal Server Error';
  let details: unknown;

  if (isDatabaseError(error)) {
    ({ status, code, message } = databaseErrorResponse(error));
  } else if (isAPIError(error)) {
    ({ status, code, message, details } = error);
  } else if (error instanceof SyntaxError && 'body' in error) {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  const response: {
    success: false;
    error: { code: string; message: string; status: number; details?: unknown };
    requestId: string;
  } = {
    success: false,
    error: { code, message, status },
    requestId,
  };

  if (process.env.NODE_ENV !== 'production' && details !== undefined) {
    response.error.details = details;
  }

  res.status(status).json(response);
}
