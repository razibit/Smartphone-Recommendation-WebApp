import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler';

export const validateJsonContent = (req: Request, _res: Response, next: NextFunction): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new ValidationError('Content-Type must be application/json');
    }
  }
  next();
};

export function requirePositiveId(value: unknown, field = 'id'): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new ValidationError(field + ' must be a positive integer');
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new ValidationError(field + ' must be a positive integer');
  }
  return parsed;
}
