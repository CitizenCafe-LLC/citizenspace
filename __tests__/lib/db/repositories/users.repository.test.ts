/**
 * Users Repository Tests
 * Comprehensive tests for user management database operations
 */

import {
  getAllUsers,
  getUserByIdAdmin,
  updateUser,
  deleteUser,
  getUserStatistics,
  getMembershipDistribution,
  type UserFilters,
} from '@/lib/db/repositories/users.repository'
import { executeQuery, executeQuerySingle, closePool } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
  closePool: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Users Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllUsers', () => {
    it('should fetch all users with default pagination', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          full_name: 'User One',
          role: 'user',
          nft_holder: false,
          membership_plan: null,
          bookings_count: 5,
          total_spent: 250.5,
          orders_count: 3,
          created_at: '2025-09-01T12:00:00Z',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          full_name: 'User Two',
          role: 'user',
          nft_holder: true,
          membership_plan: {
            id: 'plan-1',
            name: 'Premium',
            slug: 'premium',
            price: 99.99,
          },
          bookings_count: 10,
          total_spent: 500.0,
          orders_count: 7,
          created_at: '2025-08-15T10:00:00Z',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '2' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockUsers,
        error: null,
      })

      const result = await getAllUsers()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
      expect(result.count).toBe(2)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) FROM users'),
        expect.any(Array)
      )
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY'),
        expect.arrayContaining([20, 0])
      )
    })

    it('should filter by role', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: UserFilters = { role: 'admin' }
      const result = await getAllUsers(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.role = $1'),
        expect.arrayContaining(['admin'])
      )
    })

    it('should filter by nft_holder status', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '5' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: UserFilters = { nft_holder: true }
      const result = await getAllUsers(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.nft_holder = $1'),
        expect.arrayContaining([true])
      )
    })

    it('should filter by membership_plan_id', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '3' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: UserFilters = { membership_plan_id: 'plan-123' }
      const result = await getAllUsers(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.membership_plan_id = $1'),
        expect.arrayContaining(['plan-123'])
      )
    })

    it('should filter by membership_status', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '10' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: UserFilters = { membership_status: 'active' }
      const result = await getAllUsers(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.membership_status = $1'),
        expect.arrayContaining(['active'])
      )
    })

    it('should search by name or email', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '2' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: UserFilters = { search: 'john' }
      const result = await getAllUsers(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('u.full_name ILIKE $1 OR u.email ILIKE $1'),
        expect.arrayContaining(['%john%'])
      )
    })

    it('should apply multiple filters together', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: UserFilters = {
        role: 'user',
        nft_holder: true,
        membership_status: 'active',
      }
      const result = await getAllUsers(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.role = $1 AND u.nft_holder = $2 AND u.membership_status = $3'),
        expect.arrayContaining(['user', true, 'active'])
      )
    })

    it('should handle custom pagination', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '100' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const pagination = { page: 3, limit: 10 }
      const result = await getAllUsers(undefined, pagination)

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([10, 20])
      )
    })

    it('should handle custom sorting', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '10' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const pagination = { sortBy: 'u.email', sortOrder: 'asc' as const }
      const result = await getAllUsers(undefined, pagination)

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY u.email ASC'),
        expect.any(Array)
      )
    })

    it('should parse total_spent as float', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [
          {
            id: 'user-1',
            total_spent: '123.45',
          },
        ],
        error: null,
      })

      const result = await getAllUsers()

      expect(result.error).toBeNull()
      expect(result.data?.[0].total_spent).toBe(123.45)
    })

    it('should handle count query errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Count query failed',
      })

      const result = await getAllUsers()

      expect(result.error).toBe('Count query failed')
      expect(result.data).toBeNull()
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

      const result = await getAllUsers()

      expect(result.error).toBe('Data query failed')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })

  })

  describe('getUserByIdAdmin', () => {
    it('should fetch user by ID with full details', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        full_name: 'John Doe',
        role: 'user',
        nft_holder: true,
        membership_plan: {
          id: 'plan-1',
          name: 'Premium',
          slug: 'premium',
          price: 99.99,
          billing_period: 'monthly',
          features: ['feature1', 'feature2'],
          meeting_room_credits_hours: 10,
        },
        bookings_count: 15,
        active_bookings_count: 3,
        total_spent: '1500.50',
        orders_count: 20,
        completed_orders_count: 18,
        created_at: '2025-01-01T00:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUser,
        error: null,
      })

      const result = await getUserByIdAdmin('user-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('user-123')
      expect(result.data?.total_spent).toBe(1500.5)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.id = $1'),
        ['user-123']
      )
    })

    it('should return error when user not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getUserByIdAdmin('non-existent')

      expect(result.error).toBe('User not found')
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database query failed',
      })

      const result = await getUserByIdAdmin('user-123')

      expect(result.error).toBe('Database query failed')
      expect(result.data).toBeNull()
    })

  })

  describe('updateUser', () => {
    it('should update user email', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'newemail@example.com',
        full_name: 'John Doe',
        role: 'user',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: updatedUser,
        error: null,
      })

      const result = await updateUser('user-123', { email: 'newemail@example.com' })

      expect(result.error).toBeNull()
      expect(result.data?.email).toBe('newemail@example.com')
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining(['newemail@example.com', 'user-123'])
      )
    })

    it('should update user full_name', async () => {
      const updatedUser = {
        id: 'user-123',
        full_name: 'Jane Smith',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: updatedUser,
        error: null,
      })

      const result = await updateUser('user-123', { full_name: 'Jane Smith' })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('SET full_name = $1'),
        expect.arrayContaining(['Jane Smith', 'user-123'])
      )
    })

    it('should update user role', async () => {
      const updatedUser = {
        id: 'user-123',
        role: 'admin',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: updatedUser,
        error: null,
      })

      const result = await updateUser('user-123', { role: 'admin' })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('SET role = $1'),
        expect.arrayContaining(['admin', 'user-123'])
      )
    })

    it('should update multiple fields', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'new@example.com',
        full_name: 'New Name',
        role: 'staff',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: updatedUser,
        error: null,
      })

      const result = await updateUser('user-123', {
        email: 'new@example.com',
        full_name: 'New Name',
        role: 'staff',
      })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('SET email = $1, full_name = $2, role = $3'),
        expect.arrayContaining(['new@example.com', 'New Name', 'staff', 'user-123'])
      )
    })

    it('should update nft_holder status', async () => {
      const updatedUser = {
        id: 'user-123',
        nft_holder: true,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: updatedUser,
        error: null,
      })

      const result = await updateUser('user-123', { nft_holder: true })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('SET nft_holder = $1'),
        expect.arrayContaining([true, 'user-123'])
      )
    })

    it('should update membership fields', async () => {
      const updatedUser = {
        id: 'user-123',
        membership_plan_id: 'plan-456',
        membership_status: 'active',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: updatedUser,
        error: null,
      })

      const result = await updateUser('user-123', {
        membership_plan_id: 'plan-456',
        membership_status: 'active',
      })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('SET membership_plan_id = $1, membership_status = $2'),
        expect.arrayContaining(['plan-456', 'active', 'user-123'])
      )
    })

    it('should return error when no fields to update', async () => {
      const result = await updateUser('user-123', {})

      expect(result.error).toBe('No fields to update')
      expect(result.data).toBeNull()
      expect(mockExecuteQuerySingle).not.toHaveBeenCalled()
    })

    it('should return error when user not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await updateUser('non-existent', { email: 'test@example.com' })

      expect(result.error).toBe('User not found')
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Update query failed',
      })

      const result = await updateUser('user-123', { email: 'test@example.com' })

      expect(result.error).toBe('Update query failed')
      expect(result.data).toBeNull()
    })

  })

  describe('deleteUser', () => {
    it('should soft delete user successfully', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({
          data: { active_bookings: '0' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'user-123', email: 'deleted_user-123@deleted.com' },
          error: null,
        })

      const result = await deleteUser('user-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('user-123')
      expect(mockExecuteQuerySingle).toHaveBeenCalledTimes(2)
      expect(mockExecuteQuerySingle).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE users'),
        ['user-123']
      )
    })

    it('should prevent deletion when user has active bookings', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { active_bookings: '3' },
        error: null,
      })

      const result = await deleteUser('user-123')

      expect(result.error).toContain('Cannot delete user with 3 active booking(s)')
      expect(result.data).toBeNull()
    })

    it('should anonymize user data on deletion', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({
          data: { active_bookings: '0' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'user-123', email: 'deleted_user-123@deleted.com' },
          error: null,
        })

      const result = await deleteUser('user-123')

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("full_name = 'Deleted User'"),
        ['user-123']
      )
    })

    it('should return error when user not found', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({
          data: { active_bookings: '0' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })

      const result = await deleteUser('non-existent')

      expect(result.error).toBe('User not found')
      expect(result.data).toBeNull()
    })

    it('should handle database errors during check', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Check query failed',
      })

      const result = await deleteUser('user-123')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

  })

  describe('getUserStatistics', () => {
    it('should fetch user statistics successfully', async () => {
      const mockStats = {
        total_users: '100',
        admin_count: '5',
        staff_count: '10',
        user_count: '85',
        nft_holder_count: '20',
        active_members: '40',
        paused_members: '5',
        cancelled_members: '10',
        new_users_last_30_days: '15',
        new_users_last_7_days: '7',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockStats,
        error: null,
      })

      const result = await getUserStatistics()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockStats)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as total_users'),
        undefined
      )
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Statistics query failed',
      })

      const result = await getUserStatistics()

      expect(result.error).toBe('Statistics query failed')
      expect(result.data).toBeNull()
    })

  })

  describe('getMembershipDistribution', () => {
    it('should fetch membership distribution successfully', async () => {
      const mockDistribution = [
        {
          membership_name: 'Premium',
          membership_slug: 'premium',
          user_count: '50',
          total_revenue: '4999.50',
        },
        {
          membership_name: 'Basic',
          membership_slug: 'basic',
          user_count: '30',
          total_revenue: '1499.70',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockDistribution,
        error: null,
      })

      const result = await getMembershipDistribution()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].total_revenue).toBe(4999.5)
      expect(result.data?.[1].total_revenue).toBe(1499.7)
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM membership_plans mp'),
        undefined
      )
    })

    it('should handle zero revenue', async () => {
      const mockDistribution = [
        {
          membership_name: 'Free',
          membership_slug: 'free',
          user_count: '10',
          total_revenue: null,
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockDistribution,
        error: null,
      })

      const result = await getMembershipDistribution()

      expect(result.error).toBeNull()
      expect(result.data?.[0].total_revenue).toBe(0)
    })

    it('should handle database errors', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: null,
        error: 'Distribution query failed',
      })

      const result = await getMembershipDistribution()

      expect(result.error).toBe('Distribution query failed')
      expect(result.data).toBeNull()
    })

  })
})
