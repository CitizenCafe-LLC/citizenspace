/**
 * Real-time Module Index
 * Centralized export for all real-time functionality
 */

// Configuration
export {
  getPusherServer,
  createPusherClient,
  PUSHER_CHANNELS,
  PUSHER_EVENTS,
  validatePusherConfig,
} from './config'

export type {
  BookingEventData,
  OrderEventData,
  AvailabilityEventData,
  NotificationEventData,
} from './config'

// Event emitters (server-side)
export { realtimeEvents, bookingEvents, orderEvents, availabilityEvents, notificationEvents } from './events'

// Services (server-side with real-time)
export * from './booking-service'
export * from './order-service'

// Client hooks (client-side)
export {
  useBookingUpdates,
  useOrderUpdates,
  useWorkspaceAvailability,
  useUserNotifications,
  useStaffOrders,
  usePusherConnection,
} from '@/lib/hooks/useRealtime'
