/**
 * Tests for Real-time Hooks
 * Validates client-side real-time subscriptions
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useBookingUpdates,
  useOrderUpdates,
  useWorkspaceAvailability,
  useUserNotifications,
  useStaffOrders,
  usePusherConnection,
} from '@/lib/hooks/useRealtime'
import { PUSHER_EVENTS } from '@/lib/realtime/config'

// Mock Pusher client
const mockChannel = {
  bind: jest.fn(),
  unbind: jest.fn(),
  unbind_all: jest.fn(),
}

const mockPusher = {
  subscribe: jest.fn(() => mockChannel),
  unsubscribe: jest.fn(),
  connection: {
    state: 'connected',
    bind: jest.fn(),
    unbind: jest.fn(),
  },
}

jest.mock('@/lib/realtime/config', () => ({
  ...jest.requireActual('@/lib/realtime/config'),
  createPusherClient: jest.fn(() => mockPusher),
}))

describe('Real-time Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useBookingUpdates', () => {
    it('should subscribe to booking updates channel', () => {
      const bookingId = 'booking-123'

      renderHook(() => useBookingUpdates(bookingId))

      expect(mockPusher.subscribe).toHaveBeenCalledWith(`private-booking-${bookingId}`)
      expect(mockChannel.bind).toHaveBeenCalledWith(
        'pusher:subscription_succeeded',
        expect.any(Function)
      )
    })

    it('should not subscribe if bookingId is null', () => {
      renderHook(() => useBookingUpdates(null))

      expect(mockPusher.subscribe).not.toHaveBeenCalled()
    })

    it('should handle booking confirmed event', async () => {
      const bookingId = 'booking-123'
      const bookingData = {
        id: bookingId,
        user_id: 'user-456',
        workspace_id: 'workspace-789',
        booking_type: 'meeting-room' as const,
        booking_date: '2025-10-27',
        start_time: '09:00',
        end_time: '10:00',
        status: 'confirmed' as const,
      }

      const { result } = renderHook(() => useBookingUpdates(bookingId))

      // Simulate subscription success
      const successCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === 'pusher:subscription_succeeded'
      )?.[1]
      act(() => {
        successCallback?.()
      })

      expect(result.current.isConnected).toBe(true)

      // Simulate booking confirmed event
      const confirmedCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.BOOKING_CONFIRMED
      )?.[1]

      act(() => {
        confirmedCallback?.(bookingData)
      })

      await waitFor(() => {
        expect(result.current.booking).toEqual(bookingData)
      })
    })

    it('should cleanup on unmount', () => {
      const bookingId = 'booking-123'

      const { unmount } = renderHook(() => useBookingUpdates(bookingId))

      unmount()

      expect(mockChannel.unbind_all).toHaveBeenCalled()
      expect(mockPusher.unsubscribe).toHaveBeenCalledWith(`private-booking-${bookingId}`)
    })
  })

  describe('useOrderUpdates', () => {
    it('should subscribe to order updates channel', () => {
      const orderId = 'order-123'

      renderHook(() => useOrderUpdates(orderId))

      expect(mockPusher.subscribe).toHaveBeenCalledWith(`private-order-${orderId}`)
    })

    it('should handle order ready event', async () => {
      const orderId = 'order-123'
      const orderData = {
        id: orderId,
        user_id: 'user-456',
        status: 'ready' as const,
        total_price: 25.99,
      }

      const { result } = renderHook(() => useOrderUpdates(orderId))

      // Simulate order ready event
      const readyCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.ORDER_READY
      )?.[1]

      act(() => {
        readyCallback?.(orderData)
      })

      await waitFor(() => {
        expect(result.current.order).toEqual(orderData)
      })
    })

    it('should handle order status changed event', async () => {
      const orderId = 'order-123'
      const orderData = {
        id: orderId,
        status: 'preparing' as const,
        total_price: 25.99,
      }

      const { result } = renderHook(() => useOrderUpdates(orderId))

      const statusCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.ORDER_STATUS_CHANGED
      )?.[1]

      act(() => {
        statusCallback?.(orderData)
      })

      await waitFor(() => {
        expect(result.current.order).toEqual(orderData)
      })
    })
  })

  describe('useWorkspaceAvailability', () => {
    it('should subscribe to workspace availability channel', () => {
      renderHook(() => useWorkspaceAvailability())

      expect(mockPusher.subscribe).toHaveBeenCalledWith('workspace-availability')
    })

    it('should handle availability updated event', async () => {
      const availabilityData = {
        workspace_id: 'workspace-123',
        workspace_name: 'Hot Desk 1',
        date: '2025-10-27',
        available_slots: 5,
        is_available: true,
      }

      const { result } = renderHook(() => useWorkspaceAvailability())

      const availabilityCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.AVAILABILITY_UPDATED
      )?.[1]

      act(() => {
        availabilityCallback?.(availabilityData)
      })

      await waitFor(() => {
        expect(result.current.availability).toEqual(availabilityData)
      })
    })

    it('should handle seat occupied event', async () => {
      const seatData = {
        workspace_id: 'workspace-123',
        workspace_name: 'Hot Desk 1',
        date: '2025-10-27',
        available_slots: 4,
        is_available: true,
      }

      const { result } = renderHook(() => useWorkspaceAvailability())

      const occupiedCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.SEAT_OCCUPIED
      )?.[1]

      act(() => {
        occupiedCallback?.(seatData)
      })

      await waitFor(() => {
        expect(result.current.availability).toBeDefined()
      })
    })
  })

  describe('useUserNotifications', () => {
    it('should subscribe to user notifications channel', () => {
      const userId = 'user-456'

      renderHook(() => useUserNotifications(userId))

      expect(mockPusher.subscribe).toHaveBeenCalledWith(`private-user-${userId}`)
    })

    it('should handle notification event', async () => {
      const userId = 'user-456'
      const notification = {
        id: 'notif-123',
        type: 'success' as const,
        title: 'Success',
        message: 'Operation completed',
        timestamp: new Date().toISOString(),
      }

      const { result } = renderHook(() => useUserNotifications(userId))

      const notifCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.NOTIFICATION
      )?.[1]

      act(() => {
        notifCallback?.(notification)
      })

      await waitFor(() => {
        expect(result.current.notifications).toContainEqual(notification)
      })
    })

    it('should clear specific notification', async () => {
      const userId = 'user-456'
      const notification = {
        id: 'notif-123',
        type: 'success' as const,
        title: 'Success',
        message: 'Operation completed',
        timestamp: new Date().toISOString(),
      }

      const { result } = renderHook(() => useUserNotifications(userId))

      const notifCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.NOTIFICATION
      )?.[1]

      act(() => {
        notifCallback?.(notification)
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1)
      })

      act(() => {
        result.current.clearNotification('notif-123')
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(0)
      })
    })

    it('should clear all notifications', async () => {
      const userId = 'user-456'

      const { result } = renderHook(() => useUserNotifications(userId))

      const notifCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.NOTIFICATION
      )?.[1]

      act(() => {
        notifCallback?.({
          id: 'notif-1',
          type: 'success',
          title: 'Test',
          message: 'Test',
          timestamp: new Date().toISOString(),
        })
        notifCallback?.({
          id: 'notif-2',
          type: 'info',
          title: 'Test 2',
          message: 'Test 2',
          timestamp: new Date().toISOString(),
        })
      })

      await waitFor(() => {
        expect(result.current.notifications.length).toBeGreaterThan(0)
      })

      act(() => {
        result.current.clearAllNotifications()
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(0)
      })
    })

    it('should create notification from booking created event', async () => {
      const userId = 'user-456'
      const bookingData = {
        id: 'booking-123',
        user_id: userId,
        workspace_id: 'workspace-789',
        booking_type: 'meeting-room' as const,
        booking_date: '2025-10-27',
        start_time: '09:00',
        end_time: '10:00',
        status: 'confirmed' as const,
        workspace_name: 'Conference Room A',
      }

      const { result } = renderHook(() => useUserNotifications(userId))

      const bookingCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.BOOKING_CREATED
      )?.[1]

      act(() => {
        bookingCallback?.(bookingData)
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1)
        expect(result.current.notifications[0].title).toBe('Booking Created')
      })
    })
  })

  describe('useStaffOrders', () => {
    it('should subscribe to staff orders channel', () => {
      renderHook(() => useStaffOrders())

      expect(mockPusher.subscribe).toHaveBeenCalledWith('presence-staff-orders')
    })

    it('should add new orders to the list', async () => {
      const orderData = {
        id: 'order-123',
        status: 'pending' as const,
        total_price: 25.99,
        item_count: 3,
      }

      const { result } = renderHook(() => useStaffOrders())

      const orderCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.ORDER_CREATED
      )?.[1]

      act(() => {
        orderCallback?.(orderData)
      })

      await waitFor(() => {
        expect(result.current.orders).toContainEqual(orderData)
      })
    })

    it('should update existing orders', async () => {
      const initialOrder = {
        id: 'order-123',
        status: 'pending' as const,
        total_price: 25.99,
      }

      const updatedOrder = {
        id: 'order-123',
        status: 'preparing' as const,
        total_price: 25.99,
      }

      const { result } = renderHook(() => useStaffOrders())

      const createdCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.ORDER_CREATED
      )?.[1]

      act(() => {
        createdCallback?.(initialOrder)
      })

      await waitFor(() => {
        expect(result.current.orders).toHaveLength(1)
      })

      const statusCallback = mockChannel.bind.mock.calls.find(
        call => call[0] === PUSHER_EVENTS.ORDER_STATUS_CHANGED
      )?.[1]

      act(() => {
        statusCallback?.(updatedOrder)
      })

      await waitFor(() => {
        expect(result.current.orders[0].status).toBe('preparing')
      })
    })
  })

  describe('usePusherConnection', () => {
    it('should return connection state', () => {
      const { result } = renderHook(() => usePusherConnection())

      expect(result.current.state).toBe('connected')
      expect(result.current.isConnected).toBe(true)
    })

    it('should update state on connection change', async () => {
      const { result } = renderHook(() => usePusherConnection())

      const stateChangeCallback = mockPusher.connection.bind.mock.calls.find(
        call => call[0] === 'state_change'
      )?.[1]

      act(() => {
        mockPusher.connection.state = 'disconnected'
        stateChangeCallback?.()
      })

      await waitFor(() => {
        expect(result.current.state).toBe('disconnected')
        expect(result.current.isConnected).toBe(false)
      })
    })
  })
})
