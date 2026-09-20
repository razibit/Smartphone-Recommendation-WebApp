import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../../backend/config';
import { DatabaseConnection } from '../../backend/database/connection';
import { MigrationRunner } from '../../backend/database/migrate';
import { QueryBuilder } from '../../backend/database/queryBuilder';
import { CSVSeeder } from '../../backend/database/seeders/csvSeeder';

const enabled = process.env.RUN_MYSQL_INTEGRATION === 'true';

test('migrations, seed idempotency, filtering, and details work against disposable MySQL', { skip: !enabled }, async () => {
  const testDatabaseName = process.env.TEST_DB_NAME;
  assert.ok(testDatabaseName, 'TEST_DB_NAME is required when RUN_MYSQL_INTEGRATION=true');

  const config = loadConfig({
    ...process.env,
    NODE_ENV: 'test',
    DB_NAME: testDatabaseName,
    SEED_FILE: process.env.SEED_FILE || '../data/phones.csv',
  });

  const migrations = new MigrationRunner(config);
  await migrations.runMigrations();
  const status = await migrations.status();
  assert.equal(status.pending.length, 0);
  await migrations.disconnect();

  const seeder = new CSVSeeder(config);
  await seeder.seedFromCSV(config.seedFile, 2);
  await seeder.seedFromCSV(config.seedFile, 2);
  await seeder.close();

  const db = new DatabaseConnection(config.db);
  await db.connect();
  const queryBuilder = new QueryBuilder(db);
  const list = await queryBuilder.execute(queryBuilder.buildFilterQuery({}, {}, { page: 1, limit: 10 }));
  const phones = Array.isArray(list.results) ? list.results : [];
  assert.ok(phones.length > 0);

  const phoneId = Number((phones[0] as { phone_id?: number }).phone_id);
  const details = await queryBuilder.execute(queryBuilder.buildDetailsQuery(phoneId));
  assert.equal(Array.isArray(details.results), true);
  assert.equal((details.results as Array<{ phone_id: number }>)[0]?.phone_id, phoneId);
  await db.close();
});
