/**
 * Booking Real-time Service
 * Integrates real-time events with booking operations
 *
 * This service wraps booking repository operations and automatically
 * broadcasts real-time events when bookings are created, updated, or cancelled.
 */

import * as bookingRepo from '@/lib/db/repositories/booking.repository'
import { realtimeEvents } from './events'
import type { BookingEventData } from './config'
import type { Booking } from '@/lib/db/types'

/**
 * Convert database Booking to BookingEventData
 */
function toBookingEventData(booking: Booking): BookingEventData {
  return {
    id: booking.id,
    user_id: booking.user_id,
    workspace_id: booking.workspace_id,
    booking_type: booking.booking_type,
    booking_date: booking.booking_date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: booking.status,
    workspace_name: booking.workspaces?.name,
  }
}

/**
 * Create booking with real-time notification
 */
export async function createBookingWithRealtime(params: bookingRepo.CreateBookingParams) {
  // Create booking in database
  const result = await bookingRepo.createBooking(params)

  // Broadcast real-time event if successful
  if (result.data && !result.error) {
    const eventData = toBookingEventData(result.data)
    await realtimeEvents.booking.bookingCreated(eventData)

    // Update workspace availability
    await realtimeEvents.availability.seatOccupied(
      params.workspace_id,
      eventData.workspace_name || 'Workspace',
      params.booking_date
    )
  }

  return result
}

/**
 * Update booking status with real-time notification
 */
export async function updateBookingWithRealtime(
  id: string,
  params: bookingRepo.UpdateBookingParams
) {
  // Update booking in database
  const result = await bookingRepo.updateBooking(id, params)

  // Broadcast real-time event if successful
  if (result.data && !result.error) {
    const eventData = toBookingEventData(result.data)

    // Determine which event to send based on status change
    if (params.status === 'confirmed') {
      await realtimeEvents.booking.bookingConfirmed(eventData)
    } else if (params.status === 'cancelled') {
      await realtimeEvents.booking.bookingCancelled(eventData)

      // Update workspace availability when booking is cancelled
      await realtimeEvents.availability.seatAvailable(
        result.data.workspace_id,
        eventData.workspace_name || 'Workspace',
        result.data.booking_date
      )
    } else if (params.check_in_time) {
      await realtimeEvents.booking.bookingCheckedIn(eventData)
    } else if (params.check_out_time) {
      await realtimeEvents.booking.bookingCheckedOut(eventData)

      // Update workspace availability when booking is checked out
      await realtimeEvents.availability.seatAvailable(
        result.data.workspace_id,
        eventData.workspace_name || 'Workspace',
        result.data.booking_date
      )
    }
  }

  return result
}

/**
 * Cancel booking with real-time notification
 */
export async function cancelBookingWithRealtime(id: string) {
  // Get booking details first
  const bookingResult = await bookingRepo.getBookingById(id)

  if (!bookingResult.data) {
    return { data: null, error: 'Booking not found' }
  }

  // Cancel booking
  const result = await bookingRepo.cancelBooking(id)

  // Broadcast real-time event if successful
  if (result.data && !result.error) {
    const eventData = toBookingEventData(result.data)
    await realtimeEvents.booking.bookingCancelled(eventData)

    // Update workspace availability
    await realtimeEvents.availability.seatAvailable(
      result.data.workspace_id,
      eventData.workspace_name || 'Workspace',
      result.data.booking_date
    )
  }

  return result
}

/**
 * Check in to booking with real-time notification
 */
export async function checkInBookingWithRealtime(id: string) {
  const result = await bookingRepo.checkInBooking(id)

  if (result.data && !result.error) {
    const eventData = toBookingEventData(result.data)
    await realtimeEvents.booking.bookingCheckedIn(eventData)
  }

  return result
}

/**
 * Check out from booking with real-time notification
 */
export async function checkOutBookingWithRealtime(
  id: string,
  actualDurationHours: number,
  finalCharge: number
) {
  // Get booking details first
  const bookingResult = await bookingRepo.getBookingById(id)

  if (!bookingResult.data) {
    return { data: null, error: 'Booking not found' }
  }

  const result = await bookingRepo.checkOutBooking(id, actualDurationHours, finalCharge)

  if (result.data && !result.error) {
    const eventData = toBookingEventData(result.data)
    await realtimeEvents.booking.bookingCheckedOut(eventData)

    // Update workspace availability
    await realtimeEvents.availability.seatAvailable(
      result.data.workspace_id,
      eventData.workspace_name || 'Workspace',
      result.data.booking_date
    )
  }

  return result
}

/**
 * Batch update workspace availability for a specific date
 */
export async function updateWorkspaceAvailabilityForDate(
  workspaceId: string,
  workspaceName: string,
  date: string
) {
  // Get all bookings for this workspace on this date
  const bookingsResult = await bookingRepo.getUserBookings('', {
    start_date: date,
    end_date: date,
  })

  const activeBookings =
    bookingsResult.data?.filter(
      b =>
        b.workspace_id === workspaceId &&
        b.status !== 'cancelled' &&
        b.status !== 'completed'
    ) || []

  // Calculate available slots
  const totalSlots = 10 // Assuming 10 time slots per day
  const occupiedSlots = activeBookings.length
  const availableSlots = Math.max(0, totalSlots - occupiedSlots)

  // Broadcast availability update
  await realtimeEvents.availability.availabilityUpdated({
    workspace_id: workspaceId,
    workspace_name: workspaceName,
    date,
    available_slots: availableSlots,
    is_available: availableSlots > 0,
  })
}
