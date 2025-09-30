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
  updateBooking,
  isWorkspaceAvailable,
  getUserWithMembership,
} from '@/lib/db/repositories/booking.repository'
import { getWorkspaceById } from '@/lib/db/repositories/workspace.repository'
import {
  calculateHourlyDeskPricing,
  calculateDurationHours,
  validateBookingDuration,
} from '@/lib/services/pricing.service'
import { z } from 'zod'

/**
 * POST /api/bookings/:id/extend
 * Extend an active booking by additional hours
 *
 * Request Body:
 * - new_end_time: New end time in HH:MM format
 *
 * Authorization: Required (must be booking owner and checked in)
 */

const extendBookingSchema = z.object({
  new_end_time: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return unauthorizedResponse('Authentication required')
    }

    const bookingId = params.id

    // Parse request body
    const body = await request.json()
    const validation = extendBookingSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(
        `Invalid request: ${validation.error.errors.map(e => e.message).join(', ')}`
      )
    }

    const { new_end_time } = validation.data

    // 1. Get booking details
    const { data: booking, error: bookingError } = await getBookingById(bookingId)
    if (bookingError || !booking) {
      return notFoundResponse('Booking not found')
    }

    // 2. Verify ownership
    if (booking.user_id !== userId) {
      return unauthorizedResponse('You do not have permission to extend this booking')
    }

    // 3. Verify booking is active (checked in but not checked out)
    if (!booking.check_in_time) {
      return badRequestResponse('Must check in before extending booking')
    }

    if (booking.check_out_time) {
      return badRequestResponse('Cannot extend a completed booking')
    }

    if (booking.status === 'cancelled') {
      return badRequestResponse('Cannot extend a cancelled booking')
    }

    // 4. Verify new end time is after current end time
    const currentEndMinutes = timeToMinutes(booking.end_time)
    const newEndMinutes = timeToMinutes(new_end_time)

    if (newEndMinutes <= currentEndMinutes) {
      return badRequestResponse('New end time must be after current end time')
    }

    // 5. Get workspace details
    const { data: workspace, error: workspaceError } = await getWorkspaceById(booking.workspace_id)
    if (workspaceError || !workspace) {
      return serverErrorResponse('Failed to get workspace details')
    }

    // 6. Calculate new duration
    const newDurationHours = calculateDurationHours(booking.start_time, new_end_time)
    const additionalHours = calculateDurationHours(booking.end_time, new_end_time)

    // 7. Validate new duration against workspace constraints
    const durationValidation = validateBookingDuration(workspace, newDurationHours)
    if (!durationValidation.valid) {
      return badRequestResponse(durationValidation.error!)
    }

    // 8. Check availability for the extended time
    const { available, error: availabilityError } = await isWorkspaceAvailable(
      booking.workspace_id,
      booking.booking_date,
      booking.end_time,
      new_end_time,
      bookingId // Exclude current booking from availability check
    )

    if (availabilityError) {
      return serverErrorResponse('Error checking availability')
    }

    if (!available) {
      return badRequestResponse('Extended time slot is not available')
    }

    // 9. Get user details for pricing
    const { data: user, error: userError } = await getUserWithMembership(userId)
    if (userError || !user) {
      return serverErrorResponse('Failed to get user details')
    }

    // 10. Calculate additional pricing
    const additionalPricing = calculateHourlyDeskPricing(additionalHours, {
      nft_holder: user.nft_holder,
      membership_plan_id: user.membership_plan_id,
      membership_plan: user.membership_plans
        ? {
            includes_hot_desk: user.membership_plans.includes_hot_desk,
            membership_status: user.membership_status || undefined,
          }
        : null,
    })

    // 11. Calculate new totals
    const newSubtotal = booking.subtotal + additionalPricing.subtotal
    const newDiscountAmount = booking.discount_amount + additionalPricing.discountAmount
    const newTotalPrice = booking.total_price + additionalPricing.totalPrice

    // 12. Update booking
    const { data: updatedBooking, error: updateError } = await updateBooking(bookingId, {
      end_time: new_end_time,
      duration_hours: newDurationHours,
      subtotal: newSubtotal,
      discount_amount: newDiscountAmount,
      total_price: newTotalPrice,
      // TODO: Update payment_intent_id when Stripe is integrated
    })

    if (updateError || !updatedBooking) {
      console.error('Error extending booking:', updateError)
      return serverErrorResponse('Failed to extend booking')
    }

    // 13. Return updated booking with additional payment info
    const requiresAdditionalPayment = additionalPricing.totalPrice > 0

    return successResponse(
      {
        booking: {
          id: updatedBooking.id,
          confirmation_code: updatedBooking.confirmation_code,
          workspace: booking.workspaces,
          start_time: booking.start_time,
          end_time: new_end_time,
          duration_hours: newDurationHours,
        },
        extension: {
          additional_hours: additionalHours,
          additional_charge: additionalPricing.totalPrice,
          new_total: newTotalPrice,
        },
        requires_additional_payment: requiresAdditionalPayment,
        // TODO: Add payment_intent_client_secret when Stripe is integrated
      },
      'Booking extended successfully'
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/bookings/:id/extend:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
