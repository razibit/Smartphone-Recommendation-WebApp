import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { createApp } from '../backend/server';
import { loadConfig } from '../backend/config';
import { DatabaseConnection } from '../backend/database/connection';

test('app factory exposes liveness and consistent validation errors', async () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_USER: 'phonedb_test',
    DB_PASSWORD: 'test-password',
    DB_NAME: 'phonedb_test',
    FRONTEND_URL: 'http://localhost:3000',
  });
  const fakeDatabase = {
    isHealthy: async () => true,
    getPoolStats: () => ({ connectionLimit: 1, connected: true }),
  } as unknown as DatabaseConnection;
  const server = createApp({ config, db: fakeDatabase }).listen(0);
  await once(server, 'listening');

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = 'http://127.0.0.1:' + address.port;

  const live = await fetch(baseUrl + '/health/live');
  assert.equal(live.status, 200);
  assert.equal((await live.json()).success, true);

  const invalidId = await fetch(baseUrl + '/api/devices/not-an-id');
  const invalidPayload = await invalidId.json();
  assert.equal(invalidId.status, 400);
  assert.equal(invalidPayload.success, false);
  assert.equal(invalidPayload.error.code, 'VALIDATION_ERROR');
  assert.ok(invalidPayload.requestId);

  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});
