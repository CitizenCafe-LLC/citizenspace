/**
 * Database Connection Pool Tests
 * Comprehensive tests for connection pooling, query execution, transactions, and health checks
 * Target: 80%+ coverage
 */

import { Pool, PoolClient, QueryResult } from 'pg'
import {
  getPool,
  query,
  getClient,
  transaction,
  closePool,
  healthCheck,
  getPoolStats,
} from '@/lib/db/connection'

// Mock the pg module
jest.mock('pg', () => {
  const mockQuery = jest.fn()
  const mockConnect = jest.fn()
  const mockOn = jest.fn()
  const mockEnd = jest.fn()

  const MockPool = jest.fn().mockImplementation(() => ({
    query: mockQuery,
    connect: mockConnect,
    on: mockOn,
    end: mockEnd,
    totalCount: 5,
    idleCount: 3,
    waitingCount: 0,
  }))

  return {
    Pool: MockPool,
  }
})

describe('Database Connection Pool', () => {
  let mockPool: any
  let mockClient: any
  let consoleErrorSpy: jest.SpyInstance
  let consoleLogSpy: jest.SpyInstance
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Reset modules to clear singleton
    jest.resetModules()

    // Save original environment
    originalEnv = process.env

    // Setup default environment
    process.env.POSTGRES_HOST = 'localhost'
    process.env.POSTGRES_PORT = '5432'
    process.env.POSTGRES_DB = 'citizenspace'
    process.env.POSTGRES_USER = 'postgres'
    process.env.POSTGRES_PASSWORD = 'password'
    process.env.DATABASE_POOL_MIN = '2'
    process.env.DATABASE_POOL_MAX = '10'
    process.env.NODE_ENV = 'test'

    // Setup fresh mocks
    const { Pool } = require('pg')
    mockPool = new Pool()

    // Mock client
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    }

    mockPool.connect.mockResolvedValue(mockClient)

    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

    // Clear all mock implementations
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore environment
    process.env = originalEnv

    // Restore console
    consoleErrorSpy.mockRestore()
    consoleLogSpy.mockRestore()
  })

  describe('getPool', () => {
    it('should create pool with correct configuration', () => {
      const { Pool } = require('pg')
      const { getPool } = require('@/lib/db/connection')

      const pool = getPool()

      expect(Pool).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        database: 'citizenspace',
        user: 'postgres',
        password: 'password',
        min: 2,
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        statement_timeout: 30000,
        ssl: false,
      })
      expect(pool).toBeDefined()
    })

    it('should use environment defaults when env vars are missing', () => {
      delete process.env.POSTGRES_HOST
      delete process.env.POSTGRES_PORT
      delete process.env.POSTGRES_DB
      delete process.env.POSTGRES_USER
      delete process.env.DATABASE_POOL_MIN
      delete process.env.DATABASE_POOL_MAX

      const { Pool } = require('pg')
      const { getPool } = require('@/lib/db/connection')

      getPool()

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          port: 5432,
          database: 'citizenspace',
          user: 'postgres',
          min: 2,
          max: 10,
        })
      )
    })

    it('should enable SSL in production environment', () => {
      process.env.NODE_ENV = 'production'

      const { Pool } = require('pg')
      const { getPool } = require('@/lib/db/connection')

      getPool()

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          ssl: {
            rejectUnauthorized: false,
          },
        })
      )
    })

    it('should disable SSL in development environment', () => {
      process.env.NODE_ENV = 'development'

      const { Pool } = require('pg')
      const { getPool } = require('@/lib/db/connection')

      getPool()

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          ssl: false,
        })
      )
    })

    it('should return same pool instance (singleton pattern)', () => {
      const { Pool } = require('pg')
      const { getPool } = require('@/lib/db/connection')

      const pool1 = getPool()
      const pool2 = getPool()

      expect(Pool).toHaveBeenCalledTimes(1)
      expect(pool1).toBe(pool2)
    })

    it('should setup error event handler', () => {
      const { getPool } = require('@/lib/db/connection')

      getPool()

      expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('should log error from idle client', () => {
      const { getPool } = require('@/lib/db/connection')

      getPool()

      const errorHandler = mockPool.on.mock.calls.find((call: any) => call[0] === 'error')[1]
      const testError = new Error('Idle client error')

      errorHandler(testError)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unexpected error on idle database client',
        testError
      )
    })

    it('should setup event handlers in development mode', () => {
      process.env.NODE_ENV = 'development'

      const { getPool } = require('@/lib/db/connection')

      getPool()

      expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockPool.on).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(mockPool.on).toHaveBeenCalledWith('remove', expect.any(Function))
    })

    it('should log connect event in development mode', () => {
      process.env.NODE_ENV = 'development'

      const { getPool } = require('@/lib/db/connection')

      getPool()

      const connectHandler = mockPool.on.mock.calls.find((call: any) => call[0] === 'connect')[1]
      connectHandler()

      expect(consoleLogSpy).toHaveBeenCalledWith('[DB] New client connected to pool')
    })

    it('should log remove event in development mode', () => {
      process.env.NODE_ENV = 'development'

      const { getPool } = require('@/lib/db/connection')

      getPool()

      const removeHandler = mockPool.on.mock.calls.find((call: any) => call[0] === 'remove')[1]
      removeHandler()

      expect(consoleLogSpy).toHaveBeenCalledWith('[DB] Client removed from pool')
    })

    it('should parse custom port from environment', () => {
      process.env.POSTGRES_PORT = '5433'

      const { Pool } = require('pg')
      const { getPool } = require('@/lib/db/connection')

      getPool()

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 5433,
        })
      )
    })

    it('should parse custom pool sizes from environment', () => {
      process.env.DATABASE_POOL_MIN = '5'
      process.env.DATABASE_POOL_MAX = '20'

      const { Pool } = require('pg')
      const { getPool } = require('@/lib/db/connection')

      getPool()

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          min: 5,
          max: 20,
        })
      )
    })
  })

  describe('query', () => {
    it('should execute query successfully and return result', async () => {
      const mockRows = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ]

      mockPool.query.mockResolvedValueOnce({
        rows: mockRows,
        rowCount: 2,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { query } = require('@/lib/db/connection')

      const result = await query('SELECT * FROM users')

      expect(result.rows).toEqual(mockRows)
      expect(result.rowCount).toBe(2)
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users', undefined)
    })

    it('should execute parameterized query successfully', async () => {
      const mockRows = [{ id: 1, name: 'Test User' }]

      mockPool.query.mockResolvedValueOnce({
        rows: mockRows,
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { query } = require('@/lib/db/connection')

      const result = await query('SELECT * FROM users WHERE id = $1', [1])

      expect(result.rows).toEqual(mockRows)
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1])
    })

    it('should track query execution time', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { query } = require('@/lib/db/connection')

      const startTime = Date.now()
      await query('SELECT * FROM users')
      const endTime = Date.now()

      // Query should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should log slow queries in development mode', async () => {
      process.env.NODE_ENV = 'development'

      // Mock slow query (> 100ms)
      mockPool.query.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  rows: [],
                  rowCount: 0,
                  command: 'SELECT',
                  oid: 0,
                  fields: [],
                } as QueryResult),
              150
            )
          )
      )

      const { query } = require('@/lib/db/connection')

      await query('SELECT * FROM users WHERE complex_condition = true')

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[DB] Slow query detected:',
        expect.objectContaining({
          query: expect.stringContaining('SELECT * FROM users'),
          duration: expect.stringContaining('ms'),
          rows: 0,
        })
      )
    })

    it('should not log fast queries in development mode', async () => {
      process.env.NODE_ENV = 'development'

      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { query } = require('@/lib/db/connection')

      await query('SELECT * FROM users')

      // Should not log slow query warning for fast queries
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Slow query detected'),
        expect.anything()
      )
    })

    it('should handle query errors and rethrow', async () => {
      const dbError = new Error('Connection timeout')
      mockPool.query.mockRejectedValueOnce(dbError)

      const { query } = require('@/lib/db/connection')

      await expect(query('SELECT * FROM users')).rejects.toThrow('Connection timeout')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DB] Query error:',
        expect.objectContaining({
          error: 'Connection timeout',
          query: 'SELECT * FROM users',
        })
      )
    })

    it('should truncate long queries in error logs', async () => {
      const longQuery = 'SELECT * FROM users WHERE ' + 'id = $1 AND '.repeat(50) + 'active = true'
      const dbError = new Error('Query failed')
      mockPool.query.mockRejectedValueOnce(dbError)

      const { query } = require('@/lib/db/connection')

      await expect(query(longQuery, [1])).rejects.toThrow('Query failed')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DB] Query error:',
        expect.objectContaining({
          query: longQuery.substring(0, 200),
        })
      )
    })

    it('should handle non-Error exceptions', async () => {
      mockPool.query.mockRejectedValueOnce('String error')

      const { query } = require('@/lib/db/connection')

      await expect(query('SELECT * FROM users')).rejects.toBe('String error')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DB] Query error:',
        expect.objectContaining({
          error: 'Unknown error',
        })
      )
    })

    it('should properly type generic parameter', async () => {
      interface User {
        id: number
        name: string
        email: string
      }

      const mockUsers: User[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ]

      mockPool.query.mockResolvedValueOnce({
        rows: mockUsers,
        rowCount: 2,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { query } = require('@/lib/db/connection')

      const result = await query<User>('SELECT * FROM users')

      expect(result.rows).toEqual(mockUsers)
    })

    it('should truncate long queries in slow query logs', async () => {
      process.env.NODE_ENV = 'development'

      const longQuery = 'SELECT * FROM users WHERE ' + 'condition AND '.repeat(20) + 'active = true'

      // Mock slow query
      mockPool.query.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  rows: [],
                  rowCount: 0,
                  command: 'SELECT',
                  oid: 0,
                  fields: [],
                } as QueryResult),
              150
            )
          )
      )

      const { query } = require('@/lib/db/connection')

      await query(longQuery)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[DB] Slow query detected:',
        expect.objectContaining({
          query: longQuery.substring(0, 100),
        })
      )
    })
  })

  describe('getClient', () => {
    it('should get client from pool', async () => {
      const { getClient } = require('@/lib/db/connection')

      const client = await getClient()

      expect(client).toBe(mockClient)
      expect(mockPool.connect).toHaveBeenCalled()
    })

    it('should propagate connection errors', async () => {
      const connectionError = new Error('Connection pool exhausted')
      mockPool.connect.mockRejectedValueOnce(connectionError)

      const { getClient } = require('@/lib/db/connection')

      await expect(getClient()).rejects.toThrow('Connection pool exhausted')
    })

    it('should return different clients on multiple calls', async () => {
      const mockClient2 = {
        query: jest.fn(),
        release: jest.fn(),
      }

      mockPool.connect
        .mockResolvedValueOnce(mockClient)
        .mockResolvedValueOnce(mockClient2)

      const { getClient } = require('@/lib/db/connection')

      const client1 = await getClient()
      const client2 = await getClient()

      expect(client1).toBe(mockClient)
      expect(client2).toBe(mockClient2)
      expect(mockPool.connect).toHaveBeenCalledTimes(2)
    })
  })

  describe('transaction', () => {
    it('should execute transaction successfully with commit', async () => {
      const mockResult = { success: true }

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'BEGIN' }) // BEGIN
        .mockResolvedValueOnce({ rows: [], command: 'COMMIT' }) // COMMIT

      const { transaction } = require('@/lib/db/connection')

      const callback = jest.fn().mockResolvedValue(mockResult)
      const result = await transaction(callback)

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN')
      expect(callback).toHaveBeenCalledWith(mockClient)
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT')
      expect(mockClient.release).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })

    it('should rollback transaction on error', async () => {
      const transactionError = new Error('Constraint violation')

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'BEGIN' }) // BEGIN
        .mockResolvedValueOnce({ rows: [], command: 'ROLLBACK' }) // ROLLBACK

      const { transaction } = require('@/lib/db/connection')

      const callback = jest.fn().mockRejectedValue(transactionError)

      await expect(transaction(callback)).rejects.toThrow('Constraint violation')

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN')
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK')
      expect(mockClient.release).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DB] Transaction rolled back:',
        transactionError
      )
    })

    it('should release client even if rollback fails', async () => {
      const transactionError = new Error('Transaction error')
      const rollbackError = new Error('Rollback failed')

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'BEGIN' }) // BEGIN
        .mockRejectedValueOnce(rollbackError) // ROLLBACK fails

      const { transaction } = require('@/lib/db/connection')

      const callback = jest.fn().mockRejectedValue(transactionError)

      await expect(transaction(callback)).rejects.toThrow('Rollback failed')

      expect(mockClient.release).toHaveBeenCalled()
    })

    it('should handle complex transaction with multiple queries', async () => {
      const insertResult = { id: 1, name: 'New User' }
      const updateResult = { id: 1, credits: 100 }

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'BEGIN' }) // BEGIN
        .mockResolvedValueOnce({ rows: [insertResult], command: 'INSERT' }) // INSERT
        .mockResolvedValueOnce({ rows: [updateResult], command: 'UPDATE' }) // UPDATE
        .mockResolvedValueOnce({ rows: [], command: 'COMMIT' }) // COMMIT

      const { transaction } = require('@/lib/db/connection')

      const callback = async (client: PoolClient) => {
        await client.query('INSERT INTO users (name) VALUES ($1) RETURNING *', ['New User'])
        await client.query('UPDATE user_credits SET amount = $1 WHERE user_id = $2', [100, 1])
        return { success: true }
      }

      const result = await transaction(callback)

      expect(result).toEqual({ success: true })
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN')
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT')
    })

    it('should return result from transaction callback', async () => {
      const expectedResult = { userId: 123, bookingId: 456 }

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'BEGIN' })
        .mockResolvedValueOnce({ rows: [], command: 'COMMIT' })

      const { transaction } = require('@/lib/db/connection')

      const result = await transaction(async () => expectedResult)

      expect(result).toEqual(expectedResult)
    })

    it('should properly type transaction callback return value', async () => {
      interface TransactionResult {
        id: number
        created: boolean
      }

      const expectedResult: TransactionResult = { id: 1, created: true }

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'BEGIN' })
        .mockResolvedValueOnce({ rows: [], command: 'COMMIT' })

      const { transaction } = require('@/lib/db/connection')

      const result = await transaction<TransactionResult>(async () => expectedResult)

      expect(result).toEqual(expectedResult)
    })

    it('should handle BEGIN failure', async () => {
      const beginError = new Error('BEGIN failed')
      mockClient.query.mockRejectedValueOnce(beginError)

      const { transaction } = require('@/lib/db/connection')

      const callback = jest.fn()

      await expect(transaction(callback)).rejects.toThrow('BEGIN failed')

      expect(callback).not.toHaveBeenCalled()
      expect(mockClient.release).toHaveBeenCalled()
    })

    it('should handle COMMIT failure', async () => {
      const commitError = new Error('COMMIT failed')

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'BEGIN' })
        .mockRejectedValueOnce(commitError) // COMMIT fails
        .mockResolvedValueOnce({ rows: [], command: 'ROLLBACK' })

      const { transaction } = require('@/lib/db/connection')

      const callback = jest.fn().mockResolvedValue({ success: true })

      await expect(transaction(callback)).rejects.toThrow('COMMIT failed')

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK')
      expect(mockClient.release).toHaveBeenCalled()
    })
  })

  describe('closePool', () => {
    it('should close pool and log message', async () => {
      const { getPool, closePool } = require('@/lib/db/connection')

      // Create pool
      getPool()

      // Close pool
      mockPool.end.mockResolvedValueOnce(undefined)
      await closePool()

      expect(mockPool.end).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith('[DB] Connection pool closed')
    })

    it('should reset pool to null after closing', async () => {
      const { getPool, closePool } = require('@/lib/db/connection')

      // Create pool
      getPool()

      // Close pool
      mockPool.end.mockResolvedValueOnce(undefined)
      await closePool()

      // Next call should create new pool
      const { Pool } = require('pg')
      getPool()
      expect(Pool).toHaveBeenCalledTimes(2)
    })

    it('should do nothing when pool is not initialized', async () => {
      const { closePool } = require('@/lib/db/connection')

      await closePool()

      expect(mockPool.end).not.toHaveBeenCalled()
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should propagate errors from pool.end()', async () => {
      const { getPool, closePool } = require('@/lib/db/connection')

      getPool()

      const endError = new Error('Failed to close pool')
      mockPool.end.mockRejectedValueOnce(endError)

      await expect(closePool()).rejects.toThrow('Failed to close pool')
    })
  })

  describe('healthCheck', () => {
    it('should return true when database is healthy', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ health: 1 }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { healthCheck } = require('@/lib/db/connection')

      const result = await healthCheck()

      expect(result).toBe(true)
      expect(mockPool.query).toHaveBeenCalledWith('SELECT 1 as health', undefined)
    })

    it('should return false when query fails', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Connection refused'))

      const { healthCheck } = require('@/lib/db/connection')

      const result = await healthCheck()

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DB] Health check failed:',
        expect.any(Error)
      )
    })

    it('should return false when result is unexpected', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { healthCheck } = require('@/lib/db/connection')

      const result = await healthCheck()

      expect(result).toBe(false)
    })

    it('should return false when health value is not 1', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ health: 0 }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { healthCheck } = require('@/lib/db/connection')

      const result = await healthCheck()

      expect(result).toBe(false)
    })

    it('should handle null or undefined rows', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{}],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { healthCheck } = require('@/lib/db/connection')

      const result = await healthCheck()

      expect(result).toBe(false)
    })
  })

  describe('getPoolStats', () => {
    it('should return pool statistics', () => {
      const { getPoolStats } = require('@/lib/db/connection')

      const stats = getPoolStats()

      expect(stats).toEqual({
        totalCount: 5,
        idleCount: 3,
        waitingCount: 0,
      })
    })

    it('should reflect current pool state', () => {
      const { Pool } = require('pg')
      const { getPool, getPoolStats } = require('@/lib/db/connection')

      // Create pool first
      const pool = getPool()

      // Modify pool stats directly on the returned pool instance
      pool.totalCount = 10
      pool.idleCount = 5
      pool.waitingCount = 2

      const stats = getPoolStats()

      expect(stats).toEqual({
        totalCount: 10,
        idleCount: 5,
        waitingCount: 2,
      })
    })

    it('should create pool if not exists when getting stats', () => {
      const { Pool } = require('pg')
      const { getPoolStats } = require('@/lib/db/connection')

      const stats = getPoolStats()

      expect(Pool).toHaveBeenCalled()
      expect(stats).toBeDefined()
    })
  })

  describe('Integration scenarios', () => {
    it('should allow multiple queries on same pool', async () => {
      const { query } = require('@/lib/db/connection')

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: 10 }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        } as QueryResult)
        .mockResolvedValueOnce({
          rows: [{ count: 20 }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        } as QueryResult)

      const result1 = await query('SELECT COUNT(*) FROM users')
      const result2 = await query('SELECT COUNT(*) FROM posts')

      expect(result1.rows).toEqual([{ count: 10 }])
      expect(result2.rows).toEqual([{ count: 20 }])
    })

    it('should handle concurrent queries', async () => {
      const { query } = require('@/lib/db/connection')

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: 1 }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        } as QueryResult)
        .mockResolvedValueOnce({
          rows: [{ id: 2 }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        } as QueryResult)

      const [result1, result2] = await Promise.all([
        query('SELECT * FROM users WHERE id = $1', [1]),
        query('SELECT * FROM users WHERE id = $1', [2]),
      ])

      expect(result1.rows).toEqual([{ id: 1 }])
      expect(result2.rows).toEqual([{ id: 2 }])
    })

    it('should support nested transactions workflow', async () => {
      const { transaction, getClient } = require('@/lib/db/connection')

      mockClient.query
        .mockResolvedValueOnce({ rows: [], command: 'BEGIN' })
        .mockResolvedValueOnce({ rows: [{ id: 1 }], command: 'INSERT' })
        .mockResolvedValueOnce({ rows: [], command: 'COMMIT' })

      const result = await transaction(async client => {
        const insertResult = await client.query('INSERT INTO users (name) VALUES ($1)', [
          'Test',
        ])
        return insertResult
      })

      expect(result.rows).toEqual([{ id: 1 }])
    })

    it('should handle health check during active operations', async () => {
      const { query, healthCheck } = require('@/lib/db/connection')

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ id: 1 }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        } as QueryResult)
        .mockResolvedValueOnce({
          rows: [{ health: 1 }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        } as QueryResult)

      const [queryResult, healthResult] = await Promise.all([
        query('SELECT * FROM users'),
        healthCheck(),
      ])

      expect(queryResult.rows).toEqual([{ id: 1 }])
      expect(healthResult).toBe(true)
    })

    it('should recover after closing and recreating pool', async () => {
      const { getPool, closePool, query } = require('@/lib/db/connection')

      // First pool
      getPool()

      mockPool.end.mockResolvedValueOnce(undefined)
      await closePool()

      // Second pool
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const result = await query('SELECT * FROM users')

      expect(result.rows).toEqual([{ id: 1 }])
    })
  })
})
