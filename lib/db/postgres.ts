import { Pool, QueryResult } from 'pg';

/**
 * PostgreSQL connection pool singleton
 * Replaces Supabase client for direct database access
 */
let pool: Pool | null = null;

/**
 * Get or create PostgreSQL connection pool
 */
export function getPostgresPool(): Pool {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'Missing DATABASE_URL environment variable. Please set it in .env.local'
    );
  }

  pool = new Pool({
    connectionString: databaseUrl,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
}

/**
 * Execute a SQL query with parameterized values
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<{ data: T[] | null; error: string | null }> {
  try {
    const pool = getPostgresPool();
    const result: QueryResult<T> = await pool.query(query, params);
    return { data: result.rows, error: null };
  } catch (err) {
    console.error('Database query error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Database query failed',
    };
  }
}

/**
 * Execute a SQL query and return a single row
 */
export async function executeQuerySingle<T = any>(
  query: string,
  params?: any[]
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await executeQuery<T>(query, params);
  if (error) {
    return { data: null, error };
  }
  return { data: data && data.length > 0 ? data[0] : null, error: null };
}

/**
 * Close the connection pool (for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}