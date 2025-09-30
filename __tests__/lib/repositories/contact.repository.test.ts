/**
 * Contact Repository Tests
 * Tests for contact submission database operations
 */

import {
  createContactSubmission,
  getAllContactSubmissions,
  getContactSubmissionById,
  updateContactSubmissionStatus,
  deleteContactSubmission,
  getContactSubmissionStats,
  type CreateContactSubmissionData,
} from '@/lib/db/repositories/contact.repository'
import { executeQuery, executeQuerySingle, closePool } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
  closePool: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Contact Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createContactSubmission', () => {
    it('should create a contact submission successfully', async () => {
      const mockData: CreateContactSubmissionData = {
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'general',
        message: 'This is a test message',
      }

      const mockSubmission = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...mockData,
        status: 'new',
        admin_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockSubmission,
        error: null,
      })

      const result = await createContactSubmission(mockData)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubmission)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO contact_submissions'),
        [mockData.name, mockData.email, mockData.topic, mockData.message]
      )
    })

    it('should handle database errors', async () => {
      const mockData: CreateContactSubmissionData = {
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'booking',
        message: 'Test message',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database connection failed',
      })

      const result = await createContactSubmission(mockData)

      expect(result.error).toBe('Database connection failed')
      expect(result.data).toBeNull()
    })

    it('should handle all topic types', async () => {
      const topics = ['general', 'booking', 'partnership', 'press'] as const

      for (const topic of topics) {
        mockExecuteQuerySingle.mockResolvedValue({
          data: {
            id: '123',
            name: 'Test',
            email: 'test@example.com',
            topic,
            message: 'Test',
            status: 'new',
            admin_notes: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
          error: null,
        })

        const result = await createContactSubmission({
          name: 'Test',
          email: 'test@example.com',
          topic,
          message: 'Test message',
        })

        expect(result.error).toBeNull()
        expect(result.data?.topic).toBe(topic)
      }
    })
  })

  describe('getAllContactSubmissions', () => {
    it('should fetch all submissions with pagination', async () => {
      const mockSubmissions = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          topic: 'general',
          message: 'Test',
          status: 'new',
          admin_notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          topic: 'booking',
          message: 'Test 2',
          status: 'in_progress',
          admin_notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '2' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockSubmissions,
        error: null,
      })

      const result = await getAllContactSubmissions(
        {},
        { page: 1, limit: 20, sortBy: 'created_at', sortOrder: 'desc' }
      )

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubmissions)
      expect(result.count).toBe(2)
    })

    it('should filter by status', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'John',
            email: 'john@example.com',
            topic: 'general',
            message: 'Test',
            status: 'new',
            admin_notes: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        error: null,
      })

      const result = await getAllContactSubmissions({ status: 'new' })

      expect(result.error).toBeNull()
      expect(result.count).toBe(1)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = $1'),
        ['new']
      )
    })

    it('should filter by topic', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllContactSubmissions({ topic: 'partnership' })

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE topic = $1'),
        ['partnership']
      )
    })

    it('should filter by email', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllContactSubmissions({ email: 'test@example.com' })

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        ['test@example.com']
      )
    })

    it('should search across name, email, and message', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllContactSubmissions({ search: 'john' })

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        ['%john%']
      )
    })
  })

  describe('getContactSubmissionById', () => {
    it('should fetch a submission by ID', async () => {
      const mockSubmission = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'general',
        message: 'Test message',
        status: 'new',
        admin_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockSubmission,
        error: null,
      })

      const result = await getContactSubmissionById('123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockSubmission)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        ['123']
      )
    })

    it('should return error when submission not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getContactSubmissionById('nonexistent')

      expect(result.error).toBe('Contact submission not found')
      expect(result.data).toBeNull()
    })
  })

  describe('updateContactSubmissionStatus', () => {
    it('should update submission status and notes', async () => {
      const mockUpdated = {
        id: '123',
        name: 'John',
        email: 'john@example.com',
        topic: 'general',
        message: 'Test',
        status: 'in_progress',
        admin_notes: 'Following up',
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockUpdated,
        error: null,
      })

      const result = await updateContactSubmissionStatus('123', 'in_progress', 'Following up')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockUpdated)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE contact_submissions'),
        ['123', 'in_progress', 'Following up']
      )
    })

    it('should update status without notes', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: {
          id: '123',
          status: 'resolved',
          admin_notes: null,
        },
        error: null,
      })

      await updateContactSubmissionStatus('123', 'resolved')

      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.anything(),
        ['123', 'resolved', null]
      )
    })
  })

  describe('deleteContactSubmission', () => {
    it('should soft delete by setting status to closed', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: {
          id: '123',
          status: 'closed',
        },
        error: null,
      })

      const result = await deleteContactSubmission('123')

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE contact_submissions'),
        ['123']
      )
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining("status = 'closed'"),
        ['123']
      )
    })
  })

  describe('getContactSubmissionStats', () => {
    it('should fetch submission statistics', async () => {
      const mockStats = {
        total: '100',
        new_count: '30',
        in_progress_count: '20',
        resolved_count: '40',
        closed_count: '10',
        general_count: '50',
        booking_count: '25',
        partnership_count: '15',
        press_count: '10',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockStats,
        error: null,
      })

      const result = await getContactSubmissionStats()

      expect(result.error).toBeNull()
      expect(result.data).toEqual({
        total: 100,
        new_count: 30,
        in_progress_count: 20,
        resolved_count: 40,
        closed_count: 10,
        general_count: 50,
        booking_count: 25,
        partnership_count: 15,
        press_count: 10,
      })
    })

    it('should handle empty stats', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getContactSubmissionStats()

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await getContactSubmissionStats()

      expect(result.error).toBe('Database error')
      expect(result.data).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle thrown errors in createContactSubmission', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Connection timeout'))

      const result = await createContactSubmission({
        name: 'Test',
        email: 'test@example.com',
        topic: 'general',
        message: 'Test message',
      })

      expect(result.error).toContain('Connection timeout')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in getAllContactSubmissions', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Query failed'))

      const result = await getAllContactSubmissions()

      expect(result.error).toContain('Query failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in getContactSubmissionById', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Connection lost'))

      const result = await getContactSubmissionById('123')

      expect(result.error).toContain('Connection lost')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in updateContactSubmissionStatus', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Update failed'))

      const result = await updateContactSubmissionStatus('123', 'resolved')

      expect(result.error).toContain('Update failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in deleteContactSubmission', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Delete failed'))

      const result = await deleteContactSubmission('123')

      expect(result.error).toContain('Delete failed')
      expect(result.data).toBeNull()
    })

    it('should handle thrown errors in getContactSubmissionStats', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Stats query failed'))

      const result = await getContactSubmissionStats()

      expect(result.error).toContain('Stats query failed')
      expect(result.data).toBeNull()
    })
  })

  describe('Complex Filters', () => {
    it('should handle multiple filters combined', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllContactSubmissions({
        status: 'new',
        topic: 'booking',
        email: 'test@example.com',
        date_from: '2025-01-01',
        date_to: '2025-12-31',
        search: 'urgent',
      })

      expect(mockExecuteQuerySingle).toHaveBeenCalled()
      const call = mockExecuteQuerySingle.mock.calls[0]
      expect(call[0]).toContain('WHERE')
      expect(call[0]).toContain('status = $1')
      expect(call[0]).toContain('topic = $2')
      expect(call[0]).toContain('email = $3')
    })

    it('should handle getAllContactSubmissions with database error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Count query failed',
      })

      const result = await getAllContactSubmissions()

      expect(result.error).toBe('Count query failed')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })

    it('should handle getAllContactSubmissions data fetch error', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '10' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: null,
        error: 'Data fetch failed',
      })

      const result = await getAllContactSubmissions()

      expect(result.error).toBe('Data fetch failed')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })
  })
})