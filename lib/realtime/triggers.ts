/**
 * Server-side Event Triggers
 * Functions to broadcast real-time events to connected clients
 */

import { getPusherServer, isPusherConfigured } from './client';
import { CHANNELS } from './types';
import { getUserChannel } from './channels';
import type {
  RealtimeEventType,
  BookingCreatedPayload,
  BookingUpdatedPayload,
  BookingCancelledPayload,
  BookingCheckedInPayload,
  BookingCheckedOutPayload,
  OrderCreatedPayload,
  OrderStatusChangedPayload,
  OrderReadyPayload,
  AvailabilityChangedPayload,
  WorkspaceOccupiedPayload,
  WorkspaceFreedPayload,
} from './types';

// Generic trigger function
async function triggerEvent(
  channel: string,
  event: RealtimeEventType,
  data: any
): Promise<boolean> {
  // Return early if Pusher not configured (dev/test environments)
  if (!isPusherConfigured()) {
    console.warn(`Pusher not configured. Skipping event: ${event}`);
    return false;
  }

  try {
    const pusher = getPusherServer();
    await pusher.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error(`Failed to trigger event ${event}:`, error);
    return false;
  }
}

// Booking Events
export async function triggerBookingCreated(
  data: BookingCreatedPayload
): Promise<boolean> {
  const success = await Promise.all([
    triggerEvent(CHANNELS.BOOKINGS, 'booking:created', data),
    triggerEvent(getUserChannel(data.userId), 'booking:created', data),
  ]);
  return success.every(Boolean);
}

export async function triggerBookingUpdated(
  data: BookingUpdatedPayload
): Promise<boolean> {
  return triggerEvent(CHANNELS.BOOKINGS, 'booking:updated', data);
}

export async function triggerBookingCancelled(
  data: BookingCancelledPayload
): Promise<boolean> {
  const success = await Promise.all([
    triggerEvent(CHANNELS.BOOKINGS, 'booking:cancelled', data),
    triggerEvent(getUserChannel(data.userId), 'booking:cancelled', data),
  ]);
  return success.every(Boolean);
}

export async function triggerBookingCheckedIn(
  data: BookingCheckedInPayload
): Promise<boolean> {
  const success = await Promise.all([
    triggerEvent(CHANNELS.BOOKINGS, 'booking:checked-in', data),
    triggerEvent(getUserChannel(data.userId), 'booking:checked-in', data),
  ]);
  return success.every(Boolean);
}

export async function triggerBookingCheckedOut(
  data: BookingCheckedOutPayload
): Promise<boolean> {
  const success = await Promise.all([
    triggerEvent(CHANNELS.BOOKINGS, 'booking:checked-out', data),
    triggerEvent(getUserChannel(data.userId), 'booking:checked-out', data),
  ]);
  return success.every(Boolean);
}

// Order Events
export async function triggerOrderCreated(
  data: OrderCreatedPayload
): Promise<boolean> {
  const success = await Promise.all([
    triggerEvent(CHANNELS.ORDERS, 'order:created', data),
    triggerEvent(getUserChannel(data.userId), 'order:created', data),
    triggerEvent(CHANNELS.ADMIN, 'order:created', data),
  ]);
  return success.every(Boolean);
}

export async function triggerOrderStatusChanged(
  data: OrderStatusChangedPayload
): Promise<boolean> {
  const success = await Promise.all([
    triggerEvent(CHANNELS.ORDERS, 'order:status-changed', data),
    triggerEvent(getUserChannel(data.userId), 'order:status-changed', data),
  ]);
  return success.every(Boolean);
}

export async function triggerOrderReady(
  data: OrderReadyPayload
): Promise<boolean> {
  const success = await Promise.all([
    triggerEvent(CHANNELS.ORDERS, 'order:ready', data),
    triggerEvent(getUserChannel(data.userId), 'order:ready', data),
  ]);
  return success.every(Boolean);
}

// Availability Events
export async function triggerAvailabilityChanged(
  data: AvailabilityChangedPayload
): Promise<boolean> {
  return triggerEvent(CHANNELS.AVAILABILITY, 'availability:changed', data);
}

export async function triggerWorkspaceOccupied(
  data: WorkspaceOccupiedPayload
): Promise<boolean> {
  return triggerEvent(CHANNELS.AVAILABILITY, 'workspace:occupied', data);
}

export async function triggerWorkspaceFreed(
  data: WorkspaceFreedPayload
): Promise<boolean> {
  return triggerEvent(CHANNELS.AVAILABILITY, 'workspace:freed', data);
}

// Batch trigger for multiple events
export async function triggerMultipleEvents(
  events: Array<{
    channel: string;
    event: RealtimeEventType;
    data: any;
  }>
): Promise<boolean[]> {
  if (!isPusherConfigured()) {
    console.warn('Pusher not configured. Skipping batch events');
    return events.map(() => false);
  }

  try {
    const pusher = getPusherServer();
    const promises = events.map(({ channel, event, data }) =>
      pusher.trigger(channel, event, data)
    );
    await Promise.all(promises);
    return events.map(() => true);
  } catch (error) {
    console.error('Failed to trigger batch events:', error);
    return events.map(() => false);
  }
}
