import express, { Express } from 'express';
import cors from 'cors';
import { Server } from 'node:http';
import { AppConfig, loadConfig } from './config';
import { loadEnvironment } from './env';
import { DatabaseConnection } from './database/connection';
import createDeviceRoutes from './routes/deviceRoutes';
import { errorHandler } from './middleware/errorHandler';
import { apiLogger } from './middleware/logging';
import { log } from './logger';

loadEnvironment();

export interface AppDependencies {
  config: AppConfig;
  db: DatabaseConnection;
}

function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
  next();
}

function responseMeta(res: express.Response) {
  return { requestId: String(res.locals.requestId || 'unknown') };
}

export function createApp({ config, db }: AppDependencies): Express {
  const app = express();
  app.set('trust proxy', config.trustProxy);

  app.use(securityHeaders);
  app.use(apiLogger);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || config.frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by the API'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'Retry-After'],
  }));
  app.use(express.json({ limit: config.bodyLimit, type: 'application/json' }));
  app.use(express.urlencoded({ extended: false, limit: config.bodyLimit }));

  app.use('/api/devices', createDeviceRoutes(db, config));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'PhoneDB API',
      version: '1.0.0',
      endpoints: {
        health: '/health/ready',
        devices: '/api/devices',
        filters: '/api/devices/filters',
        search: '/api/devices/search',
      },
      meta: responseMeta(res),
    });
  });

  app.get('/health/live', (_req, res) => {
    res.status(200).json({
      success: true,
      status: 'ok',
      service: 'PhoneDB API',
      meta: responseMeta(res),
    });
  });

  app.get('/health/ready', async (_req, res) => {
    const databaseReady = await db.isHealthy();
    res.status(databaseReady ? 200 : 503).json({
      success: databaseReady,
      status: databaseReady ? 'ready' : 'not_ready',
      services: { database: databaseReady ? 'ready' : 'unavailable' },
      meta: responseMeta(res),
    });
  });

  app.get('/health', async (_req, res) => {
    const databaseReady = await db.isHealthy();
    res.status(databaseReady ? 200 : 503).json({
      success: databaseReady,
      status: databaseReady ? 'ok' : 'degraded',
      services: {
        database: {
          status: databaseReady ? 'connected' : 'unavailable',
          pool: db.getPoolStats(),
        },
      },
      meta: responseMeta(res),
    });
  });

  app.get('/api', (_req, res) => {
    res.json({
      success: true,
      service: 'PhoneDB API',
      version: '1.0.0',
      endpoints: {
        'GET /api/devices': 'Get devices with pagination',
        'GET /api/devices/filters': 'Get available filter options',
        'POST /api/devices/search': 'Search devices with filters',
        'GET /api/devices/:id': 'Get device details by ID',
      },
      meta: responseMeta(res),
    });
  });

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested API route does not exist',
        status: 404,
      },
      ...responseMeta(res),
    });
  });

  app.use(errorHandler);
  return app;
}

export async function startServer(): Promise<{ app: Express; server: Server; db: DatabaseConnection }> {
  const config = loadConfig();
  const db = new DatabaseConnection(config.db);
  await db.connect();
  const app = createApp({ config, db });
  const server = app.listen(config.port, () => {
    log('info', 'PhoneDB API started', {
      port: config.port,
      environment: config.env,
      frontendOrigins: config.frontendOrigins,
    });
  });

  return { app, server, db };
}

async function main(): Promise<void> {
  const runtime = await startServer();
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    log('info', 'Shutdown requested', { signal });

    await new Promise<void>((resolve) => runtime.server.close(() => resolve()));
    await runtime.db.close();
    log('info', 'PhoneDB API stopped');
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
}

if (require.main === module) {
  main().catch((error) => {
    log('error', 'PhoneDB API failed to start', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  });
}

export default createApp;
