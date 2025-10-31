/**
 * Real-time Event Types and Payloads
 * Defines all events broadcast through Pusher/Socket.io
 */

// Event Types
export type RealtimeEventType =
  | 'booking:created'
  | 'booking:updated'
  | 'booking:cancelled'
  | 'booking:checked-in'
  | 'booking:checked-out'
  | 'order:created'
  | 'order:status-changed'
  | 'order:ready'
  | 'availability:changed'
  | 'workspace:occupied'
  | 'workspace:freed';

// Channel Names
export const CHANNELS = {
  BOOKINGS: 'bookings',
  ORDERS: 'orders',
  AVAILABILITY: 'availability',
  USER_PREFIX: 'private-user-',
  ADMIN: 'private-admin',
} as const;

// Event Payloads
export interface BookingCreatedPayload {
  bookingId: string;
  workspaceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  type: 'hot_desk' | 'meeting_room';
}

export interface BookingUpdatedPayload {
  bookingId: string;
  workspaceId: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  updatedAt: string;
}

export interface BookingCancelledPayload {
  bookingId: string;
  workspaceId: string;
  userId: string;
  cancelledAt: string;
}

export interface BookingCheckedInPayload {
  bookingId: string;
  workspaceId: string;
  userId: string;
  checkedInAt: string;
}

export interface BookingCheckedOutPayload {
  bookingId: string;
  workspaceId: string;
  userId: string;
  checkedOutAt: string;
  actualEndTime: string;
}

export interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  status: 'pending';
  itemCount: number;
  total: number;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  userId: string;
  oldStatus: string;
  newStatus: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  updatedAt: string;
}

export interface OrderReadyPayload {
  orderId: string;
  userId: string;
  orderNumber: string;
  readyAt: string;
}

export interface AvailabilityChangedPayload {
  workspaceId: string;
  available: boolean;
  capacity?: number;
  occupied?: number;
  nextAvailableTime?: string;
}

export interface WorkspaceOccupiedPayload {
  workspaceId: string;
  bookingId: string;
  occupiedUntil: string;
}

export interface WorkspaceFreedPayload {
  workspaceId: string;
  freedAt: string;
  nextBooking?: {
    bookingId: string;
    startTime: string;
  };
}

// Union type for all payloads
export type RealtimeEventPayload =
  | BookingCreatedPayload
  | BookingUpdatedPayload
  | BookingCancelledPayload
  | BookingCheckedInPayload
  | BookingCheckedOutPayload
  | OrderCreatedPayload
  | OrderStatusChangedPayload
  | OrderReadyPayload
  | AvailabilityChangedPayload
  | WorkspaceOccupiedPayload
  | WorkspaceFreedPayload;

// Event handler types
export type RealtimeEventHandler<T = RealtimeEventPayload> = (data: T) => void;

// Connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Error types
export interface RealtimeError {
  code: string;
  message: string;
  timestamp: Date;
}
