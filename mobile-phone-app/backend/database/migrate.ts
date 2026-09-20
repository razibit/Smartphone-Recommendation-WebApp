import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import mysql, { Connection, RowDataPacket } from 'mysql2/promise';
import { loadConfig, AppConfig } from '../config';
import { loadEnvironment } from '../env';
import { log } from '../logger';

loadEnvironment();

interface Migration {
  id: string;
  name: string;
  filePath: string;
  checksum: string;
}

interface ExecutedMigration extends RowDataPacket {
  id: string;
  name: string;
  checksum: string | null;
  executed_at: Date;
}

function quoteIdentifier(value: string): string {
  const tick = String.fromCharCode(96);
  return tick + value.replaceAll(tick, tick + tick) + tick;
}

export class MigrationRunner {
  private connection: Connection | null = null;

  constructor(private readonly config: AppConfig = loadConfig()) {}

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: this.config.db.host,
        port: this.config.db.port,
        user: this.config.db.user,
        password: this.config.db.password,
        multipleStatements: true,
        ssl: this.config.db.ssl ? { rejectUnauthorized: true } : undefined,
      });

      await this.connection.query(
        'CREATE DATABASE IF NOT EXISTS ' + quoteIdentifier(this.config.db.name) + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
      );
      await this.connection.query('USE ' + quoteIdentifier(this.config.db.name));
    } catch {
      await this.disconnect();
      throw new Error('Unable to connect to the configured MySQL server');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    await this.connection.end();
    this.connection = null;
  }

  private getConnection(): Connection {
    if (!this.connection) throw new Error('Migration runner is not connected');
    return this.connection;
  }

  async createMigrationsTable(): Promise<void> {
    const connection = this.getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        checksum CHAR(64) NULL,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [columns] = await connection.query<RowDataPacket[]>('SHOW COLUMNS FROM migrations LIKE ?', ['checksum']);
    if (columns.length === 0) {
      await connection.query('ALTER TABLE migrations ADD COLUMN checksum CHAR(64) NULL AFTER name');
    }
  }

  async getExecutedMigrations(): Promise<Map<string, ExecutedMigration>> {
    const connection = this.getConnection();
    const [rows] = await connection.execute<ExecutedMigration[]>(
      'SELECT id, name, checksum, executed_at FROM migrations ORDER BY executed_at, id',
    );
    return new Map(rows.map((row) => [row.id, row]));
  }

  async getMigrationFiles(): Promise<Migration[]> {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = (await fs.readdir(migrationsDir))
      .filter((file) => /^\d+_.+\.sql$/i.test(file))
      .sort();

    return Promise.all(files.map(async (file) => {
      const filePath = path.join(migrationsDir, file);
      const contents = await fs.readFile(filePath);
      return {
        id: file.replace(/\.sql$/i, ''),
        name: file,
        filePath,
        checksum: crypto.createHash('sha256').update(contents).digest('hex'),
      };
    }));
  }

  async status(): Promise<{ applied: string[]; pending: string[] }> {
    await this.connect();
    await this.createMigrationsTable();
    const executed = await this.getExecutedMigrations();
    const migrations = await this.getMigrationFiles();
    return {
      applied: migrations.filter((migration) => executed.has(migration.id)).map((migration) => migration.id),
      pending: migrations.filter((migration) => !executed.has(migration.id)).map((migration) => migration.id),
    };
  }

  async runMigrations(): Promise<void> {
    await this.connect();
    await this.createMigrationsTable();
    const connection = this.getConnection();
    const [lockRows] = await connection.query<RowDataPacket[]>(
      'SELECT GET_LOCK(?, 30) AS acquired',
      ['phonedb:migrations'],
    );
    if (Number(lockRows[0]?.acquired) !== 1) {
      throw new Error('Unable to acquire the database migration lock');
    }

    try {
      const executed = await this.getExecutedMigrations();
      const migrations = await this.getMigrationFiles();

      for (const migration of migrations) {
        const existing = executed.get(migration.id);
        if (existing) {
          if (existing.checksum && existing.checksum !== migration.checksum) {
            throw new Error('Migration checksum mismatch: ' + migration.name);
          }
          continue;
        }

        log('info', 'Applying database migration', { migration: migration.name });
        const sql = await fs.readFile(migration.filePath, 'utf8');
        await connection.query(sql);
        await connection.execute(
          'INSERT INTO migrations (id, name, checksum) VALUES (?, ?, ?)',
          [migration.id, migration.name, migration.checksum],
        );
      }
    } finally {
      await connection.query('SELECT RELEASE_LOCK(?)', ['phonedb:migrations']);
    }
  }

  async rollbackLastMigration(): Promise<never> {
    throw new Error('Database migrations are forward-only. Create and review a new down migration explicitly instead of deleting the database.');
  }
}

async function main(): Promise<void> {
  const command = process.argv[2] || 'up';
  const runner = new MigrationRunner();

  try {
    if (command === 'up') {
      await runner.runMigrations();
      log('info', 'Database migrations completed');
    } else if (command === 'status') {
      const status = await runner.status();
      console.log(JSON.stringify(status, null, 2));
    } else if (command === 'rollback') {
      await runner.rollbackLastMigration();
    } else {
      throw new Error('Usage: npm run migrate -- [up|status]');
    }
  } finally {
    await runner.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    log('error', 'Database migration failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  });
}
