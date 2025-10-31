/**
 * Real-time Hooks
 * Client-side React hooks for subscribing to Pusher events
 *
 * These hooks provide a simple interface for components to receive
 * real-time updates without managing Pusher connections directly.
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Channel } from 'pusher-js'
import { createPusherClient, PUSHER_CHANNELS, PUSHER_EVENTS } from '@/lib/realtime/config'
import type {
  BookingEventData,
  OrderEventData,
  AvailabilityEventData,
  NotificationEventData,
} from '@/lib/realtime/config'

/**
 * Singleton Pusher client instance
 * Shared across all hooks to maintain single connection
 */
let pusherClient: ReturnType<typeof createPusherClient> | null = null

function getPusherClient() {
  if (!pusherClient) {
    try {
      pusherClient = createPusherClient()
    } catch (error) {
      console.error('[Realtime] Failed to initialize Pusher client:', error)
      return null
    }
  }
  return pusherClient
}

/**
 * Hook for subscribing to booking updates for a specific booking
 */
export function useBookingUpdates(bookingId: string | null) {
  const [booking, setBooking] = useState<BookingEventData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<Channel | null>(null)

  useEffect(() => {
    if (!bookingId) return

    const pusher = getPusherClient()
    if (!pusher) return

    const channelName = PUSHER_CHANNELS.BOOKING_UPDATES(bookingId)
    const channel = pusher.subscribe(channelName)

    channelRef.current = channel

    // Handle connection state
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      console.log(`[Realtime] Subscribed to booking updates: ${bookingId}`)
    })

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('[Realtime] Subscription error:', error)
      setIsConnected(false)
    })

    // Listen for booking events
    channel.bind(PUSHER_EVENTS.BOOKING_CONFIRMED, (data: BookingEventData) => {
      setBooking(data)
    })

    channel.bind(PUSHER_EVENTS.BOOKING_CANCELLED, (data: BookingEventData) => {
      setBooking(data)
    })

    channel.bind(PUSHER_EVENTS.BOOKING_CHECKED_IN, (data: BookingEventData) => {
      setBooking(data)
    })

    channel.bind(PUSHER_EVENTS.BOOKING_CHECKED_OUT, (data: BookingEventData) => {
      setBooking(data)
    })

    // Cleanup
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [bookingId])

  return { booking, isConnected }
}

/**
 * Hook for subscribing to order updates for a specific order
 */
export function useOrderUpdates(orderId: string | null) {
  const [order, setOrder] = useState<OrderEventData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<Channel | null>(null)

  useEffect(() => {
    if (!orderId) return

    const pusher = getPusherClient()
    if (!pusher) return

    const channelName = PUSHER_CHANNELS.ORDER_UPDATES(orderId)
    const channel = pusher.subscribe(channelName)

    channelRef.current = channel

    // Handle connection state
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      console.log(`[Realtime] Subscribed to order updates: ${orderId}`)
    })

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('[Realtime] Subscription error:', error)
      setIsConnected(false)
    })

    // Listen for order events
    channel.bind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, (data: OrderEventData) => {
      setOrder(data)
    })

    channel.bind(PUSHER_EVENTS.ORDER_READY, (data: OrderEventData) => {
      setOrder(data)
    })

    channel.bind(PUSHER_EVENTS.ORDER_COMPLETED, (data: OrderEventData) => {
      setOrder(data)
    })

    channel.bind(PUSHER_EVENTS.ORDER_CANCELLED, (data: OrderEventData) => {
      setOrder(data)
    })

    // Cleanup
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [orderId])

  return { order, isConnected }
}

/**
 * Hook for subscribing to workspace availability updates
 */
export function useWorkspaceAvailability() {
  const [availability, setAvailability] = useState<AvailabilityEventData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<Channel | null>(null)

  useEffect(() => {
    const pusher = getPusherClient()
    if (!pusher) return

    const channelName = PUSHER_CHANNELS.WORKSPACE_AVAILABILITY
    const channel = pusher.subscribe(channelName)

    channelRef.current = channel

    // Handle connection state
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      console.log('[Realtime] Subscribed to workspace availability')
    })

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('[Realtime] Subscription error:', error)
      setIsConnected(false)
    })

    // Listen for availability events
    channel.bind(PUSHER_EVENTS.AVAILABILITY_UPDATED, (data: AvailabilityEventData) => {
      setAvailability(data)
    })

    channel.bind(PUSHER_EVENTS.SEAT_OCCUPIED, (data: AvailabilityEventData) => {
      setAvailability(data)
    })

    channel.bind(PUSHER_EVENTS.SEAT_AVAILABLE, (data: AvailabilityEventData) => {
      setAvailability(data)
    })

    // Cleanup
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [])

  return { availability, isConnected }
}

/**
 * Hook for subscribing to user notifications
 */
export function useUserNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationEventData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<Channel | null>(null)

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  useEffect(() => {
    if (!userId) return

    const pusher = getPusherClient()
    if (!pusher) return

    const channelName = PUSHER_CHANNELS.USER_NOTIFICATIONS(userId)
    const channel = pusher.subscribe(channelName)

    channelRef.current = channel

    // Handle connection state
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      console.log(`[Realtime] Subscribed to user notifications: ${userId}`)
    })

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('[Realtime] Subscription error:', error)
      setIsConnected(false)
    })

    // Listen for notification events
    channel.bind(PUSHER_EVENTS.NOTIFICATION, (data: NotificationEventData) => {
      setNotifications(prev => [data, ...prev])
    })

    // Also listen for booking and order events on user channel
    channel.bind(PUSHER_EVENTS.BOOKING_CREATED, (data: BookingEventData) => {
      const notification: NotificationEventData = {
        id: `booking-${data.id}`,
        type: 'success',
        title: 'Booking Created',
        message: `Your booking for ${data.workspace_name} on ${data.booking_date} has been created.`,
        timestamp: new Date().toISOString(),
      }
      setNotifications(prev => [notification, ...prev])
    })

    channel.bind(PUSHER_EVENTS.BOOKING_CONFIRMED, (data: BookingEventData) => {
      const notification: NotificationEventData = {
        id: `booking-confirmed-${data.id}`,
        type: 'success',
        title: 'Booking Confirmed',
        message: `Your booking for ${data.workspace_name} has been confirmed.`,
        timestamp: new Date().toISOString(),
      }
      setNotifications(prev => [notification, ...prev])
    })

    channel.bind(PUSHER_EVENTS.ORDER_READY, (data: OrderEventData) => {
      const notification: NotificationEventData = {
        id: `order-ready-${data.id}`,
        type: 'info',
        title: 'Order Ready',
        message: 'Your order is ready for pickup at the cafe!',
        timestamp: new Date().toISOString(),
      }
      setNotifications(prev => [notification, ...prev])
    })

    // Cleanup
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [userId])

  return {
    notifications,
    isConnected,
    clearNotification,
    clearAllNotifications,
  }
}

/**
 * Hook for staff to monitor all orders in real-time
 */
export function useStaffOrders() {
  const [orders, setOrders] = useState<OrderEventData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<Channel | null>(null)

  const updateOrder = useCallback((updatedOrder: OrderEventData) => {
    setOrders(prev => {
      const index = prev.findIndex(o => o.id === updatedOrder.id)
      if (index >= 0) {
        const newOrders = [...prev]
        newOrders[index] = updatedOrder
        return newOrders
      }
      return [updatedOrder, ...prev]
    })
  }, [])

  const removeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }, [])

  useEffect(() => {
    const pusher = getPusherClient()
    if (!pusher) return

    const channelName = PUSHER_CHANNELS.STAFF_ORDERS
    const channel = pusher.subscribe(channelName)

    channelRef.current = channel

    // Handle connection state
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      console.log('[Realtime] Subscribed to staff orders')
    })

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('[Realtime] Subscription error:', error)
      setIsConnected(false)
    })

    // Listen for order events
    channel.bind(PUSHER_EVENTS.ORDER_CREATED, (data: OrderEventData) => {
      updateOrder(data)
    })

    channel.bind(PUSHER_EVENTS.ORDER_STATUS_CHANGED, (data: OrderEventData) => {
      updateOrder(data)
    })

    channel.bind(PUSHER_EVENTS.ORDER_COMPLETED, (data: OrderEventData) => {
      // Keep completed orders for a while before removing
      updateOrder(data)
      setTimeout(() => {
        removeOrder(data.id)
      }, 30000) // Remove after 30 seconds
    })

    channel.bind(PUSHER_EVENTS.ORDER_CANCELLED, (data: OrderEventData) => {
      removeOrder(data.id)
    })

    // Cleanup
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [updateOrder, removeOrder])

  return { orders, isConnected }
}

/**
 * Hook to get Pusher connection state
 */
export function usePusherConnection() {
  const [state, setState] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>(
    'connecting'
  )

  useEffect(() => {
    const pusher = getPusherClient()
    if (!pusher) {
      setState('failed')
      return
    }

    const updateState = () => {
      setState(pusher.connection.state as any)
    }

    pusher.connection.bind('state_change', updateState)
    updateState()

    return () => {
      pusher.connection.unbind('state_change', updateState)
    }
  }, [])

  return { state, isConnected: state === 'connected' }
}
