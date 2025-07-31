import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface Migration {
  id: string;
  name: string;
  filePath: string;
}

class MigrationRunner {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'bbbb',
      database: process.env.DB_NAME || 'mobile_specs',
      multipleStatements: true
    });
    console.log('Connected to MySQL server');
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('Disconnected from MySQL server');
    }
  }

  async createMigrationsTable(): Promise<void> {
    if (!this.connection) throw new Error('Not connected to database');

    await this.connection.query('CREATE DATABASE IF NOT EXISTS mobile_specs');
    await this.connection.query('USE mobile_specs');
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Migrations table ready');
  }

  async getExecutedMigrations(): Promise<string[]> {
    if (!this.connection) throw new Error('Not connected to database');

    try {
      const [rows] = await this.connection.execute('SELECT id FROM migrations ORDER BY executed_at');
      return (rows as any[]).map(row => row.id);
    } catch (error) {
      // If migrations table doesn't exist yet, return empty array
      return [];
    }
  }

  async getMigrationFiles(): Promise<Migration[]> {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => ({
      id: file.replace('.sql', ''),
      name: file,
      filePath: path.join(migrationsDir, file)
    }));
  }

  async executeMigration(migration: Migration): Promise<void> {
    if (!this.connection) throw new Error('Not connected to database');

    console.log(`Executing migration: ${migration.name}`);
    
    const sql = fs.readFileSync(migration.filePath, 'utf8');
    
    try {
      // Split SQL into individual statements and execute them
      const statements = sql.split(';').filter(stmt => {
        const trimmed = stmt.trim();
        return trimmed.length > 0 && !trimmed.startsWith('--');
      });
      
      for (const statement of statements) {
        const trimmedStatement = statement.trim();
        if (trimmedStatement && !trimmedStatement.startsWith('--')) {
          if (trimmedStatement.toUpperCase().startsWith('USE ') || 
              trimmedStatement.toUpperCase().startsWith('DROP DATABASE') ||
              trimmedStatement.toUpperCase().startsWith('CREATE DATABASE') ||
              trimmedStatement.toUpperCase().startsWith('ALTER TABLE')) {
            await this.connection.query(trimmedStatement);
          } else {
            await this.connection.execute(trimmedStatement);
          }
        }
      }
      
      // Reconnect to the database after schema creation
      await this.disconnect();
      await this.connect();
      await this.createMigrationsTable();
      
      // Record migration as executed
      await this.connection.execute(
        'INSERT INTO migrations (id, name) VALUES (?, ?)',
        [migration.id, migration.name]
      );
      
      console.log(`✅ Migration ${migration.name} executed successfully`);
    } catch (error) {
      console.error(`❌ Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    await this.connect();
    await this.createMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = await this.getMigrationFiles();

    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration.id)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      await this.executeMigration(migration);
    }

    console.log('All migrations completed successfully');
  }

  async rollbackLastMigration(): Promise<void> {
    await this.connect();
    
    const executedMigrations = await this.getExecutedMigrations();
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1];
    console.log(`Rolling back migration: ${lastMigration}`);

    // For this implementation, we'll just drop and recreate the database
    // In a production system, you'd want proper rollback scripts
    await this.connection!.execute('DROP DATABASE IF EXISTS mobile_specs');
    await this.connection!.execute('DELETE FROM migrations WHERE id = ?', [lastMigration]);
    
    console.log(`✅ Rolled back migration: ${lastMigration}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const runner = new MigrationRunner();

  try {
    switch (command) {
      case 'up':
        await runner.runMigrations();
        break;
      case 'rollback':
        await runner.rollbackLastMigration();
        break;
      default:
        console.log('Usage: npm run migrate [up|rollback]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await runner.disconnect();
  }
}

if (require.main === module) {
  main();
}

export { MigrationRunner };