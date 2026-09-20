import path from 'node:path';

export type NodeEnvironment = 'development' | 'test' | 'production';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  connectionLimit: number;
  ssl: boolean;
}

export interface AppConfig {
  env: NodeEnvironment;
  port: number;
  frontendOrigins: string[];
  trustProxy: boolean;
  bodyLimit: string;
  maxPageSize: number;
  exposeQueryDiagnostics: boolean;
  seedFile: string;
  db: DatabaseConfig;
}

const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:3000';

function readRequired(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function readInteger(env: NodeJS.ProcessEnv, key: string, fallback: number, minimum: number): number {
  const raw = env[key];
  if (raw === undefined || raw.trim() === '') return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(`${key} must be an integer greater than or equal to ${minimum}`);
  }
  return value;
}

function readBoolean(env: NodeJS.ProcessEnv, key: string, fallback: boolean): boolean {
  const raw = env[key];
  if (raw === undefined || raw.trim() === '') return fallback;

  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  throw new Error(`${key} must be true or false`);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const rawEnvironment = env.NODE_ENV || 'development';
  if (!['development', 'test', 'production'].includes(rawEnvironment)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  const environment = rawEnvironment as NodeEnvironment;
  const origins = (env.FRONTEND_URL || DEFAULT_FRONTEND_ORIGIN)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaultSeedFile = path.resolve(process.cwd(), '..', 'data', 'phones.csv');

  return {
    env: environment,
    port: readInteger(env, 'PORT', 3001, 1),
    frontendOrigins: origins,
    trustProxy: readBoolean(env, 'TRUST_PROXY', false),
    bodyLimit: env.BODY_LIMIT || '1mb',
    maxPageSize: readInteger(env, 'MAX_PAGE_SIZE', 100, 1),
    exposeQueryDiagnostics: environment !== 'production' && readBoolean(env, 'EXPOSE_QUERY_DIAGNOSTICS', false),
    seedFile: path.resolve(env.SEED_FILE || defaultSeedFile),
    db: {
      host: env.DB_HOST || 'localhost',
      port: readInteger(env, 'DB_PORT', 3306, 1),
      user: readRequired(env, 'DB_USER'),
      password: readRequired(env, 'DB_PASSWORD'),
      name: readRequired(env, 'DB_NAME'),
      connectionLimit: readInteger(env, 'DB_CONNECTION_LIMIT', 10, 1),
      ssl: readBoolean(env, 'DB_SSL', false),
    },
  };
}
