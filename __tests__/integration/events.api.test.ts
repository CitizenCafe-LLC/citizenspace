/**
 * Integration Tests for Events API Endpoints
 */

import { NextRequest } from 'next/server'
import { GET as getEvents } from '@/app/api/events/route'
import { GET as getEventBySlug } from '@/app/api/events/[slug]/route'
import { POST as createRSVP, DELETE as cancelRSVPRoute } from '@/app/api/events/[id]/rsvp/route'
import * as eventsRepo from '@/lib/db/repositories/events.repository'
import * as authMiddleware from '@/middleware/auth'
import * as stripeUtils from '@/lib/stripe/utils'

// Mock dependencies
jest.mock('@/lib/db/repositories/events.repository')
jest.mock('@/middleware/auth')
jest.mock('@/lib/stripe/utils')

const mockGetAllEvents = eventsRepo.getAllEvents as jest.MockedFunction<
  typeof eventsRepo.getAllEvents
>
const mockGetEventBySlug = eventsRepo.getEventBySlug as jest.MockedFunction<
  typeof eventsRepo.getEventBySlug
>
const mockGetEventById = eventsRepo.getEventById as jest.MockedFunction<
  typeof eventsRepo.getEventById
>
const mockCheckEventCapacity = eventsRepo.checkEventCapacity as jest.MockedFunction<
  typeof eventsRepo.checkEventCapacity
>
const mockCreateRSVP = eventsRepo.createRSVP as jest.MockedFunction<typeof eventsRepo.createRSVP>
const mockGetUserEventRSVP = eventsRepo.getUserEventRSVP as jest.MockedFunction<
  typeof eventsRepo.getUserEventRSVP
>
const mockCancelRSVP = eventsRepo.cancelRSVP as jest.MockedFunction<typeof eventsRepo.cancelRSVP>

const mockOptionalAuth = authMiddleware.optionalAuth as jest.MockedFunction<
  typeof authMiddleware.optionalAuth
>
const mockRequireAuth = authMiddleware.requireAuth as jest.MockedFunction<
  typeof authMiddleware.requireAuth
>

const mockCreatePaymentIntent = stripeUtils.createPaymentIntent as jest.MockedFunction<
  typeof stripeUtils.createPaymentIntent
>
const mockGetOrCreateStripeCustomer = stripeUtils.getOrCreateStripeCustomer as jest.MockedFunction<
  typeof stripeUtils.getOrCreateStripeCustomer
>

describe('Events API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/events', () => {
    it('should return all events with default pagination', async () => {
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

      mockOptionalAuth.mockResolvedValue(null)
      mockGetAllEvents.mockResolvedValue({ data: mockEvents, error: null })

      const request = new NextRequest('http://localhost:3000/api/events')
      const response = await getEvents(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.meta).toHaveProperty('limit')
      expect(data.meta).toHaveProperty('offset')
    })

    it('should filter upcoming events', async () => {
      mockOptionalAuth.mockResolvedValue(null)
      mockGetAllEvents.mockResolvedValue({ data: [], error: null })

      const request = new NextRequest('http://localhost:3000/api/events?upcoming=true')
      const response = await getEvents(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockGetAllEvents).toHaveBeenCalledWith(
        expect.objectContaining({ upcoming: true }),
        expect.any(Object),
        undefined
      )
    })

    it('should filter events by tags', async () => {
      mockOptionalAuth.mockResolvedValue(null)
      mockGetAllEvents.mockResolvedValue({ data: [], error: null })

      const request = new NextRequest('http://localhost:3000/api/events?tags=workshop,networking')
      const response = await getEvents(request)

      expect(response.status).toBe(200)
      expect(mockGetAllEvents).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['workshop', 'networking'] }),
        expect.any(Object),
        undefined
      )
    })

    it('should respect pagination parameters', async () => {
      mockOptionalAuth.mockResolvedValue(null)
      mockGetAllEvents.mockResolvedValue({ data: [], error: null })

      const request = new NextRequest('http://localhost:3000/api/events?limit=10&offset=20')
      const response = await getEvents(request)

      expect(response.status).toBe(200)
      expect(mockGetAllEvents).toHaveBeenCalledWith(
        undefined,
        { limit: 10, offset: 20 },
        undefined
      )
    })

    it('should validate limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/events?limit=200')
      const response = await getEvents(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid limit')
    })

    it('should handle database errors', async () => {
      mockOptionalAuth.mockResolvedValue(null)
      mockGetAllEvents.mockResolvedValue({ data: null, error: 'Database error' })

      const request = new NextRequest('http://localhost:3000/api/events')
      const response = await getEvents(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/events/:slug', () => {
    it('should return event by slug', async () => {
      const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        slug: 'test-event',
        description: 'A test event',
        rsvp_count: 10,
        available_spots: 10,
      }

      mockOptionalAuth.mockResolvedValue(null)
      mockGetEventBySlug.mockResolvedValue({ data: mockEvent, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/test-event')
      const response = await getEventBySlug(request, { params: { slug: 'test-event' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.slug).toBe('test-event')
    })

    it('should return 404 for non-existent event', async () => {
      mockOptionalAuth.mockResolvedValue(null)
      mockGetEventBySlug.mockResolvedValue({ data: null, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/non-existent')
      const response = await getEventBySlug(request, { params: { slug: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('not found')
    })

    it('should include user RSVP status when authenticated', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
      }

      const mockEvent = {
        id: 'event-123',
        slug: 'test-event',
        user_rsvp_status: 'confirmed',
      }

      mockOptionalAuth.mockResolvedValue(mockUser)
      mockGetEventBySlug.mockResolvedValue({ data: mockEvent, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/test-event', {
        headers: { Authorization: 'Bearer valid-token' },
      })
      const response = await getEventBySlug(request, { params: { slug: 'test-event' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.user_rsvp_status).toBe('confirmed')
    })
  })

  describe('POST /api/events/:id/rsvp', () => {
    it('should create RSVP for free event', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user' as const,
      }

      const mockEvent = {
        id: 'event-123',
        title: 'Free Event',
        slug: 'free-event',
        price: 0,
      }

      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
      }

      mockRequireAuth.mockResolvedValue({ authorized: true, user: mockUser })
      mockGetEventById.mockResolvedValue({ data: mockEvent, error: null })
      mockGetUserEventRSVP.mockResolvedValue({ data: null, error: null })
      mockCheckEventCapacity.mockResolvedValue({
        hasCapacity: true,
        currentCount: 5,
        capacity: 20,
        error: null,
      })
      mockCreateRSVP.mockResolvedValue({ data: mockRSVP, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/event-123/rsvp', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
      })

      const response = await createRSVP(request, { params: { id: 'event-123' } })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.rsvp.status).toBe('confirmed')
      expect(data.data.payment.required).toBe(false)
    })

    it('should add to waitlist when event is at capacity', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user' as const,
      }

      const mockEvent = {
        id: 'event-123',
        price: 0,
      }

      const mockRSVP = {
        id: 'rsvp-123',
        status: 'waitlist',
      }

      mockRequireAuth.mockResolvedValue({ authorized: true, user: mockUser })
      mockGetEventById.mockResolvedValue({ data: mockEvent, error: null })
      mockGetUserEventRSVP.mockResolvedValue({ data: null, error: null })
      mockCheckEventCapacity.mockResolvedValue({
        hasCapacity: false,
        currentCount: 20,
        capacity: 20,
        error: null,
      })
      mockCreateRSVP.mockResolvedValue({ data: mockRSVP, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/event-123/rsvp', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
      })

      const response = await createRSVP(request, { params: { id: 'event-123' } })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.rsvp.status).toBe('waitlist')
      expect(data.data.message).toContain('waitlist')
    })

    it('should create payment intent for paid event', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user' as const,
        stripe_customer_id: 'cus_123',
      }

      const mockEvent = {
        id: 'event-123',
        title: 'Paid Event',
        slug: 'paid-event',
        price: 25.0,
      }

      const mockCustomer = {
        id: 'cus_123',
        email: 'test@example.com',
      }

      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'pi_123_secret',
      }

      const mockRSVP = {
        id: 'rsvp-123',
        payment_status: 'pending',
        payment_intent_id: 'pi_123',
      }

      mockRequireAuth.mockResolvedValue({ authorized: true, user: mockUser })
      mockGetEventById.mockResolvedValue({ data: mockEvent, error: null })
      mockGetUserEventRSVP.mockResolvedValue({ data: null, error: null })
      mockCheckEventCapacity.mockResolvedValue({
        hasCapacity: true,
        currentCount: 5,
        capacity: 20,
        error: null,
      })
      mockGetOrCreateStripeCustomer.mockResolvedValue({
        customer: mockCustomer as any,
        error: null,
      })
      mockCreatePaymentIntent.mockResolvedValue({
        paymentIntent: mockPaymentIntent as any,
        error: null,
      })
      mockCreateRSVP.mockResolvedValue({ data: mockRSVP, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/event-123/rsvp', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
      })

      const response = await createRSVP(request, { params: { id: 'event-123' } })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.payment.required).toBe(true)
      expect(data.data.payment.amount).toBe(25.0)
      expect(data.data.payment.client_secret).toBe('pi_123_secret')
    })

    it('should reject duplicate RSVP', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
      }

      const mockExistingRSVP = {
        id: 'rsvp-123',
        status: 'confirmed',
      }

      mockRequireAuth.mockResolvedValue({ authorized: true, user: mockUser })
      mockGetEventById.mockResolvedValue({ data: { id: 'event-123' }, error: null })
      mockGetUserEventRSVP.mockResolvedValue({ data: mockExistingRSVP, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/event-123/rsvp', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
      })

      const response = await createRSVP(request, { params: { id: 'event-123' } })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toContain('already RSVPed')
    })

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: false,
        response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
      })

      const request = new NextRequest('http://localhost:3000/api/events/event-123/rsvp', {
        method: 'POST',
      })

      const response = await createRSVP(request, { params: { id: 'event-123' } })

      expect(response.status).toBe(401)
    })

    it('should return 404 for non-existent event', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
      }

      mockRequireAuth.mockResolvedValue({ authorized: true, user: mockUser })
      mockGetEventById.mockResolvedValue({ data: null, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/non-existent/rsvp', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
      })

      const response = await createRSVP(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })
  })

  describe('DELETE /api/events/:id/rsvp', () => {
    it('should cancel user RSVP successfully', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
      }

      const mockRSVP = {
        id: 'rsvp-123',
        event_id: 'event-123',
        user_id: 'user-123',
        status: 'confirmed',
      }

      const mockCancelledRSVP = {
        ...mockRSVP,
        status: 'cancelled',
      }

      mockRequireAuth.mockResolvedValue({ authorized: true, user: mockUser })
      mockGetUserEventRSVP.mockResolvedValue({ data: mockRSVP, error: null })
      mockCancelRSVP.mockResolvedValue({ data: mockCancelledRSVP, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/event-123/rsvp', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer valid-token' },
      })

      const response = await cancelRSVPRoute(request, { params: { id: 'event-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.rsvp.status).toBe('cancelled')
    })

    it('should return 404 when RSVP does not exist', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
      }

      mockRequireAuth.mockResolvedValue({ authorized: true, user: mockUser })
      mockGetUserEventRSVP.mockResolvedValue({ data: null, error: null })

      const request = new NextRequest('http://localhost:3000/api/events/event-123/rsvp', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer valid-token' },
      })

      const response = await cancelRSVPRoute(request, { params: { id: 'event-123' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: false,
        response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
      })

      const request = new NextRequest('http://localhost:3000/api/events/event-123/rsvp', {
        method: 'DELETE',
      })

      const response = await cancelRSVPRoute(request, { params: { id: 'event-123' } })

      expect(response.status).toBe(401)
    })
  })
})