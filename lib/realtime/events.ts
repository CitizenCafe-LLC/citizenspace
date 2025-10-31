/**
 * Real-time Event Emitters
 * Server-side utilities for broadcasting real-time events via Pusher
 *
 * This module provides type-safe methods for triggering Pusher events
 * across different channels for bookings, orders, and availability updates.
 */

import { getPusherServer, PUSHER_CHANNELS, PUSHER_EVENTS } from './config'
import type {
  BookingEventData,
  OrderEventData,
  AvailabilityEventData,
  NotificationEventData,
} from './config'

/**
 * Base class for real-time event broadcasting
 * Handles error logging and connection management
 */
class RealtimeEmitter {
  /**
   * Trigger a Pusher event on a specific channel
   */
  protected async trigger(
    channel: string,
    event: string,
    data: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const pusher = getPusherServer()

      await pusher.trigger(channel, event, data)

      console.log(`[Realtime] Event triggered: ${event} on ${channel}`)

      return { success: true }
    } catch (error) {
      console.error(`[Realtime] Failed to trigger event ${event}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Trigger events on multiple channels
   */
  protected async triggerMultiple(
    channels: string[],
    event: string,
    data: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const pusher = getPusherServer()

      await pusher.trigger(channels, event, data)

      console.log(`[Realtime] Event triggered: ${event} on ${channels.length} channels`)

      return { success: true }
    } catch (error) {
      console.error(`[Realtime] Failed to trigger multi-channel event ${event}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

/**
 * Booking Event Emitter
 * Broadcasts booking-related events to relevant channels
 */
class BookingEmitter extends RealtimeEmitter {
  /**
   * Broadcast booking creation event
   */
  async bookingCreated(booking: BookingEventData) {
    const channels = [
      PUSHER_CHANNELS.USER_NOTIFICATIONS(booking.user_id),
      PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
    ]

    return this.triggerMultiple(channels, PUSHER_EVENTS.BOOKING_CREATED, {
      ...booking,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast booking confirmation event
   */
  async bookingConfirmed(booking: BookingEventData) {
    const channels = [
      PUSHER_CHANNELS.USER_NOTIFICATIONS(booking.user_id),
      PUSHER_CHANNELS.BOOKING_UPDATES(booking.id),
    ]

    return this.triggerMultiple(channels, PUSHER_EVENTS.BOOKING_CONFIRMED, {
      ...booking,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast booking cancellation event
   */
  async bookingCancelled(booking: BookingEventData) {
    const channels = [
      PUSHER_CHANNELS.USER_NOTIFICATIONS(booking.user_id),
      PUSHER_CHANNELS.BOOKING_UPDATES(booking.id),
      PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
    ]

    return this.triggerMultiple(channels, PUSHER_EVENTS.BOOKING_CANCELLED, {
      ...booking,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast check-in event
   */
  async bookingCheckedIn(booking: BookingEventData) {
    const channels = [
      PUSHER_CHANNELS.USER_NOTIFICATIONS(booking.user_id),
      PUSHER_CHANNELS.BOOKING_UPDATES(booking.id),
      PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
    ]

    return this.triggerMultiple(channels, PUSHER_EVENTS.BOOKING_CHECKED_IN, {
      ...booking,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast check-out event
   */
  async bookingCheckedOut(booking: BookingEventData) {
    const channels = [
      PUSHER_CHANNELS.USER_NOTIFICATIONS(booking.user_id),
      PUSHER_CHANNELS.BOOKING_UPDATES(booking.id),
      PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
    ]

    return this.triggerMultiple(channels, PUSHER_EVENTS.BOOKING_CHECKED_OUT, {
      ...booking,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Order Event Emitter
 * Broadcasts order-related events to customers and staff
 */
class OrderEmitter extends RealtimeEmitter {
  /**
   * Broadcast new order event (to staff)
   */
  async orderCreated(order: OrderEventData) {
    const channels = [PUSHER_CHANNELS.STAFF_ORDERS]

    // Also notify user if they have an account
    if (order.user_id) {
      channels.push(PUSHER_CHANNELS.USER_NOTIFICATIONS(order.user_id))
    }

    return this.triggerMultiple(channels, PUSHER_EVENTS.ORDER_CREATED, {
      ...order,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast order status change
   */
  async orderStatusChanged(order: OrderEventData) {
    const channels = [
      PUSHER_CHANNELS.ORDER_UPDATES(order.id),
      PUSHER_CHANNELS.STAFF_ORDERS,
    ]

    if (order.user_id) {
      channels.push(PUSHER_CHANNELS.USER_NOTIFICATIONS(order.user_id))
    }

    return this.triggerMultiple(channels, PUSHER_EVENTS.ORDER_STATUS_CHANGED, {
      ...order,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast order ready notification
   */
  async orderReady(order: OrderEventData) {
    const channels = [PUSHER_CHANNELS.ORDER_UPDATES(order.id)]

    if (order.user_id) {
      channels.push(PUSHER_CHANNELS.USER_NOTIFICATIONS(order.user_id))
    }

    return this.triggerMultiple(channels, PUSHER_EVENTS.ORDER_READY, {
      ...order,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast order completion
   */
  async orderCompleted(order: OrderEventData) {
    const channels = [
      PUSHER_CHANNELS.ORDER_UPDATES(order.id),
      PUSHER_CHANNELS.STAFF_ORDERS,
    ]

    if (order.user_id) {
      channels.push(PUSHER_CHANNELS.USER_NOTIFICATIONS(order.user_id))
    }

    return this.triggerMultiple(channels, PUSHER_EVENTS.ORDER_COMPLETED, {
      ...order,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast order cancellation
   */
  async orderCancelled(order: OrderEventData) {
    const channels = [
      PUSHER_CHANNELS.ORDER_UPDATES(order.id),
      PUSHER_CHANNELS.STAFF_ORDERS,
    ]

    if (order.user_id) {
      channels.push(PUSHER_CHANNELS.USER_NOTIFICATIONS(order.user_id))
    }

    return this.triggerMultiple(channels, PUSHER_EVENTS.ORDER_CANCELLED, {
      ...order,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Availability Event Emitter
 * Broadcasts workspace availability changes
 */
class AvailabilityEmitter extends RealtimeEmitter {
  /**
   * Broadcast availability update
   */
  async availabilityUpdated(availability: AvailabilityEventData) {
    return this.trigger(
      PUSHER_CHANNELS.WORKSPACE_AVAILABILITY,
      PUSHER_EVENTS.AVAILABILITY_UPDATED,
      {
        ...availability,
        timestamp: new Date().toISOString(),
      }
    )
  }

  /**
   * Broadcast seat occupied event
   */
  async seatOccupied(workspaceId: string, workspaceName: string, date: string) {
    return this.trigger(PUSHER_CHANNELS.WORKSPACE_AVAILABILITY, PUSHER_EVENTS.SEAT_OCCUPIED, {
      workspace_id: workspaceId,
      workspace_name: workspaceName,
      date,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Broadcast seat available event
   */
  async seatAvailable(workspaceId: string, workspaceName: string, date: string) {
    return this.trigger(PUSHER_CHANNELS.WORKSPACE_AVAILABILITY, PUSHER_EVENTS.SEAT_AVAILABLE, {
      workspace_id: workspaceId,
      workspace_name: workspaceName,
      date,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Notification Emitter
 * Sends general notifications to users
 */
class NotificationEmitter extends RealtimeEmitter {
  /**
   * Send notification to a specific user
   */
  async sendNotification(userId: string, notification: NotificationEventData) {
    return this.trigger(
      PUSHER_CHANNELS.USER_NOTIFICATIONS(userId),
      PUSHER_EVENTS.NOTIFICATION,
      notification
    )
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToMultipleUsers(userIds: string[], notification: NotificationEventData) {
    const channels = userIds.map(userId => PUSHER_CHANNELS.USER_NOTIFICATIONS(userId))
    return this.triggerMultiple(channels, PUSHER_EVENTS.NOTIFICATION, notification)
  }
}

/**
 * Export singleton instances
 */
export const bookingEvents = new BookingEmitter()
export const orderEvents = new OrderEmitter()
export const availabilityEvents = new AvailabilityEmitter()
export const notificationEvents = new NotificationEmitter()

/**
 * Convenience function to emit all event types
 */
export const realtimeEvents = {
  booking: bookingEvents,
  order: orderEvents,
  availability: availabilityEvents,
  notification: notificationEvents,
}
