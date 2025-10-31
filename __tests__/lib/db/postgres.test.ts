/**
 * PostgreSQL Connection Pool Tests
 * Comprehensive tests for database client initialization, query execution, and error handling
 * Target: 80%+ coverage
 */

import { Pool, QueryResult } from 'pg'
import {
  getPostgresPool,
  executeQuery,
  executeQuerySingle,
  closePool,
} from '@/lib/db/postgres'

// Mock the pg module
jest.mock('pg', () => {
  const mockQuery = jest.fn()
  const mockOn = jest.fn()
  const mockEnd = jest.fn()

  const MockPool = jest.fn().mockImplementation(() => ({
    query: mockQuery,
    on: mockOn,
    end: mockEnd,
  }))

  return {
    Pool: MockPool,
  }
})

describe('PostgreSQL Connection Pool', () => {
  let mockPool: any
  let consoleErrorSpy: jest.SpyInstance
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Reset modules to clear singleton
    jest.resetModules()

    // Save original environment
    originalEnv = process.env

    // Setup fresh mocks
    const { Pool } = require('pg')
    mockPool = new Pool()

    // Mock console.error to prevent test output pollution
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    // Clear all mock implementations
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore environment
    process.env = originalEnv

    // Restore console
    consoleErrorSpy.mockRestore()
  })

  describe('getPostgresPool', () => {
    it('should create a new pool with DATABASE_URL', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'

      const { Pool } = require('pg')
      const { getPostgresPool } = require('@/lib/db/postgres')

      const pool = getPostgresPool()

      expect(Pool).toHaveBeenCalledWith({
        connectionString: 'postgresql://user:pass@localhost:5432/testdb',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
      expect(pool).toBeDefined()
    })

    it('should return existing pool on subsequent calls (singleton pattern)', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'

      const { Pool } = require('pg')
      const { getPostgresPool } = require('@/lib/db/postgres')

      const pool1 = getPostgresPool()
      const pool2 = getPostgresPool()

      expect(Pool).toHaveBeenCalledTimes(1)
      expect(pool1).toBe(pool2)
    })

    it('should throw error when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL

      const { getPostgresPool } = require('@/lib/db/postgres')

      expect(() => getPostgresPool()).toThrow(
        'Missing DATABASE_URL environment variable. Please set it in .env.local'
      )
    })

    it('should setup error handler on pool creation', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'

      const { getPostgresPool } = require('@/lib/db/postgres')

      getPostgresPool()

      expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('should log errors from idle client', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'

      const { getPostgresPool } = require('@/lib/db/postgres')

      getPostgresPool()

      const errorHandler = mockPool.on.mock.calls.find((call: any) => call[0] === 'error')[1]
      const testError = new Error('Idle client error')

      errorHandler(testError)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error on idle client', testError)
    })
  })

  describe('executeQuery', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
    })

    it('should execute query successfully and return rows', async () => {
      const mockRows = [
        { id: 1, name: 'Test User 1' },
        { id: 2, name: 'Test User 2' },
      ]

      mockPool.query.mockResolvedValueOnce({
        rows: mockRows,
        rowCount: 2,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuery } = require('@/lib/db/postgres')

      const result = await executeQuery('SELECT * FROM users')

      expect(result.data).toEqual(mockRows)
      expect(result.error).toBeNull()
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

      const { executeQuery } = require('@/lib/db/postgres')

      const result = await executeQuery('SELECT * FROM users WHERE id = $1', [1])

      expect(result.data).toEqual(mockRows)
      expect(result.error).toBeNull()
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1])
    })

    it('should return empty array when no rows match', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuery } = require('@/lib/db/postgres')

      const result = await executeQuery('SELECT * FROM users WHERE id = $1', [999])

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it('should handle query errors with Error instance', async () => {
      const dbError = new Error('Connection timeout')
      mockPool.query.mockRejectedValueOnce(dbError)

      const { executeQuery } = require('@/lib/db/postgres')

      const result = await executeQuery('SELECT * FROM users')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Connection timeout')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Database query error:', dbError)
    })

    it('should handle query errors with non-Error objects', async () => {
      mockPool.query.mockRejectedValueOnce('String error')

      const { executeQuery } = require('@/lib/db/postgres')

      const result = await executeQuery('SELECT * FROM users')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database query failed')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Database query error:', 'String error')
    })

    it('should handle syntax errors in SQL queries', async () => {
      const syntaxError = new Error('syntax error at or near "SELCT"')
      mockPool.query.mockRejectedValueOnce(syntaxError)

      const { executeQuery } = require('@/lib/db/postgres')

      const result = await executeQuery('SELCT * FROM users')

      expect(result.data).toBeNull()
      expect(result.error).toBe('syntax error at or near "SELCT"')
    })

    it('should handle complex queries with multiple parameters', async () => {
      const mockRows = [{ id: 1, name: 'Test', age: 25 }]

      mockPool.query.mockResolvedValueOnce({
        rows: mockRows,
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuery } = require('@/lib/db/postgres')

      const query = 'SELECT * FROM users WHERE age > $1 AND city = $2 AND active = $3'
      const params = [18, 'New York', true]

      const result = await executeQuery(query, params)

      expect(result.data).toEqual(mockRows)
      expect(result.error).toBeNull()
      expect(mockPool.query).toHaveBeenCalledWith(query, params)
    })

    it('should handle INSERT queries', async () => {
      const insertedRow = { id: 10, name: 'New User', email: 'new@example.com' }

      mockPool.query.mockResolvedValueOnce({
        rows: [insertedRow],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuery } = require('@/lib/db/postgres')

      const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *'
      const params = ['New User', 'new@example.com']

      const result = await executeQuery(query, params)

      expect(result.data).toEqual([insertedRow])
      expect(result.error).toBeNull()
    })

    it('should handle UPDATE queries', async () => {
      const updatedRow = { id: 1, name: 'Updated Name', email: 'test@example.com' }

      mockPool.query.mockResolvedValueOnce({
        rows: [updatedRow],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuery } = require('@/lib/db/postgres')

      const query = 'UPDATE users SET name = $1 WHERE id = $2 RETURNING *'
      const params = ['Updated Name', 1]

      const result = await executeQuery(query, params)

      expect(result.data).toEqual([updatedRow])
      expect(result.error).toBeNull()
    })

    it('should handle DELETE queries', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 1,
        command: 'DELETE',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuery } = require('@/lib/db/postgres')

      const query = 'DELETE FROM users WHERE id = $1'
      const params = [1]

      const result = await executeQuery(query, params)

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
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

      const { executeQuery } = require('@/lib/db/postgres')

      const result = await executeQuery<User>('SELECT * FROM users')

      expect(result.data).toEqual(mockUsers)
      expect(result.error).toBeNull()
    })
  })

  describe('executeQuerySingle', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
    })

    it('should return first row when multiple rows exist', async () => {
      const mockRows = [
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' },
      ]

      mockPool.query.mockResolvedValueOnce({
        rows: mockRows,
        rowCount: 2,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuerySingle } = require('@/lib/db/postgres')

      const result = await executeQuerySingle('SELECT * FROM users')

      expect(result.data).toEqual({ id: 1, name: 'First' })
      expect(result.error).toBeNull()
    })

    it('should return single row when only one row exists', async () => {
      const mockRow = { id: 1, name: 'Only User' }

      mockPool.query.mockResolvedValueOnce({
        rows: [mockRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuerySingle } = require('@/lib/db/postgres')

      const result = await executeQuerySingle('SELECT * FROM users WHERE id = $1', [1])

      expect(result.data).toEqual(mockRow)
      expect(result.error).toBeNull()
    })

    it('should return null when no rows exist', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuerySingle } = require('@/lib/db/postgres')

      const result = await executeQuerySingle('SELECT * FROM users WHERE id = $1', [999])

      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it('should propagate errors from executeQuery', async () => {
      const dbError = new Error('Database connection failed')
      mockPool.query.mockRejectedValueOnce(dbError)

      const { executeQuerySingle } = require('@/lib/db/postgres')

      const result = await executeQuerySingle('SELECT * FROM users')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database connection failed')
    })

    it('should handle parameterized queries', async () => {
      const mockRow = { id: 5, name: 'Test User', active: true }

      mockPool.query.mockResolvedValueOnce({
        rows: [mockRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuerySingle } = require('@/lib/db/postgres')

      const result = await executeQuerySingle(
        'SELECT * FROM users WHERE id = $1 AND active = $2',
        [5, true]
      )

      expect(result.data).toEqual(mockRow)
      expect(result.error).toBeNull()
    })

    it('should properly type generic parameter', async () => {
      interface UserProfile {
        id: number
        username: string
        bio: string
      }

      const mockProfile: UserProfile = {
        id: 1,
        username: 'testuser',
        bio: 'Test bio',
      }

      mockPool.query.mockResolvedValueOnce({
        rows: [mockProfile],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const { executeQuerySingle } = require('@/lib/db/postgres')

      const result = await executeQuerySingle<UserProfile>(
        'SELECT * FROM user_profiles WHERE id = $1',
        [1]
      )

      expect(result.data).toEqual(mockProfile)
      expect(result.error).toBeNull()
    })

    it('should handle null data array from executeQuery', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Query failed'))

      const { executeQuerySingle } = require('@/lib/db/postgres')

      const result = await executeQuerySingle('SELECT * FROM users')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Query failed')
    })
  })

  describe('closePool', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
    })

    it('should close pool and reset to null', async () => {
      const { getPostgresPool, closePool } = require('@/lib/db/postgres')

      // Create pool
      const pool = getPostgresPool()
      expect(pool).toBeDefined()

      // Close pool
      mockPool.end.mockResolvedValueOnce(undefined)
      await closePool()

      expect(mockPool.end).toHaveBeenCalled()

      // Next call should create new pool
      const { Pool } = require('pg')
      const newPool = getPostgresPool()
      expect(Pool).toHaveBeenCalledTimes(2)
    })

    it('should handle multiple close calls gracefully', async () => {
      const { getPostgresPool, closePool } = require('@/lib/db/postgres')

      // Create pool
      getPostgresPool()

      // Close pool twice
      mockPool.end.mockResolvedValueOnce(undefined)
      await closePool()
      await closePool() // Should not throw or call end again

      expect(mockPool.end).toHaveBeenCalledTimes(1)
    })

    it('should do nothing when pool is not initialized', async () => {
      const { closePool } = require('@/lib/db/postgres')

      // Close without creating pool
      await closePool()

      expect(mockPool.end).not.toHaveBeenCalled()
    })

    it('should propagate errors from pool.end()', async () => {
      const { getPostgresPool, closePool } = require('@/lib/db/postgres')

      getPostgresPool()

      const endError = new Error('Failed to close connection')
      mockPool.end.mockRejectedValueOnce(endError)

      await expect(closePool()).rejects.toThrow('Failed to close connection')
    })
  })

  describe('Integration scenarios', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb'
    })

    it('should allow multiple queries on same pool', async () => {
      const { executeQuery } = require('@/lib/db/postgres')

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'User 1' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 2, name: 'User 2' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as QueryResult)

      const result1 = await executeQuery('SELECT * FROM users WHERE id = $1', [1])
      const result2 = await executeQuery('SELECT * FROM users WHERE id = $1', [2])

      expect(result1.data).toEqual([{ id: 1, name: 'User 1' }])
      expect(result2.data).toEqual([{ id: 2, name: 'User 2' }])
      expect(mockPool.query).toHaveBeenCalledTimes(2)
    })

    it('should handle concurrent queries', async () => {
      const { executeQuery } = require('@/lib/db/postgres')

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

      const [result1, result2] = await Promise.all([
        executeQuery('SELECT COUNT(*) as count FROM users'),
        executeQuery('SELECT COUNT(*) as count FROM posts'),
      ])

      expect(result1.data).toEqual([{ count: 10 }])
      expect(result2.data).toEqual([{ count: 20 }])
    })

    it('should reuse pool after closing and recreating', async () => {
      const { getPostgresPool, closePool } = require('@/lib/db/postgres')
      const { Pool } = require('pg')

      // Create first pool
      const pool1 = getPostgresPool()
      expect(Pool).toHaveBeenCalledTimes(1)

      // Close pool
      mockPool.end.mockResolvedValueOnce(undefined)
      await closePool()

      // Create second pool
      const pool2 = getPostgresPool()
      expect(Pool).toHaveBeenCalledTimes(2)
    })
  })
})
