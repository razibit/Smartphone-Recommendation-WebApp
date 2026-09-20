import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { log } from '../logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.get('X-Request-ID')?.trim() || randomUUID();
  const startedAt = performance.now();

  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    log('info', 'HTTP request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
      userAgent: req.get('User-Agent') || undefined,
    });
  });

  next();
};

export const apiLogger = requestLogger;
