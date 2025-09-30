/**
 * Refund Payment Endpoint
 * Creates a refund for a cancelled booking
 *
 * @route POST /api/payments/refund
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  badRequestResponse,
} from '@/lib/api/response'
import { authenticateRequest } from '@/lib/auth/middleware'
import { createRefund } from '@/lib/stripe/utils'
import { formatStripeAmount } from '@/lib/stripe/config'
import { getBookingById, updateBooking } from '@/lib/db/repositories/booking.repository'

/**
 * Request body validation schema
 */
const refundPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  amount: z.number().positive('Amount must be positive').optional(),
  reason: z.string().optional(),
})

/**
 * POST /api/payments/refund
 * Create a refund for a booking payment
 *
 * @authenticated
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated || !authResult.user) {
      return unauthorizedResponse(authResult.error)
    }

    const userId = authResult.user.userId

    // Parse request body
    const body = await request.json()
    const validation = refundPaymentSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { bookingId, amount, reason } = validation.data

    // Verify booking exists and belongs to user
    const bookingResult = await getBookingById(bookingId)
    if (bookingResult.error || !bookingResult.data) {
      return errorResponse(bookingResult.error || 'Booking not found', 404)
    }

    const booking = bookingResult.data

    // Check authorization (user must own booking or be admin/staff)
    const isOwner = booking.user_id === userId
    const isAdmin = authResult.user.role === 'admin' || authResult.user.role === 'staff'

    if (!isOwner && !isAdmin) {
      return errorResponse('Unauthorized: Booking does not belong to user', 403)
    }

    // Verify booking is paid
    if (booking.payment_status !== 'paid') {
      return badRequestResponse('Booking has not been paid yet')
    }

    // Verify booking has a payment intent
    if (!booking.payment_intent_id) {
      return badRequestResponse('No payment intent found for this booking')
    }

    // Verify booking is cancelled or eligible for refund
    if (booking.status !== 'cancelled' && !isAdmin) {
      return badRequestResponse('Booking must be cancelled before refunding')
    }

    // Calculate refund amount
    let refundAmount = amount
    if (!refundAmount) {
      // Full refund if no amount specified
      refundAmount = booking.total_price
    }

    // Create refund in Stripe
    const amountInCents = formatStripeAmount(refundAmount)
    const { refund, error: refundError } = await createRefund(
      booking.payment_intent_id,
      amountInCents,
      reason
    )

    if (refundError || !refund) {
      return errorResponse(refundError || 'Failed to create refund', 500)
    }

    // Update booking payment status
    await updateBooking(bookingId, {
      payment_status: 'refunded',
    })

    return successResponse({
      refundId: refund.id,
      amount: refundAmount,
      currency: refund.currency,
      status: refund.status,
      bookingId: bookingId,
      message: 'Refund processed successfully',
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return errorResponse(error instanceof Error ? error.message : 'Failed to process refund', 500)
  }
}

/**
 * GET /api/payments/refund
 * Return method not allowed
 */
export async function GET() {
  return errorResponse('Method not allowed', 405)
}