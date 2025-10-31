/**
 * Audit Repository Tests
 * Comprehensive tests for audit logging database operations
 */

import {
  createAuditLog,
  getAuditLogs,
  getResourceAuditLogs,
  getAdminUserAuditLogs,
  createChangeObject,
  type CreateAuditLogParams,
  type AuditAction,
  type ResourceType,
} from '@/lib/db/repositories/audit.repository'
import { executeQuery, executeQuerySingle, closePool } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
  closePool: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Audit Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createAuditLog', () => {
    it('should create an audit log successfully', async () => {
      const mockParams: CreateAuditLogParams = {
        admin_user_id: 'admin-123',
        action: 'create',
        resource_type: 'booking',
        resource_id: 'booking-456',
        changes: { status: { before: null, after: 'confirmed' } },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      }

      const mockAuditLog = {
        id: 'audit-789',
        ...mockParams,
        created_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockAuditLog,
        error: null,
      })

      const result = await createAuditLog(mockParams)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockAuditLog)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_logs'),
        [
          mockParams.admin_user_id,
          mockParams.action,
          mockParams.resource_type,
          mockParams.resource_id,
          JSON.stringify(mockParams.changes),
          mockParams.ip_address,
          mockParams.user_agent,
        ]
      )
    })

    it('should create audit log without optional parameters', async () => {
      const mockParams: CreateAuditLogParams = {
        admin_user_id: 'admin-123',
        action: 'update',
        resource_type: 'user',
        resource_id: 'user-456',
      }

      const mockAuditLog = {
        id: 'audit-789',
        ...mockParams,
        changes: null,
        ip_address: null,
        user_agent: null,
        created_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockAuditLog,
        error: null,
      })

      const result = await createAuditLog(mockParams)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockAuditLog)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO audit_logs'),
        [
          mockParams.admin_user_id,
          mockParams.action,
          mockParams.resource_type,
          mockParams.resource_id,
          null,
          null,
          null,
        ]
      )
    })

    it('should handle all action types', async () => {
      const actions: AuditAction[] = ['create', 'update', 'delete', 'status_change', 'refund']

      for (const action of actions) {
        mockExecuteQuerySingle.mockResolvedValue({
          data: {
            id: 'audit-123',
            admin_user_id: 'admin-123',
            action,
            resource_type: 'booking' as ResourceType,
            resource_id: 'booking-456',
            changes: null,
            ip_address: null,
            user_agent: null,
            created_at: '2025-10-01T12:00:00Z',
          },
          error: null,
        })

        const result = await createAuditLog({
          admin_user_id: 'admin-123',
          action,
          resource_type: 'booking',
          resource_id: 'booking-456',
        })

        expect(result.error).toBeNull()
        expect(result.data?.action).toBe(action)
      }
    })

    it('should handle all resource types', async () => {
      const resourceTypes: ResourceType[] = [
        'booking',
        'user',
        'workspace',
        'menu_item',
        'order',
        'membership',
      ]

      for (const resourceType of resourceTypes) {
        mockExecuteQuerySingle.mockResolvedValue({
          data: {
            id: 'audit-123',
            admin_user_id: 'admin-123',
            action: 'create' as AuditAction,
            resource_type: resourceType,
            resource_id: 'resource-456',
            changes: null,
            ip_address: null,
            user_agent: null,
            created_at: '2025-10-01T12:00:00Z',
          },
          error: null,
        })

        const result = await createAuditLog({
          admin_user_id: 'admin-123',
          action: 'create',
          resource_type: resourceType,
          resource_id: 'resource-456',
        })

        expect(result.error).toBeNull()
        expect(result.data?.resource_type).toBe(resourceType)
      }
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database connection failed',
      })

      const result = await createAuditLog({
        admin_user_id: 'admin-123',
        action: 'create',
        resource_type: 'booking',
        resource_id: 'booking-456',
      })

      expect(result.error).toBe('Database connection failed')
      expect(result.data).toBeNull()
    })

    it('should handle exceptions', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Connection timeout'))

      const result = await createAuditLog({
        admin_user_id: 'admin-123',
        action: 'create',
        resource_type: 'booking',
        resource_id: 'booking-456',
      })

      expect(result.error).toBe('Connection timeout')
      expect(result.data).toBeNull()
    })
  })

  describe('getAuditLogs', () => {
    it('should fetch all audit logs with pagination', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          admin_user_id: 'admin-123',
          action: 'create' as AuditAction,
          resource_type: 'booking' as ResourceType,
          resource_id: 'booking-1',
          changes: null,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          created_at: '2025-10-01T12:00:00Z',
          admin_user: {
            id: 'admin-123',
            email: 'admin@example.com',
            full_name: 'Admin User',
          },
        },
        {
          id: 'audit-2',
          admin_user_id: 'admin-123',
          action: 'update' as AuditAction,
          resource_type: 'user' as ResourceType,
          resource_id: 'user-1',
          changes: { role: { before: 'user', after: 'admin' } },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          created_at: '2025-10-01T11:00:00Z',
          admin_user: {
            id: 'admin-123',
            email: 'admin@example.com',
            full_name: 'Admin User',
          },
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '2' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockLogs,
        error: null,
      })

      const result = await getAuditLogs()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockLogs)
      expect(result.count).toBe(2)
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY al.created_at DESC'),
        expect.arrayContaining([50, 0])
      )
    })

    it('should filter by admin_user_id', async () => {
      const adminUserId = 'admin-123'

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAuditLogs({ admin_user_id: adminUserId })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE admin_user_id = $1'),
        expect.arrayContaining([adminUserId])
      )
    })

    it('should filter by resource_type', async () => {
      const resourceType: ResourceType = 'booking'

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAuditLogs({ resource_type: resourceType })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE resource_type = $1'),
        expect.arrayContaining([resourceType])
      )
    })

    it('should filter by resource_id', async () => {
      const resourceId = 'booking-123'

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAuditLogs({ resource_id: resourceId })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE resource_id = $1'),
        expect.arrayContaining([resourceId])
      )
    })

    it('should filter by action', async () => {
      const action: AuditAction = 'delete'

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAuditLogs({ action })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE action = $1'),
        expect.arrayContaining([action])
      )
    })

    it('should filter by date range', async () => {
      const startDate = '2025-10-01T00:00:00Z'
      const endDate = '2025-10-31T23:59:59Z'

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAuditLogs({ start_date: startDate, end_date: endDate })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE created_at >= $1 AND created_at <= $2'),
        expect.arrayContaining([startDate, endDate])
      )
    })

    it('should apply multiple filters together', async () => {
      const filters = {
        admin_user_id: 'admin-123',
        resource_type: 'booking' as ResourceType,
        action: 'create' as AuditAction,
        start_date: '2025-10-01T00:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAuditLogs(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE admin_user_id = $1 AND resource_type = $2 AND action = $3 AND created_at >= $4'),
        expect.arrayContaining([
          filters.admin_user_id,
          filters.resource_type,
          filters.action,
          filters.start_date,
        ])
      )
    })

    it('should handle custom limit and offset', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '100' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAuditLogs({ limit: 10, offset: 20 })

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([10, 20])
      )
    })

    it('should handle count query errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Count query failed',
      })

      const result = await getAuditLogs()

      expect(result.error).toBeNull()
      expect(result.count).toBe(0)
    })

    it('should handle data query errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '10' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: null,
        error: 'Data query failed',
      })

      const result = await getAuditLogs()

      expect(result.error).toBe('Data query failed')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })

    it('should handle exceptions', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Connection lost'))

      const result = await getAuditLogs()

      expect(result.error).toBe('Connection lost')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })
  })

  describe('getResourceAuditLogs', () => {
    it('should fetch audit logs for a specific resource', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          admin_user_id: 'admin-123',
          action: 'create' as AuditAction,
          resource_type: 'booking' as ResourceType,
          resource_id: 'booking-456',
          changes: null,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          created_at: '2025-10-01T12:00:00Z',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockLogs,
        error: null,
      })

      const result = await getResourceAuditLogs('booking', 'booking-456')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockLogs)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE resource_type = $1 AND resource_id = $2'),
        expect.arrayContaining(['booking', 'booking-456'])
      )
    })

    it('should use custom limit', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '10' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getResourceAuditLogs('user', 'user-123', 25)

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([25, 0])
      )
    })
  })

  describe('getAdminUserAuditLogs', () => {
    it('should fetch audit logs for a specific admin user', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          admin_user_id: 'admin-123',
          action: 'create' as AuditAction,
          resource_type: 'booking' as ResourceType,
          resource_id: 'booking-456',
          changes: null,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          created_at: '2025-10-01T12:00:00Z',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockLogs,
        error: null,
      })

      const result = await getAdminUserAuditLogs('admin-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockLogs)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE admin_user_id = $1'),
        expect.arrayContaining(['admin-123'])
      )
    })

    it('should use custom limit and offset', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '50' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getAdminUserAuditLogs('admin-123', 20, 10)

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([20, 10])
      )
    })
  })

  describe('createChangeObject', () => {
    it('should detect changes between before and after objects', async () => {
      const before = {
        status: 'pending',
        amount: 100,
        email: 'old@example.com',
      }

      const after = {
        status: 'confirmed',
        amount: 100,
        email: 'new@example.com',
      }

      const changes = createChangeObject(before, after)

      expect(changes).toEqual({
        status: {
          before: 'pending',
          after: 'confirmed',
        },
        email: {
          before: 'old@example.com',
          after: 'new@example.com',
        },
      })
    })

    it('should return empty object when no changes', async () => {
      const before = {
        status: 'confirmed',
        amount: 100,
      }

      const after = {
        status: 'confirmed',
        amount: 100,
      }

      const changes = createChangeObject(before, after)

      expect(changes).toEqual({})
    })

    it('should handle new fields in after object', async () => {
      const before = {
        name: 'John',
      }

      const after = {
        name: 'John',
        email: 'john@example.com',
      }

      const changes = createChangeObject(before, after)

      expect(changes).toEqual({
        email: {
          before: undefined,
          after: 'john@example.com',
        },
      })
    })

    it('should handle null and undefined values', async () => {
      const before = {
        field1: null,
        field2: 'value',
      }

      const after = {
        field1: 'new value',
        field2: null,
      }

      const changes = createChangeObject(before, after)

      expect(changes).toEqual({
        field1: {
          before: null,
          after: 'new value',
        },
        field2: {
          before: 'value',
          after: null,
        },
      })
    })

    it('should handle complex objects', async () => {
      const before = {
        user: { id: '123', name: 'John' },
        items: [1, 2, 3],
      }

      const after = {
        user: { id: '123', name: 'Jane' },
        items: [1, 2, 3, 4],
      }

      const changes = createChangeObject(before, after)

      expect(changes).toEqual({
        user: {
          before: { id: '123', name: 'John' },
          after: { id: '123', name: 'Jane' },
        },
        items: {
          before: [1, 2, 3],
          after: [1, 2, 3, 4],
        },
      })
    })
  })
})
