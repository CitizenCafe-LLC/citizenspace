import type { NextRequest } from 'next/server'
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api/response'
import { getUserBookings } from '@/lib/db/repositories/booking.repository'
import { z } from 'zod'

/**
 * GET /api/bookings
 * List all bookings for the authenticated user
 *
 * Query Parameters:
 * - status: Filter by status (pending, confirmed, cancelled, completed)
 * - booking_type: Filter by type (hourly-desk, meeting-room, day-pass)
 * - start_date: Filter bookings from this date (YYYY-MM-DD)
 * - end_date: Filter bookings until this date (YYYY-MM-DD)
 *
 * Authorization: Required
 */

const bookingFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  booking_type: z.enum(['hourly-desk', 'meeting-room', 'day-pass']).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return unauthorizedResponse('Authentication required')
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const params = {
      status: searchParams.get('status'),
      booking_type: searchParams.get('booking_type'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
    }

    // Remove null values
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== null))

    const validation = bookingFiltersSchema.safeParse(cleanParams)

    if (!validation.success) {
      return successResponse(
        [],
        `Invalid filters: ${validation.error.errors.map(e => e.message).join(', ')}`
      )
    }

    // Fetch user's bookings
    const { data: bookings, error } = await getUserBookings(userId, validation.data)

    if (error) {
      console.error('Error fetching bookings:', error)
      return serverErrorResponse('Failed to fetch bookings')
    }

    // Categorize bookings
    const upcoming =
      bookings?.filter(b => {
        const bookingDate = new Date(b.booking_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return bookingDate >= today && b.status !== 'cancelled' && b.status !== 'completed'
      }) || []

    const active =
      bookings?.filter(b => b.check_in_time && !b.check_out_time && b.status === 'confirmed') || []

    const past =
      bookings?.filter(b => {
        const bookingDate = new Date(b.booking_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return bookingDate < today || b.status === 'completed'
      }) || []

    const cancelled = bookings?.filter(b => b.status === 'cancelled') || []

    return successResponse(
      {
        bookings: bookings || [],
        summary: {
          total: bookings?.length || 0,
          upcoming: upcoming.length,
          active: active.length,
          past: past.length,
          cancelled: cancelled.length,
        },
        categorized: {
          upcoming,
          active,
          past,
          cancelled,
        },
      },
      'Bookings retrieved successfully'
    )
  } catch (error) {
    console.error('Unexpected error in GET /api/bookings:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}
