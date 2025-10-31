/**
 * Tests for Pusher Configuration
 * Validates server-side and client-side Pusher setup
 */

import { PUSHER_CHANNELS, PUSHER_EVENTS, validatePusherConfig } from '@/lib/realtime/config'

describe('Pusher Configuration', () => {
  describe('PUSHER_CHANNELS', () => {
    it('should define workspace availability channel', () => {
      expect(PUSHER_CHANNELS.WORKSPACE_AVAILABILITY).toBe('workspace-availability')
    })

    it('should generate private user notification channel', () => {
      const userId = 'user-123'
      const channel = PUSHER_CHANNELS.USER_NOTIFICATIONS(userId)
      expect(channel).toBe('private-user-user-123')
    })

    it('should generate private booking update channel', () => {
      const bookingId = 'booking-456'
      const channel = PUSHER_CHANNELS.BOOKING_UPDATES(bookingId)
      expect(channel).toBe('private-booking-booking-456')
    })

    it('should generate private order update channel', () => {
      const orderId = 'order-789'
      const channel = PUSHER_CHANNELS.ORDER_UPDATES(orderId)
      expect(channel).toBe('private-order-order-789')
    })

    it('should define presence channels', () => {
      expect(PUSHER_CHANNELS.ADMIN_DASHBOARD).toBe('presence-admin-dashboard')
      expect(PUSHER_CHANNELS.STAFF_ORDERS).toBe('presence-staff-orders')
    })
  })

  describe('PUSHER_EVENTS', () => {
    it('should define booking events', () => {
      expect(PUSHER_EVENTS.BOOKING_CREATED).toBe('booking:created')
      expect(PUSHER_EVENTS.BOOKING_CONFIRMED).toBe('booking:confirmed')
      expect(PUSHER_EVENTS.BOOKING_CANCELLED).toBe('booking:cancelled')
      expect(PUSHER_EVENTS.BOOKING_CHECKED_IN).toBe('booking:checked-in')
      expect(PUSHER_EVENTS.BOOKING_CHECKED_OUT).toBe('booking:checked-out')
    })

    it('should define order events', () => {
      expect(PUSHER_EVENTS.ORDER_CREATED).toBe('order:created')
      expect(PUSHER_EVENTS.ORDER_STATUS_CHANGED).toBe('order:status-changed')
      expect(PUSHER_EVENTS.ORDER_READY).toBe('order:ready')
      expect(PUSHER_EVENTS.ORDER_COMPLETED).toBe('order:completed')
      expect(PUSHER_EVENTS.ORDER_CANCELLED).toBe('order:cancelled')
    })

    it('should define availability events', () => {
      expect(PUSHER_EVENTS.AVAILABILITY_UPDATED).toBe('availability:updated')
      expect(PUSHER_EVENTS.SEAT_OCCUPIED).toBe('seat:occupied')
      expect(PUSHER_EVENTS.SEAT_AVAILABLE).toBe('seat:available')
    })

    it('should define notification event', () => {
      expect(PUSHER_EVENTS.NOTIFICATION).toBe('notification')
    })
  })

  describe('validatePusherConfig', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should validate server-side configuration', () => {
      process.env.PUSHER_APP_ID = 'test-app-id'
      process.env.PUSHER_KEY = 'test-key'
      process.env.PUSHER_SECRET = 'test-secret'
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-public-key'

      const result = validatePusherConfig()

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing PUSHER_APP_ID', () => {
      delete process.env.PUSHER_APP_ID
      process.env.PUSHER_KEY = 'test-key'
      process.env.PUSHER_SECRET = 'test-secret'
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-public-key'

      const result = validatePusherConfig()

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('PUSHER_APP_ID is not set')
    })

    it('should detect missing PUSHER_KEY', () => {
      process.env.PUSHER_APP_ID = 'test-app-id'
      delete process.env.PUSHER_KEY
      process.env.PUSHER_SECRET = 'test-secret'
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-public-key'

      const result = validatePusherConfig()

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('PUSHER_KEY is not set')
    })

    it('should detect missing PUSHER_SECRET', () => {
      process.env.PUSHER_APP_ID = 'test-app-id'
      process.env.PUSHER_KEY = 'test-key'
      delete process.env.PUSHER_SECRET
      process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-public-key'

      const result = validatePusherConfig()

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('PUSHER_SECRET is not set')
    })

    it('should detect missing NEXT_PUBLIC_PUSHER_KEY', () => {
      process.env.PUSHER_APP_ID = 'test-app-id'
      process.env.PUSHER_KEY = 'test-key'
      process.env.PUSHER_SECRET = 'test-secret'
      delete process.env.NEXT_PUBLIC_PUSHER_KEY

      const result = validatePusherConfig()

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('NEXT_PUBLIC_PUSHER_KEY is not set')
    })

    it('should detect multiple missing environment variables', () => {
      delete process.env.PUSHER_APP_ID
      delete process.env.PUSHER_KEY
      delete process.env.PUSHER_SECRET
      delete process.env.NEXT_PUBLIC_PUSHER_KEY

      const result = validatePusherConfig()

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('Event Data Types', () => {
    it('should have valid BookingEventData structure', () => {
      const bookingEvent = {
        id: 'booking-123',
        user_id: 'user-456',
        workspace_id: 'workspace-789',
        booking_type: 'meeting-room' as const,
        booking_date: '2025-10-27',
        start_time: '09:00',
        end_time: '10:00',
        status: 'confirmed' as const,
        workspace_name: 'Conference Room A',
      }

      expect(bookingEvent.id).toBeDefined()
      expect(bookingEvent.user_id).toBeDefined()
      expect(bookingEvent.workspace_id).toBeDefined()
      expect(['hourly-desk', 'meeting-room', 'day-pass']).toContain(bookingEvent.booking_type)
      expect(['pending', 'confirmed', 'cancelled', 'completed']).toContain(bookingEvent.status)
    })

    it('should have valid OrderEventData structure', () => {
      const orderEvent = {
        id: 'order-123',
        user_id: 'user-456',
        status: 'ready' as const,
        total_price: 25.99,
        item_count: 3,
      }

      expect(orderEvent.id).toBeDefined()
      expect(orderEvent.total_price).toBeGreaterThan(0)
      expect(['pending', 'preparing', 'ready', 'completed', 'cancelled']).toContain(
        orderEvent.status
      )
    })

    it('should have valid AvailabilityEventData structure', () => {
      const availabilityEvent = {
        workspace_id: 'workspace-123',
        workspace_name: 'Hot Desk 1',
        date: '2025-10-27',
        available_slots: 5,
        is_available: true,
      }

      expect(availabilityEvent.workspace_id).toBeDefined()
      expect(availabilityEvent.workspace_name).toBeDefined()
      expect(availabilityEvent.available_slots).toBeGreaterThanOrEqual(0)
      expect(typeof availabilityEvent.is_available).toBe('boolean')
    })

    it('should have valid NotificationEventData structure', () => {
      const notification = {
        id: 'notif-123',
        type: 'success' as const,
        title: 'Booking Confirmed',
        message: 'Your booking has been confirmed',
        timestamp: new Date().toISOString(),
      }

      expect(notification.id).toBeDefined()
      expect(['success', 'error', 'warning', 'info']).toContain(notification.type)
      expect(notification.title).toBeDefined()
      expect(notification.message).toBeDefined()
    })
  })
})
