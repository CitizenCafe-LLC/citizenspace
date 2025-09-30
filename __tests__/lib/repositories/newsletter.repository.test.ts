/**
 * Newsletter Repository Tests
 * Tests for newsletter subscriber database operations
 */

import {
  createNewsletterSubscriber,
  getNewsletterSubscriberByEmail,
  getNewsletterSubscriberById,
  updateNewsletterSubscriberStatus,
  unsubscribeByEmail,
  updateNewsletterPreferences,
  getAllNewsletterSubscribers,
  getNewsletterSubscriberStats,
  deleteNewsletterSubscriber,
  type CreateNewsletterSubscriberData,
} from '@/lib/db/repositories/newsletter.repository'
import { executeQuery, executeQuerySingle } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
  closePool: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Newsletter Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createNewsletterSubscriber', () => {
    it('should create a new subscriber successfully', async () => {
      const mockData: CreateNewsletterSubscriberData = {
        email: 'subscriber@example.com',
        preferences: { topics: ['events', 'news'] },
      }

      const mockSubscriber = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: mockData.email,
        status: 'active',
        preferences: mockData.preferences,
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      // First check returns no existing subscriber
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Insert returns new subscriber
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: mockSubscriber,
        error: null,
      })

      const result = await createNewsletterSubscriber(mockData)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubscriber)
      expect(result.already_subscribed).toBe(false)
    })

    it('should return existing subscriber if already subscribed', async () => {
      const mockSubscriber = {
        id: '123',
        email: 'existing@example.com',
        status: 'active',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockSubscriber,
        error: null,
      })

      const result = await createNewsletterSubscriber({
        email: 'existing@example.com',
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubscriber)
      expect(result.already_subscribed).toBe(true)
    })

    it('should reactivate unsubscribed user', async () => {
      const mockUnsubscribed = {
        id: '123',
        email: 'unsubscribed@example.com',
        status: 'unsubscribed',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }

      const mockReactivated = {
        ...mockUnsubscribed,
        status: 'active',
        unsubscribed_at: null,
      }

      // First query returns unsubscribed user
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: mockUnsubscribed,
        error: null,
      })

      // Update query returns reactivated user
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: mockReactivated,
        error: null,
      })

      const result = await createNewsletterSubscriber({
        email: 'unsubscribed@example.com',
        preferences: { topics: ['updates'] },
      })

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('active')
      expect(result.already_subscribed).toBe(false)
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database connection failed',
      })

      const result = await createNewsletterSubscriber({
        email: 'test@example.com',
      })

      expect(result.error).toBe('Database connection failed')
      expect(result.data).toBeNull()
    })
  })

  describe('getNewsletterSubscriberByEmail', () => {
    it('should fetch subscriber by email', async () => {
      const mockSubscriber = {
        id: '123',
        email: 'test@example.com',
        status: 'active',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockSubscriber,
        error: null,
      })

      const result = await getNewsletterSubscriberByEmail('test@example.com')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubscriber)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        ['test@example.com']
      )
    })

    it('should return null when subscriber not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getNewsletterSubscriberByEmail('nonexistent@example.com')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('getNewsletterSubscriberById', () => {
    it('should fetch subscriber by ID', async () => {
      const mockSubscriber = {
        id: '123',
        email: 'test@example.com',
        status: 'active',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockSubscriber,
        error: null,
      })

      const result = await getNewsletterSubscriberById('123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubscriber)
    })

    it('should return error when subscriber not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getNewsletterSubscriberById('nonexistent')

      expect(result.error).toBe('Newsletter subscriber not found')
      expect(result.data).toBeNull()
    })
  })

  describe('updateNewsletterSubscriberStatus', () => {
    it('should update subscriber status to unsubscribed', async () => {
      const mockUpdated = {
        id: '123',
        email: 'test@example.com',
        status: 'unsubscribed',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await updateNewsletterSubscriberStatus('123', 'unsubscribed')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('unsubscribed')
    })

    it('should update subscriber status to active', async () => {
      const mockUpdated = {
        id: '123',
        status: 'active',
        unsubscribed_at: null,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await updateNewsletterSubscriberStatus('123', 'active')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('active')
    })
  })

  describe('unsubscribeByEmail', () => {
    it('should unsubscribe by email', async () => {
      const mockUnsubscribed = {
        id: '123',
        email: 'test@example.com',
        status: 'unsubscribed',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUnsubscribed,
        error: null,
      })

      const result = await unsubscribeByEmail('test@example.com')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('unsubscribed')
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining("status = 'unsubscribed'"),
        ['test@example.com']
      )
    })
  })

  describe('updateNewsletterPreferences', () => {
    it('should update subscriber preferences', async () => {
      const newPreferences = {
        topics: ['events', 'updates'],
        frequency: 'weekly',
      }

      const mockUpdated = {
        id: '123',
        email: 'test@example.com',
        status: 'active',
        preferences: newPreferences,
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await updateNewsletterPreferences('test@example.com', newPreferences)

      expect(result.error).toBeNull()
      expect(result.data?.preferences).toEqual(newPreferences)
    })
  })

  describe('getAllNewsletterSubscribers', () => {
    it('should fetch all subscribers with pagination', async () => {
      const mockSubscribers = [
        {
          id: '1',
          email: 'user1@example.com',
          status: 'active',
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          status: 'active',
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '2' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockSubscribers,
        error: null,
      })

      const result = await getAllNewsletterSubscribers(
        {},
        { page: 1, limit: 20, sortBy: 'subscribed_at', sortOrder: 'desc' }
      )

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubscribers)
      expect(result.count).toBe(2)
    })

    it('should filter by status', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllNewsletterSubscribers({ status: 'active' })

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = $1'),
        ['active']
      )
    })

    it('should filter by email pattern', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllNewsletterSubscribers({ email: 'test' })

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('email ILIKE $1'),
        ['%test%']
      )
    })
  })

  describe('getNewsletterSubscriberStats', () => {
    it('should fetch subscriber statistics', async () => {
      const mockStats = {
        total: '1000',
        active_count: '900',
        unsubscribed_count: '80',
        bounced_count: '20',
        last_30_days: '150',
        last_7_days: '50',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockStats,
        error: null,
      })

      const result = await getNewsletterSubscriberStats()

      expect(result.error).toBeNull()
      expect(result.data).toEqual({
        total: 1000,
        active_count: 900,
        unsubscribed_count: 80,
        bounced_count: 20,
        last_30_days: 150,
        last_7_days: 50,
      })
    })

    it('should handle empty stats', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getNewsletterSubscriberStats()

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('deleteNewsletterSubscriber', () => {
    it('should hard delete subscriber for GDPR compliance', async () => {
      const mockDeleted = {
        id: '123',
        email: 'deleted@example.com',
        status: 'active',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockDeleted,
        error: null,
      })

      const result = await deleteNewsletterSubscriber('123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockDeleted)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM newsletter_subscribers'),
        ['123']
      )
    })

    it('should return error when subscriber not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await deleteNewsletterSubscriber('nonexistent')

      expect(result.error).toBe('Newsletter subscriber not found')
      expect(result.data).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle thrown errors in createNewsletterSubscriber', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Connection timeout'))

      const result = await createNewsletterSubscriber({
        email: 'test@example.com',
      })

      expect(result.error).toContain('Connection timeout')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in getNewsletterSubscriberByEmail', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Query failed'))

      const result = await getNewsletterSubscriberByEmail('test@example.com')

      expect(result.error).toContain('Query failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in getNewsletterSubscriberById', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Connection lost'))

      const result = await getNewsletterSubscriberById('123')

      expect(result.error).toContain('Connection lost')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in updateNewsletterSubscriberStatus', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Update failed'))

      const result = await updateNewsletterSubscriberStatus('123', 'active')

      expect(result.error).toContain('Update failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in unsubscribeByEmail', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Unsubscribe failed'))

      const result = await unsubscribeByEmail('test@example.com')

      expect(result.error).toContain('Unsubscribe failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in updateNewsletterPreferences', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Preferences update failed'))

      const result = await updateNewsletterPreferences('test@example.com', {})

      expect(result.error).toContain('Preferences update failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in getAllNewsletterSubscribers', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Query failed'))

      const result = await getAllNewsletterSubscribers()

      expect(result.error).toContain('Query failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in getNewsletterSubscriberStats', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Stats query failed'))

      const result = await getNewsletterSubscriberStats()

      expect(result.error).toContain('Stats query failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in deleteNewsletterSubscriber', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Delete failed'))

      const result = await deleteNewsletterSubscriber('123')

      expect(result.error).toContain('Delete failed')
      expect(result.data).toBeNull()
    })
  })

  describe('Database Errors', () => {
    it('should handle updateNewsletterSubscriberStatus not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await updateNewsletterSubscriberStatus('nonexistent', 'active')

      expect(result.error).toBe('Newsletter subscriber not found')
      expect(result.data).toBeNull()
    })

    it('should handle updateNewsletterSubscriberStatus database error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await updateNewsletterSubscriberStatus('123', 'active')

      expect(result.error).toBe('Database error')
      expect(result.data).toBeNull()
    })

    it('should handle unsubscribeByEmail not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await unsubscribeByEmail('nonexistent@example.com')

      expect(result.error).toBe('Newsletter subscriber not found')
      expect(result.data).toBeNull()
    })

    it('should handle unsubscribeByEmail database error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await unsubscribeByEmail('test@example.com')

      expect(result.error).toBe('Database error')
      expect(result.data).toBeNull()
    })

    it('should handle updateNewsletterPreferences not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await updateNewsletterPreferences('nonexistent@example.com', {})

      expect(result.error).toBe('Newsletter subscriber not found')
      expect(result.data).toBeNull()
    })

    it('should handle updateNewsletterPreferences database error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await updateNewsletterPreferences('test@example.com', {})

      expect(result.error).toBe('Database error')
      expect(result.data).toBeNull()
    })

    it('should handle getAllNewsletterSubscribers count error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Count query failed',
      })

      const result = await getAllNewsletterSubscribers()

      expect(result.error).toBe('Count query failed')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })

    it('should handle getAllNewsletterSubscribers data fetch error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '10' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: null,
        error: 'Data fetch failed',
      })

      const result = await getAllNewsletterSubscribers()

      expect(result.error).toBe('Data fetch failed')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })

    it('should handle getNewsletterSubscriberStats database error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Stats query failed',
      })

      const result = await getNewsletterSubscriberStats()

      expect(result.error).toBe('Stats query failed')
      expect(result.data).toBeNull()
    })

    it('should handle deleteNewsletterSubscriber database error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Delete failed',
      })

      const result = await deleteNewsletterSubscriber('123')

      expect(result.error).toBe('Delete failed')
      expect(result.data).toBeNull()
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle getAllNewsletterSubscribers with multiple filters', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '5' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllNewsletterSubscribers({
        status: 'active',
        email: 'test',
        subscribed_after: '2025-01-01',
        subscribed_before: '2025-12-31',
      })

      expect(mockExecuteQuerySingle).toHaveBeenCalled()
      const call = mockExecuteQuerySingle.mock.calls[0]
      expect(call[0]).toContain('WHERE')
      expect(call[0]).toContain('status = $1')
      expect(call[0]).toContain('email ILIKE $2')
      expect(call[0]).toContain('subscribed_at')
    })

    it('should handle updateNewsletterSubscriberStatus to bounced', async () => {
      const mockUpdated = {
        id: '123',
        status: 'bounced',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await updateNewsletterSubscriberStatus('123', 'bounced')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('bounced')
    })
  })
})