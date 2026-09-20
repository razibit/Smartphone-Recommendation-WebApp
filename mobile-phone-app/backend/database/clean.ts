import mysql from 'mysql2/promise';
import { AppConfig, loadConfig } from '../config';
import { MigrationRunner } from './migrate';
import { log } from '../logger';
import { loadEnvironment } from '../env';

loadEnvironment();

export class DatabaseCleaner {
  constructor(private readonly config: AppConfig = loadConfig()) {}

  async cleanDatabase(confirm = false): Promise<void> {
    if (this.config.env === 'production') {
      throw new Error('Database cleanup is disabled in production');
    }
    if (!confirm) {
      throw new Error('Database cleanup requires the explicit --confirm flag');
    }

    const connection = await mysql.createConnection({
      host: this.config.db.host,
      port: this.config.db.port,
      user: this.config.db.user,
      password: this.config.db.password,
      ssl: this.config.db.ssl ? { rejectUnauthorized: true } : undefined,
    });

    try {
      const tick = String.fromCharCode(96);
      const identifier = tick + this.config.db.name.replaceAll(tick, tick + tick) + tick;
      await connection.query('DROP DATABASE IF EXISTS ' + identifier);
      await connection.query(
        'CREATE DATABASE ' + identifier + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
      );
      log('info', 'Development database recreated', { database: this.config.db.name });
    } finally {
      await connection.end();
    }
  }
}

async function main(): Promise<void> {
  const config = loadConfig();
  const cleaner = new DatabaseCleaner(config);
  await cleaner.cleanDatabase(process.argv.includes('--confirm'));
  const runner = new MigrationRunner(config);
  try {
    await runner.runMigrations();
  } finally {
    await runner.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    log('error', 'Database cleanup failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  });
}
