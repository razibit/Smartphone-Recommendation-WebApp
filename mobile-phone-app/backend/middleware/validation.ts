import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (page < 1) {
    throw new ValidationError('Page must be a positive integer');
  }

  if (limit < 1 || limit > 100) {
    throw new ValidationError('Limit must be between 1 and 100');
  }

  // Add pagination params to request for easy access
  (req as any).pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  } as PaginationParams;

  next();
};

export const validateJsonContent = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new ValidationError('Content-Type must be application/json');
    }
  }
  next();
};

export const validateRequiredFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    next();
  };
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic input sanitization
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potential XSS attempts
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/javascript:/gi, '')
                  .trim();
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  next();
};