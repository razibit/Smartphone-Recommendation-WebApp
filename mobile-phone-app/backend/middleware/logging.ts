import { Request, Response, NextFunction } from 'express';

export interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  responseTime?: number;
  statusCode?: number;
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  const requestLog: RequestLog = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || 'unknown'
  };

  console.log(`📥 ${requestLog.timestamp} - ${requestLog.method} ${requestLog.url} from ${requestLog.ip}`);

  // Override res.end to capture response time and status
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    console.log(`📤 ${requestLog.method} ${requestLog.url} - ${statusCode} (${responseTime}ms)`);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  // Only log API requests
  if (req.path.startsWith('/api/')) {
    return requestLogger(req, res, next);
  }
  next();
};