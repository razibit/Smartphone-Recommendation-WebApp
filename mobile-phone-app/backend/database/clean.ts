import { DatabaseConnection } from './connection';
import { MigrationRunner } from './migrate';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseCleaner {
  private db: DatabaseConnection;

  constructor() {
    this.db = new DatabaseConnection();
  }

  async cleanDatabase(): Promise<void> {
    console.log('🧹 Starting database cleanup...');
    
    try {
      // Get list of all tables first
      const tables = await this.getAllTables();
      console.log(`Found ${tables.length} tables to clean`);

      if (tables.length > 0) {
        // Disable foreign key checks temporarily
        await this.db.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // Drop all tables
        for (const table of tables) {
          console.log(`Dropping table: ${table}`);
          await this.db.query(`DROP TABLE IF EXISTS \`${table}\``);
        }
        
        // Re-enable foreign key checks
        await this.db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ All tables dropped successfully');
      }

      // Drop and recreate database for fresh start
      console.log('🔄 Recreating database...');
      
      // Create raw connection for database-level operations (without specifying database)
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'bbbb',
        multipleStatements: true
      });
      
      await connection.query('DROP DATABASE IF EXISTS mobile_specs');
      await connection.query('CREATE DATABASE mobile_specs');
      await connection.end();
      console.log('✅ Database recreated successfully');
      
      console.log('✅ Database cleaned successfully');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
      throw error;
    }
  }

  private async getAllTables(): Promise<string[]> {
    try {
      const result = await this.db.query('SHOW TABLES');
      return result.results.map((row: any) => Object.values(row)[0] as string);
    } catch (error) {
      // Database might not exist yet
      return [];
    }
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}

// CLI interface
async function main() {
  const cleaner = new DatabaseCleaner();
  const migrationRunner = new MigrationRunner();

  try {
    console.log('🚀 Starting complete database reset...');
    
    // Step 1: Clean the database
    await cleaner.cleanDatabase();
    
    // Step 2: Run migrations to recreate schema
    console.log('📋 Running migrations to recreate schema...');
    await migrationRunner.runMigrations();
    
    console.log('✅ Database reset completed successfully!');
    console.log('💡 Next step: Run "npm run seed" to populate with fresh data');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await cleaner.close();
    await migrationRunner.disconnect();
  }
}

if (require.main === module) {
  main();
}

export { main as cleanAndMigrate };