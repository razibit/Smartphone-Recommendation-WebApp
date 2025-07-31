import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { DatabaseConnectionError } from '../middleware/errorHandler';

dotenv.config();

export interface QueryResult {
  results: any;
  executionTime: number;
  query: string;
  params?: any[];
}

export class DatabaseConnection {
  private pool: mysql.Pool;
  private isConnected: boolean = false;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'bbbb',
      database: process.env.DB_NAME || 'mobile_specs',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });

    // Test the connection on initialization
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Database connected successfully');
      console.log(`📊 Database: ${process.env.DB_NAME || 'mobile_specs'}`);
      console.log(`🏠 Host: ${process.env.DB_HOST || 'localhost'}`);
      this.isConnected = true;
      connection.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.isConnected = false;
      throw new DatabaseConnectionError('Failed to connect to database');
    }
  }

  // Execute a query with parameters and return detailed results
  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.isConnected) {
      await this.testConnection();
    }

    try {
      const startTime = Date.now();
      const [results] = await this.pool.execute(sql, params);
      const executionTime = Date.now() - startTime;
      
      // Log query for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Query executed in ${executionTime}ms: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
        if (params.length > 0) {
          console.log(`📝 Parameters:`, params);
        }
      }
      
      return {
        results,
        executionTime,
        query: sql,
        params: params.length > 0 ? params : undefined
      };
    } catch (error) {
      console.error('❌ Database query error:', {
        sql: sql.substring(0, 200),
        params,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  // Execute a query and return only the results (for simpler usage)
  async queryResults(sql: string, params: any[] = []): Promise<any> {
    const result = await this.query(sql, params);
    return result.results;
  }

  // Get a connection from the pool for transactions
  async getConnection(): Promise<mysql.PoolConnection> {
    try {
      return await this.pool.getConnection();
    } catch (error) {
      console.error('❌ Failed to get database connection:', error);
      throw new DatabaseConnectionError('Failed to get database connection');
    }
  }

  // Execute a transaction
  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Check if database is connected
  async isHealthy(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get connection pool stats
  getPoolStats() {
    return {
      totalConnections: this.pool.pool.config.connectionLimit,
      activeConnections: this.pool.pool._allConnections.length,
      freeConnections: this.pool.pool._freeConnections.length,
      queuedRequests: this.pool.pool._connectionQueue.length
    };
  }

  // Close the connection pool
  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      console.log('🔌 Database connection pool closed');
    } catch (error) {
      console.error('❌ Error closing database connection pool:', error);
      throw error;
    }
  }
}