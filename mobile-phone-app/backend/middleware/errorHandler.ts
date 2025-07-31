import { Request, Response, NextFunction } from 'express';

interface APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

interface DatabaseError extends Error {
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

export const errorHandler = (
  error: APIError | DatabaseError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle different types of errors
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal Server Error';
  let details = undefined;

  // Database errors
  if ('errno' in error) {
    const dbError = error as DatabaseError;
    switch (dbError.errno) {
      case 1062: // Duplicate entry
        status = 409;
        code = 'DUPLICATE_ENTRY';
        message = 'Duplicate entry found';
        break;
      case 1452: // Foreign key constraint
        status = 400;
        code = 'FOREIGN_KEY_CONSTRAINT';
        message = 'Foreign key constraint violation';
        break;
      case 1054: // Unknown column
        status = 400;
        code = 'INVALID_COLUMN';
        message = 'Invalid column in query';
        break;
      case 1146: // Table doesn't exist
        status = 500;
        code = 'TABLE_NOT_FOUND';
        message = 'Database table not found';
        break;
      default:
        status = 500;
        code = 'DATABASE_ERROR';
        message = 'Database operation failed';
        details = process.env.NODE_ENV === 'development' ? dbError.sqlMessage : undefined;
    }
  }
  // API errors with custom status
  else if ('status' in error && error.status) {
    status = error.status;
    code = error.code || 'API_ERROR';
    message = error.message;
    details = error.details;
  }
  // Validation errors
  else if (error.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = error.message;
  }
  // JSON parsing errors
  else if (error.name === 'SyntaxError' && 'body' in error) {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }
  // Default error handling
  else {
    status = (error as APIError).status || 500;
    code = (error as APIError).code || 'INTERNAL_ERROR';
    message = error.message || 'Internal Server Error';
  }

  // Send error response
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      status,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }
  };

  res.status(status).json(errorResponse);
};

// Custom error classes for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code: string = 'API_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class DatabaseConnectionError extends APIError {
  constructor(message: string = 'Database connection failed') {
    super(message, 503, 'DATABASE_CONNECTION_ERROR');
    this.name = 'DatabaseConnectionError';
  }
}