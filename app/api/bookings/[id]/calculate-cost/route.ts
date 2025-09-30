import type { NextRequest } from 'next/server'
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response'
import { getBookingById } from '@/lib/db/repositories/booking.repository'
import {
  calculateActualDuration,
  calculateFinalCharge,
  formatPrice,
} from '@/lib/services/pricing.service'

/**
 * GET /api/bookings/:id/calculate-cost
 * Calculate the estimated final cost for an active booking
 * Useful for showing users their current charges before checking out
 *
 * Authorization: Required (must be booking owner)
 */

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
      return unauthorizedResponse('You do not have permission to view this booking')
    }

    // 3. Check if booking is active
    if (!booking.check_in_time) {
      return badRequestResponse('Booking has not been checked in yet')
    }

    if (booking.check_out_time) {
      // Already checked out, return final charges
      return successResponse(
        {
          booking: {
            id: booking.id,
            confirmation_code: booking.confirmation_code,
            status: booking.status,
          },
          is_checked_out: true,
          usage: {
            booked_hours: booking.duration_hours,
            actual_hours: booking.actual_duration_hours,
            check_in_time: booking.check_in_time,
            check_out_time: booking.check_out_time,
          },
          charges: {
            initial_charge: booking.total_price,
            final_charge: booking.final_charge,
          },
        },
        'Booking is already checked out'
      )
    }

    // 4. Calculate current duration and estimated final charge
    const currentTime = new Date().toISOString()
    const actualDurationHours = calculateActualDuration(booking.check_in_time, currentTime)

    const finalChargeResult = calculateFinalCharge(
      booking.duration_hours,
      actualDurationHours,
      booking.subtotal,
      booking.processing_fee,
      booking.nft_discount_applied
    )

    // 5. Calculate time remaining in booking
    const bookingEnd = new Date(`${booking.booking_date}T${booking.end_time}`)
    const now = new Date()
    const minutesRemaining = Math.max(0, (bookingEnd.getTime() - now.getTime()) / (60 * 1000))
    const hoursRemaining = minutesRemaining / 60

    // 6. Determine status
    const isOvertime = actualDurationHours > booking.duration_hours
    const isUndertime = now < bookingEnd

    return successResponse(
      {
        booking: {
          id: booking.id,
          confirmation_code: booking.confirmation_code,
          workspace: booking.workspaces,
          status: booking.status,
        },
        is_checked_out: false,
        usage: {
          booked_hours: booking.duration_hours,
          hours_used_so_far: actualDurationHours,
          hours_remaining: isUndertime ? hoursRemaining : 0,
          check_in_time: booking.check_in_time,
          is_overtime: isOvertime,
        },
        charges: {
          initial_charge: booking.total_price,
          estimated_final_charge: finalChargeResult.finalCharge,
          estimated_refund: finalChargeResult.refundAmount,
          estimated_overage: finalChargeResult.overageCharge,
          description: finalChargeResult.description,
        },
        formatted_charges: {
          initial_charge: formatPrice(booking.total_price),
          estimated_final_charge: formatPrice(finalChargeResult.finalCharge),
          estimated_refund: formatPrice(finalChargeResult.refundAmount),
          estimated_overage: formatPrice(finalChargeResult.overageCharge),
        },
        message: isOvertime
          ? 'You are currently in overtime. Additional charges will apply.'
          : isUndertime
            ? `You have ${hoursRemaining.toFixed(1)} hours remaining in your booking.`
            : 'Your booking time is up. Please check out.',
      },
      'Cost calculation completed'
    )
  } catch (error) {
    console.error('Unexpected error in GET /api/bookings/:id/calculate-cost:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}
