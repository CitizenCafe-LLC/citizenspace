/**
 * Events Repository Tests
 * Focused tests for event and RSVP database operations
 */

import {
  getAllEvents,
  getEventBySlug,
  getEventById,
  checkEventCapacity,
  createRSVP,
  getRSVPById,
  updateRSVP,
  cancelRSVP,
  getEventRSVPs,
  getEventRSVPCount,
  getUserRSVPs,
  getUserEventRSVP,
  type EventFilters,
} from '@/lib/db/repositories/events.repository'
import { executeQuery, executeQuerySingle, closePool } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
  closePool: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Events Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllEvents', () => {
    it('should fetch all events with RSVP counts', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Networking Event',
          slug: 'networking-event',
          description: 'Join us for networking',
          start_time: '2025-10-15T18:00:00Z',
          end_time: '2025-10-15T20:00:00Z',
          location: 'Main Hall',
          host: 'John Doe',
          external_rsvp_url: null,
          image: 'event.jpg',
          tags: ['networking', 'business'],
          capacity: 50,
          price: 0,
          rsvp_count: 25,
          available_spots: 25,
          created_at: '2025-10-01T12:00:00Z',
          updated_at: '2025-10-01T12:00:00Z',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockEvents,
        error: null,
      })

      const result = await getAllEvents()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].rsvp_count).toBe(25)
    })

    it('should filter upcoming events', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: EventFilters = { upcoming: true }
      await getAllEvents(filters)

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('e.start_time >= NOW()'),
        expect.any(Array)
      )
    })

    it('should filter past events', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: EventFilters = { past: true }
      await getAllEvents(filters)

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('e.start_time < NOW()'),
        expect.any(Array)
      )
    })

    it('should filter by tags', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: EventFilters = { tags: ['networking', 'tech'] }
      await getAllEvents(filters)

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('e.tags && $'),
        expect.arrayContaining([['networking', 'tech']])
      )
    })

    it('should filter by capacity availability', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: EventFilters = { has_capacity: true }
      await getAllEvents(filters)

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('e.capacity IS NULL OR e.capacity >'),
        expect.any(Array)
      )
    })

    it('should filter free events', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: EventFilters = { is_free: true }
      await getAllEvents(filters)

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('e.price = 0'),
        expect.any(Array)
      )
    })

    it('should apply pagination', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllEvents(undefined, { limit: 10, offset: 20 })

      const call = mockExecuteQuery.mock.calls[0]
      expect(call[0]).toContain('LIMIT')
      expect(call[0]).toContain('OFFSET')
      expect(call[1]).toContain(10)
      expect(call[1]).toContain(20)
    })

    it('should include user RSVP status when userId provided', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getAllEvents(undefined, undefined, 'user-123')

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('user_rsvp_status'),
        expect.arrayContaining(['user-123'])
      )
    })

    it('should handle database errors', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: null,
        error: 'Database query failed',
      })

      const result = await getAllEvents()

      expect(result.error).toBe('Database query failed')
      expect(result.data).toBeNull()
    })
  })

  describe('getEventBySlug', () => {
    it('should fetch event by slug', async () => {
      const mockEvent = {
        id: 'event-123',
        title: 'Tech Talk',
        slug: 'tech-talk',
        description: 'A tech talk event',
        start_time: '2025-10-20T14:00:00Z',
        end_time: '2025-10-20T16:00:00Z',
        location: 'Conference Room',
        host: 'Jane Smith',
        external_rsvp_url: null,
        image: null,
        tags: ['tech'],
        capacity: 30,
        price: 0,
        rsvp_count: 15,
        available_spots: 15,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockEvent,
        error: null,
      })

      const result = await getEventBySlug('tech-talk')

      expect(result.error).toBeNull()
      expect(result.data?.slug).toBe('tech-talk')
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE e.slug = $1'),
        ['tech-talk']
      )
    })

    it('should return error when event not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getEventBySlug('non-existent')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Query failed',
      })

      const result = await getEventBySlug('tech-talk')

      expect(result.error).toBe('Query failed')
      expect(result.data).toBeNull()
    })
  })

  describe('getEventById', () => {
    it('should fetch event by ID', async () => {
      const mockEvent = {
        id: 'event-123',
        title: 'Workshop',
        slug: 'workshop',
        description: 'Hands-on workshop',
        start_time: '2025-10-25T10:00:00Z',
        end_time: '2025-10-25T12:00:00Z',
        location: 'Room A',
        host: 'Bob Johnson',
        external_rsvp_url: null,
        image: null,
        tags: [],
        capacity: null,
        price: 20,
        rsvp_count: 10,
        available_spots: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockEvent,
        error: null,
      })

      const result = await getEventById('event-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('event-123')
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE e.id = $1'),
        ['event-123']
      )
    })

    it('should return error when event not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getEventById('non-existent')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('checkEventCapacity', () => {
    it('should return capacity availability', async () => {
      const mockCapacity = {
        capacity: 50,
        current_count: 30,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockCapacity,
        error: null,
      })

      const result = await checkEventCapacity('event-123')

      expect(result.hasCapacity).toBe(true)
      expect(result.currentCount).toBe(30)
      expect(result.capacity).toBe(50)
      expect(result.error).toBeNull()
    })

    it('should handle full event', async () => {
      const mockCapacity = {
        capacity: 50,
        current_count: 50,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockCapacity,
        error: null,
      })

      const result = await checkEventCapacity('event-123')

      expect(result.hasCapacity).toBe(false)
      expect(result.currentCount).toBe(50)
      expect(result.capacity).toBe(50)
    })

    it('should handle unlimited capacity events', async () => {
      const mockCapacity = {
        capacity: null,
        current_count: 100,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockCapacity,
        error: null,
      })

      const result = await checkEventCapacity('event-123')

      expect(result.hasCapacity).toBe(true)
      expect(result.capacity).toBeNull()
      expect(result.currentCount).toBe(100)
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Query failed',
      })

      const result = await checkEventCapacity('event-123')

      expect(result.hasCapacity).toBe(false)
      expect(result.error).toBe('Query failed')
    })
  })

  describe('createRSVP', () => {
    it('should create RSVP for registered user', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
        payment_status: null,
        payment_intent_id: null,
        guest_name: null,
        guest_email: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockRSVP,
        error: null,
      })

      const result = await createRSVP({
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
      })

      expect(result.error).toBeNull()
      expect(result.data?.user_id).toBe('user-123')
    })

    it('should create RSVP for guest user', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: null,
        status: 'confirmed',
        payment_status: null,
        payment_intent_id: null,
        guest_name: 'John Guest',
        guest_email: 'guest@example.com',
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockRSVP,
        error: null,
      })

      const result = await createRSVP({
        event_id: 'event-123',
        status: 'confirmed',
        guest_name: 'John Guest',
        guest_email: 'guest@example.com',
      })

      expect(result.error).toBeNull()
      expect(result.data?.guest_email).toBe('guest@example.com')
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Insert failed',
      })

      const result = await createRSVP({
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
      })

      expect(result.error).toBe('Insert failed')
      expect(result.data).toBeNull()
    })
  })

  describe('getRSVPById', () => {
    it('should fetch RSVP by ID', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
        payment_status: 'paid',
        payment_intent_id: 'pi_123',
        guest_name: null,
        guest_email: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockRSVP,
        error: null,
      })

      const result = await getRSVPById('rsvp-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('rsvp-123')
    })
  })

  describe('updateRSVP', () => {
    it('should update RSVP status', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        status: 'cancelled',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockRSVP,
        error: null,
      })

      const result = await updateRSVP('rsvp-123', { status: 'cancelled' })

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('cancelled')
    })

    it('should return error when no fields to update', async () => {
      const result = await updateRSVP('rsvp-123', {})

      expect(result.error).toBe('No fields to update')
      expect(result.data).toBeNull()
    })

    it('should return error when RSVP not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await updateRSVP('non-existent', { status: 'cancelled' })

      expect(result.data).toBeNull()
    })
  })

  describe('cancelRSVP', () => {
    it('should cancel RSVP', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        status: 'cancelled',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockRSVP,
        error: null,
      })

      const result = await cancelRSVP('rsvp-123')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('cancelled')
    })
  })

  describe('getEventRSVPs', () => {
    it('should fetch all RSVPs for an event', async () => {
      const mockRSVPs = [
        {
          id: 'rsvp-1',
          event_id: 'event-123',
          user_id: 'user-1',
          status: 'confirmed',
        },
        {
          id: 'rsvp-2',
          event_id: 'event-123',
          user_id: 'user-2',
          status: 'confirmed',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockRSVPs,
        error: null,
      })

      const result = await getEventRSVPs('event-123')

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
    })

    it('should filter RSVPs by status', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getEventRSVPs('event-123', 'confirmed')

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE event_id = $1 AND status = $2'),
        ['event-123', 'confirmed']
      )
    })
  })

  describe('getEventRSVPCount', () => {
    it('should count confirmed RSVPs', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { confirmed_count: 25, waitlist_count: 5, cancelled_count: 3 },
        error: null,
      })

      const result = await getEventRSVPCount('event-123')

      expect(result.error).toBeNull()
      expect(result.data?.confirmed_count).toBe(25)
      expect(result.data?.waitlist_count).toBe(5)
      expect(result.data?.cancelled_count).toBe(3)
    })

    it('should handle zero RSVPs', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { confirmed_count: 0, waitlist_count: 0, cancelled_count: 0 },
        error: null,
      })

      const result = await getEventRSVPCount('event-123')

      expect(result.data?.confirmed_count).toBe(0)
    })
  })

  describe('getUserRSVPs', () => {
    it('should fetch user RSVPs', async () => {
      const mockRSVPs = [
        {
          id: 'rsvp-1',
          event_id: 'event-1',
          user_id: 'user-123',
          status: 'confirmed',
        },
      ]

      mockExecuteQuery.mockResolvedValue({
        data: mockRSVPs,
        error: null,
      })

      const result = await getUserRSVPs('user-123')

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(1)
    })

    it('should filter by upcoming events', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      await getUserRSVPs('user-123', { upcoming: true })

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('e.start_time >= NOW()'),
        expect.arrayContaining(['user-123'])
      )
    })
  })

  describe('getUserEventRSVP', () => {
    it('should fetch user RSVP for specific event', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockRSVP,
        error: null,
      })

      const result = await getUserEventRSVP('user-123', 'event-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('rsvp-123')
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND event_id = $2'),
        ['user-123', 'event-123']
      )
    })

    it('should return null when no RSVP found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getUserEventRSVP('user-123', 'event-123')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Query failed',
      })

      const result = await getUserEventRSVP('user-123', 'event-123')

      expect(result.error).toBe('Query failed')
      expect(result.data).toBeNull()
    })
  })

})
