import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../backend/config';

const baseEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_USER: 'phonedb_test',
  DB_PASSWORD: 'test-password',
  DB_NAME: 'phonedb_test',
};

test('loads explicit database configuration without credential fallbacks', () => {
  const config = loadConfig(baseEnvironment);

  assert.equal(config.db.host, 'localhost');
  assert.equal(config.db.user, 'phonedb_test');
  assert.equal(config.db.name, 'phonedb_test');
  assert.equal(config.maxPageSize, 100);
  assert.equal(config.exposeQueryDiagnostics, false);
});

test('requires database credentials and name', () => {
  const environment: NodeJS.ProcessEnv = { ...baseEnvironment };
  delete environment.DB_PASSWORD;

  assert.throws(
    () => loadConfig(environment),
    /Missing required environment variable: DB_PASSWORD/,
  );
});

test('never enables diagnostics in production', () => {
  const config = loadConfig({
    ...baseEnvironment,
    NODE_ENV: 'production',
    EXPOSE_QUERY_DIAGNOSTICS: 'true',
  });

  assert.equal(config.exposeQueryDiagnostics, false);
});

test('rejects invalid numeric configuration', () => {
  assert.throws(
    () => loadConfig({ ...baseEnvironment, DB_PORT: 'not-a-port' }),
    /DB_PORT must be an integer/,
  );
});
