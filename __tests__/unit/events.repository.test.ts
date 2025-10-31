/**
 * Unit Tests for Events Repository
 */

import {
  getAllEvents,
  getEventBySlug,
  getEventById,
  checkEventCapacity,
  createRSVP,
  cancelRSVP,
  getEventRSVPs,
  getEventRSVPCount,
  getUserRSVPs,
  getUserEventRSVP,
  createEvent,
} from '@/lib/db/repositories/events.repository'
import * as postgres from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres')

const mockExecuteQuery = postgres.executeQuery as jest.MockedFunction<typeof postgres.executeQuery>
const mockExecuteQuerySingle = postgres.executeQuerySingle as jest.MockedFunction<
  typeof postgres.executeQuerySingle
>

describe('Events Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createEvent', () => {
    it('should create a new event successfully', async () => {
      const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        slug: 'test-event',
        description: 'A test event',
        start_time: '2025-10-01T19:00:00Z',
        end_time: '2025-10-01T21:00:00Z',
        location: 'Test Location',
        host: 'Test Host',
        external_rsvp_url: null,
        image: null,
        tags: ['test', 'workshop'],
        capacity: 20,
        price: 25.0,
        created_at: '2025-09-29T00:00:00Z',
        updated_at: '2025-09-29T00:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({ data: mockEvent, error: null })

      const result = await createEvent({
        title: 'Test Event',
        slug: 'test-event',
        description: 'A test event',
        start_time: '2025-10-01T19:00:00Z',
        end_time: '2025-10-01T21:00:00Z',
        location: 'Test Location',
        host: 'Test Host',
        tags: ['test', 'workshop'],
        capacity: 20,
        price: 25.0,
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockEvent)
      expect(mockExecuteQuerySingle).toHaveBeenCalledTimes(1)
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await createEvent({
        title: 'Test Event',
        slug: 'test-event',
        description: 'A test event',
        start_time: '2025-10-01T19:00:00Z',
        end_time: '2025-10-01T21:00:00Z',
        location: 'Test Location',
        host: 'Test Host',
      })

      expect(result.error).toBe('Database error')
      expect(result.data).toBeNull()
    })
  })

  describe('getAllEvents', () => {
    it('should fetch all events with default filters', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Event 1',
          slug: 'event-1',
          rsvp_count: 10,
          available_spots: 10,
        },
        {
          id: 'event-2',
          title: 'Event 2',
          slug: 'event-2',
          rsvp_count: 5,
          available_spots: null,
        },
      ]

      mockExecuteQuery.mockResolvedValue({ data: mockEvents, error: null })

      const result = await getAllEvents()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1)
    })

    it('should filter upcoming events', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await getAllEvents({ upcoming: true })

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1)

      const query = mockExecuteQuery.mock.calls[0][0]
      expect(query).toContain('e.start_time >= NOW()')
    })

    it('should filter past events', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await getAllEvents({ past: true })

      expect(result.error).toBeNull()
      const query = mockExecuteQuery.mock.calls[0][0]
      expect(query).toContain('e.start_time < NOW()')
    })

    it('should filter events by tags', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await getAllEvents({ tags: ['workshop', 'networking'] })

      expect(result.error).toBeNull()
      const params = mockExecuteQuery.mock.calls[0][1]
      expect(params).toContainEqual(['workshop', 'networking'])
    })

    it('should include user RSVP status when userId provided', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await getAllEvents(undefined, undefined, 'user-123')

      expect(result.error).toBeNull()
      const query = mockExecuteQuery.mock.calls[0][0]
      expect(query).toContain('user_rsvp_status')
    })

    it('should respect pagination parameters', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const result = await getAllEvents(undefined, { limit: 10, offset: 20 })

      expect(result.error).toBeNull()
      const params = mockExecuteQuery.mock.calls[0][1]
      expect(params).toContain(10)
      expect(params).toContain(20)
    })
  })

  describe('getEventBySlug', () => {
    it('should fetch event by slug', async () => {
      const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        slug: 'test-event',
        rsvp_count: 10,
        available_spots: 10,
      }

      mockExecuteQuerySingle.mockResolvedValue({ data: mockEvent, error: null })

      const result = await getEventBySlug('test-event')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockEvent)
      expect(mockExecuteQuerySingle).toHaveBeenCalledTimes(1)
    })

    it('should return null for non-existent slug', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })

      const result = await getEventBySlug('non-existent')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })

    it('should include user RSVP status when userId provided', async () => {
      const mockEvent = {
        id: 'event-123',
        user_rsvp_status: 'confirmed',
      }

      mockExecuteQuerySingle.mockResolvedValue({ data: mockEvent, error: null })

      const result = await getEventBySlug('test-event', 'user-123')

      expect(result.error).toBeNull()
      expect(result.data?.user_rsvp_status).toBe('confirmed')
    })
  })

  describe('checkEventCapacity', () => {
    it('should return true for events with available capacity', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { capacity: 20, current_count: 10 },
        error: null,
      })

      const result = await checkEventCapacity('event-123')

      expect(result.error).toBeNull()
      expect(result.hasCapacity).toBe(true)
      expect(result.currentCount).toBe(10)
      expect(result.capacity).toBe(20)
    })

    it('should return false for events at capacity', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { capacity: 20, current_count: 20 },
        error: null,
      })

      const result = await checkEventCapacity('event-123')

      expect(result.error).toBeNull()
      expect(result.hasCapacity).toBe(false)
      expect(result.currentCount).toBe(20)
    })

    it('should return true for events with unlimited capacity', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { capacity: null, current_count: 100 },
        error: null,
      })

      const result = await checkEventCapacity('event-123')

      expect(result.error).toBeNull()
      expect(result.hasCapacity).toBe(true)
      expect(result.capacity).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await checkEventCapacity('event-123')

      expect(result.error).toBe('Database error')
      expect(result.hasCapacity).toBe(false)
    })
  })

  describe('createRSVP', () => {
    it('should create RSVP for authenticated user', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
        payment_status: null,
        created_at: '2025-09-29T00:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({ data: mockRSVP, error: null })

      const result = await createRSVP({
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockRSVP)
    })

    it('should create RSVP with waitlist status', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'waitlist',
      }

      mockExecuteQuerySingle.mockResolvedValue({ data: mockRSVP, error: null })

      const result = await createRSVP({
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'waitlist',
      })

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('waitlist')
    })

    it('should create RSVP with payment information for paid events', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
        payment_status: 'pending',
        payment_intent_id: 'pi_123',
      }

      mockExecuteQuerySingle.mockResolvedValue({ data: mockRSVP, error: null })

      const result = await createRSVP({
        event_id: 'event-123',
        user_id: 'user-123',
        payment_status: 'pending',
        payment_intent_id: 'pi_123',
      })

      expect(result.error).toBeNull()
      expect(result.data?.payment_status).toBe('pending')
      expect(result.data?.payment_intent_id).toBe('pi_123')
    })
  })

  describe('cancelRSVP', () => {
    it('should cancel user RSVP successfully', async () => {
      // Mock verification query
      mockExecuteQuerySingle
        .mockResolvedValueOnce({
          data: { user_id: 'user-123' },
          error: null,
        })
        // Mock update query
        .mockResolvedValueOnce({
          data: {
            id: 'rsvp-123',
            status: 'cancelled',
          },
          error: null,
        })

      const result = await cancelRSVP('rsvp-123', 'user-123')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('cancelled')
    })

    it('should reject cancellation for wrong user', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: { user_id: 'user-456' },
        error: null,
      })

      const result = await cancelRSVP('rsvp-123', 'user-123')

      expect(result.error).toBe('Unauthorized to cancel this RSVP')
      expect(result.data).toBeNull()
    })

    it('should handle non-existent RSVP', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await cancelRSVP('rsvp-123', 'user-123')

      expect(result.error).toBe('RSVP not found')
      expect(result.data).toBeNull()
    })
  })

  describe('getEventRSVPs', () => {
    it('should fetch all RSVPs for an event', async () => {
      const mockRSVPs = [
        { id: 'rsvp-1', event_id: 'event-123', status: 'confirmed' },
        { id: 'rsvp-2', event_id: 'event-123', status: 'confirmed' },
      ]

      mockExecuteQuery.mockResolvedValue({ data: mockRSVPs, error: null })

      const result = await getEventRSVPs('event-123')

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
    })

    it('should filter RSVPs by status', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      await getEventRSVPs('event-123', 'confirmed')

      const query = mockExecuteQuery.mock.calls[0][0]
      expect(query).toContain('status = $2')
    })
  })

  describe('getEventRSVPCount', () => {
    it('should return RSVP counts by status', async () => {
      const mockCounts = {
        confirmed_count: 15,
        waitlist_count: 5,
        cancelled_count: 2,
      }

      mockExecuteQuerySingle.mockResolvedValue({ data: mockCounts, error: null })

      const result = await getEventRSVPCount('event-123')

      expect(result.error).toBeNull()
      expect(result.data?.confirmed_count).toBe(15)
      expect(result.data?.waitlist_count).toBe(5)
      expect(result.data?.cancelled_count).toBe(2)
    })
  })

  describe('getUserRSVPs', () => {
    it('should fetch all RSVPs for a user', async () => {
      const mockRSVPs = [
        { id: 'rsvp-1', user_id: 'user-123', event: { title: 'Event 1' } },
        { id: 'rsvp-2', user_id: 'user-123', event: { title: 'Event 2' } },
      ]

      mockExecuteQuery.mockResolvedValue({ data: mockRSVPs, error: null })

      const result = await getUserRSVPs('user-123')

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
    })

    it('should filter upcoming RSVPs', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      await getUserRSVPs('user-123', { upcoming: true })

      const query = mockExecuteQuery.mock.calls[0][0]
      expect(query).toContain('e.start_time >= NOW()')
    })

    it('should filter past RSVPs', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      await getUserRSVPs('user-123', { past: true })

      const query = mockExecuteQuery.mock.calls[0][0]
      expect(query).toContain('e.start_time < NOW()')
    })
  })

  describe('getUserEventRSVP', () => {
    it('should fetch user RSVP for specific event', async () => {
      const mockRSVP = {
        id: 'rsvp-123',
        user_id: 'user-123',
        event_id: 'event-123',
        status: 'confirmed',
      }

      mockExecuteQuerySingle.mockResolvedValue({ data: mockRSVP, error: null })

      const result = await getUserEventRSVP('user-123', 'event-123')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockRSVP)
    })

    it('should return null when no RSVP exists', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })

      const result = await getUserEventRSVP('user-123', 'event-123')

      expect(result.error).toBeNull()
      expect(result.data).toBeNull()
    })
  })
})