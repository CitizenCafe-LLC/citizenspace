/**
 * Tests for Real-time Event Emitters
 * Validates server-side event broadcasting
 */

import { bookingEvents, orderEvents, availabilityEvents, notificationEvents } from '@/lib/realtime/events'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/realtime/config'
import type {
  BookingEventData,
  OrderEventData,
  AvailabilityEventData,
  NotificationEventData,
} from '@/lib/realtime/config'

// Mock Pusher
jest.mock('@/lib/realtime/config', () => {
  const mockTrigger = jest.fn().mockResolvedValue(true)

  return {
    ...jest.requireActual('@/lib/realtime/config'),
    getPusherServer: jest.fn(() => ({
      trigger: mockTrigger,
    })),
  }
})

describe('Real-time Event Emitters', () => {
  let mockPusher: any

  beforeEach(() => {
    jest.clearAllMocks()
    const { getPusherServer } = require('@/lib/realtime/config')
    mockPusher = getPusherServer()
  })

  describe('BookingEmitter', () => {
    const mockBooking: BookingEventData = {
      id: 'booking-123',
      user_id: 'user-456',
      workspace_id: 'workspace-789',
      booking_type: 'meeting-room',
      booking_date: '2025-10-27',
      start_time: '09:00',
      end_time: '10:00',
      status: 'confirmed',
      workspace_name: 'Conference Room A',
    }

    it('should broadcast booking created event', async () => {
      const result = await bookingEvents.bookingCreated(mockBooking)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        [
          PUSHER_CHANNELS.USER_NOTIFICATIONS(mockBooking.user_id),
          PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
        ],
        PUSHER_EVENTS.BOOKING_CREATED,
        expect.objectContaining({
          ...mockBooking,
          timestamp: expect.any(String),
        })
      )
    })

    it('should broadcast booking confirmed event', async () => {
      const result = await bookingEvents.bookingConfirmed(mockBooking)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        [
          PUSHER_CHANNELS.USER_NOTIFICATIONS(mockBooking.user_id),
          PUSHER_CHANNELS.BOOKING_UPDATES(mockBooking.id),
        ],
        PUSHER_EVENTS.BOOKING_CONFIRMED,
        expect.objectContaining(mockBooking)
      )
    })

    it('should broadcast booking cancelled event', async () => {
      const cancelledBooking = { ...mockBooking, status: 'cancelled' as const }
      const result = await bookingEvents.bookingCancelled(cancelledBooking)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        [
          PUSHER_CHANNELS.USER_NOTIFICATIONS(mockBooking.user_id),
          PUSHER_CHANNELS.BOOKING_UPDATES(mockBooking.id),
          PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
        ],
        PUSHER_EVENTS.BOOKING_CANCELLED,
        expect.objectContaining(cancelledBooking)
      )
    })

    it('should broadcast booking check-in event', async () => {
      const result = await bookingEvents.bookingCheckedIn(mockBooking)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        expect.any(Array),
        PUSHER_EVENTS.BOOKING_CHECKED_IN,
        expect.objectContaining(mockBooking)
      )
    })

    it('should broadcast booking check-out event', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const }
      const result = await bookingEvents.bookingCheckedOut(completedBooking)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        expect.any(Array),
        PUSHER_EVENTS.BOOKING_CHECKED_OUT,
        expect.objectContaining(completedBooking)
      )
    })

    it('should include timestamp in all events', async () => {
      await bookingEvents.bookingCreated(mockBooking)

      const callArgs = mockPusher.trigger.mock.calls[0]
      const eventData = callArgs[2]

      expect(eventData.timestamp).toBeDefined()
      expect(new Date(eventData.timestamp).getTime()).toBeGreaterThan(0)
    })
  })

  describe('OrderEmitter', () => {
    const mockOrder: OrderEventData = {
      id: 'order-123',
      user_id: 'user-456',
      status: 'pending',
      total_price: 25.99,
      item_count: 3,
    }

    it('should broadcast order created event to staff', async () => {
      const result = await orderEvents.orderCreated(mockOrder)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        expect.arrayContaining([PUSHER_CHANNELS.STAFF_ORDERS]),
        PUSHER_EVENTS.ORDER_CREATED,
        expect.objectContaining(mockOrder)
      )
    })

    it('should broadcast order created event to user if user_id exists', async () => {
      const result = await orderEvents.orderCreated(mockOrder)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        expect.arrayContaining([PUSHER_CHANNELS.USER_NOTIFICATIONS(mockOrder.user_id!)]),
        PUSHER_EVENTS.ORDER_CREATED,
        expect.objectContaining(mockOrder)
      )
    })

    it('should not broadcast to user channel if no user_id', async () => {
      const guestOrder = { ...mockOrder, user_id: undefined }
      await orderEvents.orderCreated(guestOrder)

      const callArgs = mockPusher.trigger.mock.calls[0]
      const channels = callArgs[0]

      expect(channels).not.toContain(expect.stringContaining('private-user'))
    })

    it('should broadcast order status changed event', async () => {
      const updatedOrder = { ...mockOrder, status: 'preparing' as const }
      const result = await orderEvents.orderStatusChanged(updatedOrder)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        expect.any(Array),
        PUSHER_EVENTS.ORDER_STATUS_CHANGED,
        expect.objectContaining(updatedOrder)
      )
    })

    it('should broadcast order ready event', async () => {
      const readyOrder = { ...mockOrder, status: 'ready' as const }
      const result = await orderEvents.orderReady(readyOrder)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        expect.arrayContaining([PUSHER_CHANNELS.ORDER_UPDATES(mockOrder.id)]),
        PUSHER_EVENTS.ORDER_READY,
        expect.objectContaining(readyOrder)
      )
    })

    it('should broadcast order completed event', async () => {
      const completedOrder = { ...mockOrder, status: 'completed' as const }
      const result = await orderEvents.orderCompleted(completedOrder)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        expect.any(Array),
        PUSHER_EVENTS.ORDER_COMPLETED,
        expect.objectContaining(completedOrder)
      )
    })

    it('should broadcast order cancelled event', async () => {
      const cancelledOrder = { ...mockOrder, status: 'cancelled' as const }
      const result = await orderEvents.orderCancelled(cancelledOrder)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        expect.any(Array),
        PUSHER_EVENTS.ORDER_CANCELLED,
        expect.objectContaining(cancelledOrder)
      )
    })
  })

  describe('AvailabilityEmitter', () => {
    const mockAvailability: AvailabilityEventData = {
      workspace_id: 'workspace-123',
      workspace_name: 'Hot Desk 1',
      date: '2025-10-27',
      available_slots: 5,
      is_available: true,
    }

    it('should broadcast availability updated event', async () => {
      const result = await availabilityEvents.availabilityUpdated(mockAvailability)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
        PUSHER_EVENTS.AVAILABILITY_UPDATED,
        expect.objectContaining(mockAvailability)
      )
    })

    it('should broadcast seat occupied event', async () => {
      const result = await availabilityEvents.seatOccupied(
        mockAvailability.workspace_id,
        mockAvailability.workspace_name,
        mockAvailability.date
      )

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
        PUSHER_EVENTS.SEAT_OCCUPIED,
        expect.objectContaining({
          workspace_id: mockAvailability.workspace_id,
          workspace_name: mockAvailability.workspace_name,
          date: mockAvailability.date,
        })
      )
    })

    it('should broadcast seat available event', async () => {
      const result = await availabilityEvents.seatAvailable(
        mockAvailability.workspace_id,
        mockAvailability.workspace_name,
        mockAvailability.date
      )

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
        PUSHER_EVENTS.SEAT_AVAILABLE,
        expect.objectContaining({
          workspace_id: mockAvailability.workspace_id,
          workspace_name: mockAvailability.workspace_name,
        })
      )
    })
  })

  describe('NotificationEmitter', () => {
    const mockNotification: NotificationEventData = {
      id: 'notif-123',
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully',
      timestamp: new Date().toISOString(),
    }

    it('should send notification to a specific user', async () => {
      const userId = 'user-789'
      const result = await notificationEvents.sendNotification(userId, mockNotification)

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        PUSHER_CHANNELS.USER_NOTIFICATIONS(userId),
        PUSHER_EVENTS.NOTIFICATION,
        mockNotification
      )
    })

    it('should send notification to multiple users', async () => {
      const userIds = ['user-1', 'user-2', 'user-3']
      const result = await notificationEvents.sendNotificationToMultipleUsers(
        userIds,
        mockNotification
      )

      expect(result.success).toBe(true)
      expect(mockPusher.trigger).toHaveBeenCalledWith(
        userIds.map(id => PUSHER_CHANNELS.USER_NOTIFICATIONS(id)),
        PUSHER_EVENTS.NOTIFICATION,
        mockNotification
      )
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockPusher.trigger.mockRejectedValue(new Error('Network error'))
    })

    it('should handle errors gracefully in booking events', async () => {
      const mockBooking: BookingEventData = {
        id: 'booking-123',
        user_id: 'user-456',
        workspace_id: 'workspace-789',
        booking_type: 'meeting-room',
        booking_date: '2025-10-27',
        start_time: '09:00',
        end_time: '10:00',
        status: 'confirmed',
      }

      const result = await bookingEvents.bookingCreated(mockBooking)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle errors gracefully in order events', async () => {
      const mockOrder: OrderEventData = {
        id: 'order-123',
        status: 'pending',
        total_price: 25.99,
      }

      const result = await orderEvents.orderCreated(mockOrder)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
