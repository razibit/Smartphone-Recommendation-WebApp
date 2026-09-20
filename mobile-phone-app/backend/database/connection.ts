import mysql, { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseConfig } from '../config';
import { DatabaseConnectionError } from '../middleware/errorHandler';
import { log } from '../logger';

export type QueryValue = string | number | boolean | null | Date;

export interface QueryResult<T = unknown> {
  results: T;
  executionTime: number;
  query: string;
  params: QueryValue[];
}

export class DatabaseConnection {
  private readonly pool: mysql.Pool;
  private connected = false;

  constructor(private readonly config: DatabaseConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.name,
      waitForConnections: true,
      connectionLimit: config.connectionLimit,
      queueLimit: 0,
      charset: 'utf8mb4',
      decimalNumbers: true,
      ssl: config.ssl ? { rejectUnauthorized: true } : undefined,
      enableKeepAlive: true,
    });
  }

  async connect(): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      connection.release();
      this.connected = true;
    } catch {
      this.connected = false;
      throw new DatabaseConnectionError('Unable to connect to the configured MySQL database');
    }
  }

  async query<T = unknown>(sql: string, params: QueryValue[] = []): Promise<QueryResult<T>> {
    const startedAt = performance.now();

    try {
      const [results] = await this.pool.execute(sql, params);
      this.connected = true;
      return {
        results: results as T,
        executionTime: Math.round(performance.now() - startedAt),
        query: sql,
        params,
      };
    } catch (error) {
      this.connected = false;
      const databaseError = error as { code?: unknown; errno?: unknown; sqlState?: unknown };
      log('error', 'Database query failed', {
        errorCode: typeof databaseError.code === 'string' ? databaseError.code : undefined,
        errno: typeof databaseError.errno === 'number' ? databaseError.errno : undefined,
        sqlState: typeof databaseError.sqlState === 'string' ? databaseError.sqlState : undefined,
        durationMs: Math.round(performance.now() - startedAt),
      });
      throw error;
    }
  }

  async queryRows<T extends RowDataPacket = RowDataPacket>(sql: string, params: QueryValue[] = []): Promise<QueryResult<T[]>> {
    return this.query<T[]>(sql, params);
  }

  async queryResult(sql: string, params: QueryValue[] = []): Promise<QueryResult<ResultSetHeader>> {
    return this.query<ResultSetHeader>(sql, params);
  }

  async getConnection(): Promise<PoolConnection> {
    try {
      return await this.pool.getConnection();
    } catch {
      throw new DatabaseConnectionError('Unable to obtain a database connection');
    }
  }

  async transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const value = await callback(connection);
      await connection.commit();
      return value;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  getPoolStats(): { connectionLimit: number; connected: boolean } {
    return {
      connectionLimit: this.config.connectionLimit,
      connected: this.connected,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
    this.connected = false;
  }
}
