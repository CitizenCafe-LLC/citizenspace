import type { NextRequest } from 'next/server'
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response'
import {
  getBookingById,
  checkInBooking,
  getActiveBooking,
} from '@/lib/db/repositories/booking.repository'

/**
 * POST /api/bookings/:id/check-in
 * Check in to a booking
 *
 * Authorization: Required (must be booking owner)
 */

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return unauthorizedResponse('Authentication required')
    }

    const bookingId = params.id

    // 1. Get booking details
    const { data: booking, error: bookingError } = await getBookingById(bookingId)
    if (bookingError || !booking) {
      return notFoundResponse('Booking not found')
    }

    // 2. Verify ownership
    if (booking.user_id !== userId) {
      return unauthorizedResponse('You do not have permission to check in to this booking')
    }

    // 3. Verify booking status
    if (booking.status === 'cancelled') {
      return badRequestResponse('Cannot check in to a cancelled booking')
    }

    if (booking.status === 'completed') {
      return badRequestResponse('This booking has already been completed')
    }

    // 4. Check if already checked in
    if (booking.check_in_time) {
      return badRequestResponse('Already checked in to this booking')
    }

    // 5. Check if user has another active booking
    const { data: activeBooking } = await getActiveBooking(userId)
    if (activeBooking && activeBooking.id !== bookingId) {
      return badRequestResponse(
        `You have an active booking at ${activeBooking.workspaces?.name}. Please check out first.`
      )
    }

    // 6. Verify booking time is now or in the past (allow check-in within booking window)
    const now = new Date()
    const bookingStart = new Date(`${booking.booking_date}T${booking.start_time}`)
    const bookingEnd = new Date(`${booking.booking_date}T${booking.end_time}`)

    // Allow check-in up to 15 minutes before start time
    const earlyCheckInWindow = new Date(bookingStart.getTime() - 15 * 60 * 1000)

    if (now < earlyCheckInWindow) {
      const minutesUntil = Math.ceil((earlyCheckInWindow.getTime() - now.getTime()) / (60 * 1000))
      return badRequestResponse(`Check-in available in ${minutesUntil} minutes`)
    }

    // Don't allow check-in more than 1 hour after booking end time
    const lateCheckInWindow = new Date(bookingEnd.getTime() + 60 * 60 * 1000)
    if (now > lateCheckInWindow) {
      return badRequestResponse('This booking time has passed')
    }

    // 7. Perform check-in
    const { data: updatedBooking, error: checkInError } = await checkInBooking(bookingId)
    if (checkInError || !updatedBooking) {
      console.error('Error checking in:', checkInError)
      return serverErrorResponse('Failed to check in')
    }

    return successResponse(
      {
        booking: {
          id: updatedBooking.id,
          confirmation_code: updatedBooking.confirmation_code,
          workspace: booking.workspaces,
          check_in_time: updatedBooking.check_in_time,
          status: updatedBooking.status,
        },
      },
      'Checked in successfully'
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/bookings/:id/check-in:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}
