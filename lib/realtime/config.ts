/**
 * Pusher Configuration
 * Server-side and client-side Pusher setup for real-time features
 *
 * Environment Variables Required:
 * - PUSHER_APP_ID: Your Pusher app ID
 * - PUSHER_KEY: Your Pusher key (public, used by client)
 * - PUSHER_SECRET: Your Pusher secret (private, server-only)
 * - PUSHER_CLUSTER: Your Pusher cluster (e.g., 'us2', 'eu')
 * - NEXT_PUBLIC_PUSHER_KEY: Public key for client-side
 * - NEXT_PUBLIC_PUSHER_CLUSTER: Public cluster for client-side
 */

import Pusher from 'pusher'
import PusherClient from 'pusher-js'

/**
 * Server-side Pusher instance (for triggering events)
 * Only import this in API routes or server components
 */
let pusherServerInstance: Pusher | null = null

export function getPusherServer(): Pusher {
  if (!pusherServerInstance) {
    const appId = process.env.PUSHER_APP_ID
    const key = process.env.PUSHER_KEY
    const secret = process.env.PUSHER_SECRET
    const cluster = process.env.PUSHER_CLUSTER || 'us2'

    if (!appId || !key || !secret) {
      throw new Error(
        'Missing Pusher configuration. Please set PUSHER_APP_ID, PUSHER_KEY, and PUSHER_SECRET environment variables.'
      )
    }

    pusherServerInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    })
  }

  return pusherServerInstance
}

/**
 * Client-side Pusher configuration
 * Use this in client components via hooks
 */
export function createPusherClient(): PusherClient {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2'

  if (!key) {
    throw new Error(
      'Missing Pusher client configuration. Please set NEXT_PUBLIC_PUSHER_KEY environment variable.'
    )
  }

  return new PusherClient(key, {
    cluster,
    forceTLS: true,
  })
}

/**
 * Pusher channel names
 * Centralized channel naming for consistency
 */
export const PUSHER_CHANNELS = {
  // Public channels (no auth required)
  WORKSPACE_AVAILABILITY: 'workspace-availability',

  // Private channels (require auth)
  USER_NOTIFICATIONS: (userId: string) => `private-user-${userId}`,
  BOOKING_UPDATES: (bookingId: string) => `private-booking-${bookingId}`,
  ORDER_UPDATES: (orderId: string) => `private-order-${orderId}`,

  // Presence channels (for real-time user tracking)
  ADMIN_DASHBOARD: 'presence-admin-dashboard',
  STAFF_ORDERS: 'presence-staff-orders',
} as const

/**
 * Pusher event names
 * Centralized event naming for consistency
 */
export const PUSHER_EVENTS = {
  // Booking events
  BOOKING_CREATED: 'booking:created',
  BOOKING_CONFIRMED: 'booking:confirmed',
  BOOKING_CANCELLED: 'booking:cancelled',
  BOOKING_CHECKED_IN: 'booking:checked-in',
  BOOKING_CHECKED_OUT: 'booking:checked-out',

  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_CHANGED: 'order:status-changed',
  ORDER_READY: 'order:ready',
  ORDER_COMPLETED: 'order:completed',
  ORDER_CANCELLED: 'order:cancelled',

  // Workspace availability events
  AVAILABILITY_UPDATED: 'availability:updated',
  SEAT_OCCUPIED: 'seat:occupied',
  SEAT_AVAILABLE: 'seat:available',

  // General notifications
  NOTIFICATION: 'notification',
} as const

/**
 * Type definitions for Pusher events
 */
export interface BookingEventData {
  id: string
  user_id: string
  workspace_id: string
  booking_type: 'hourly-desk' | 'meeting-room' | 'day-pass'
  booking_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  workspace_name?: string
}

export interface OrderEventData {
  id: string
  user_id?: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_price: number
  item_count?: number
}

export interface AvailabilityEventData {
  workspace_id: string
  workspace_name: string
  date: string
  available_slots: number
  is_available: boolean
}

export interface NotificationEventData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
}

/**
 * Helper function to validate Pusher configuration
 */
export function validatePusherConfig(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Server-side validation
  if (typeof window === 'undefined') {
    if (!process.env.PUSHER_APP_ID) {
      errors.push('PUSHER_APP_ID is not set')
    }
    if (!process.env.PUSHER_KEY) {
      errors.push('PUSHER_KEY is not set')
    }
    if (!process.env.PUSHER_SECRET) {
      errors.push('PUSHER_SECRET is not set')
    }
    // Also check client variables in Node (for testing)
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      errors.push('NEXT_PUBLIC_PUSHER_KEY is not set')
    }
  }

  // Client-side validation (browser only)
  if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      errors.push('NEXT_PUBLIC_PUSHER_KEY is not set')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
