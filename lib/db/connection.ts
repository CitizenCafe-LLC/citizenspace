/**
 * Database Connection Pooling Utility
 *
 * Provides PostgreSQL connection pooling using pg Pool for optimal performance.
 * Manages database connections efficiently and provides transaction support.
 *
 * @module lib/db/connection
 */

import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { Pool } from 'pg'

// Connection pool configuration
const poolConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'citizenspace',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,

  // Connection pool settings
  min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
  max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),

  // Connection timeout settings
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,

  // Statement timeout (30 seconds)
  statement_timeout: 30000,

  // SSL configuration (required for production)
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
}

// Create connection pool instance
let pool: Pool | null = null

/**
 * Get or create the database connection pool
 * Implements singleton pattern to reuse pool across requests
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(poolConfig)

    // Handle pool errors
    pool.on('error', err => {
      console.error('Unexpected error on idle database client', err)
    })

    // Log pool events in development
    if (process.env.NODE_ENV === 'development') {
      pool.on('connect', () => {
        console.log('[DB] New client connected to pool')
      })

      pool.on('remove', () => {
        console.log('[DB] Client removed from pool')
      })
    }
  }

  return pool
}

/**
 * Execute a SQL query with parameters
 *
 * @param text - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool()
  const start = Date.now()

  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start

    // Log slow queries in development (> 100ms)
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log('[DB] Slow query detected:', {
        query: text.substring(0, 100),
        duration: `${duration}ms`,
        rows: result.rowCount,
      })
    }

    return result
  } catch (error) {
    console.error('[DB] Query error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: text.substring(0, 200),
    })
    throw error
  }
}

/**
 * Get a client from the pool for transactions
 * Remember to release the client after use
 *
 * @returns Database client
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

/**
 * Execute multiple queries in a transaction
 * Automatically handles commit/rollback
 *
 * @param callback - Function containing transaction queries
 * @returns Transaction result
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[DB] Transaction rolled back:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Close the connection pool
 * Should be called when application shuts down
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('[DB] Connection pool closed')
  }
}

/**
 * Check database connection health
 *
 * @returns True if connection is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health')
    return result.rows[0]?.health === 1
  } catch (error) {
    console.error('[DB] Health check failed:', error)
    return false
  }
}

/**
 * Get pool statistics
 * Useful for monitoring and debugging
 */
export function getPoolStats() {
  const pool = getPool()
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  }
}

// Export types for use in other modules
export type { Pool, PoolClient, QueryResult, QueryResultRow }
