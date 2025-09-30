/**
 * Create Payment Intent Endpoint
 * Creates a Stripe payment intent for booking payments
 *
 * @route POST /api/payments/create-intent
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
import { getOrCreateStripeCustomer, createPaymentIntent } from '@/lib/stripe/utils'
import { formatStripeAmount } from '@/lib/stripe/config'
import { getBookingById } from '@/lib/db/repositories/booking.repository'
import { executeQuerySingle } from '@/lib/db/postgres'
import type { User } from '@/lib/db/types'

/**
 * Request body validation schema
 */
const createPaymentIntentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  amount: z.number().positive('Amount must be positive'),
  savePaymentMethod: z.boolean().optional().default(false),
})

/**
 * POST /api/payments/create-intent
 * Create a payment intent for a booking
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
    const validation = createPaymentIntentSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message)
    }

    const { bookingId, amount, savePaymentMethod } = validation.data

    // Verify booking exists and belongs to user
    const bookingResult = await getBookingById(bookingId)
    if (bookingResult.error || !bookingResult.data) {
      return errorResponse(bookingResult.error || 'Booking not found', 404)
    }

    const booking = bookingResult.data
    if (booking.user_id !== userId) {
      return errorResponse('Unauthorized: Booking does not belong to user', 403)
    }

    // Check if booking is already paid
    if (booking.payment_status === 'paid') {
      return badRequestResponse('Booking is already paid')
    }

    // Get user details
    const userQuery = 'SELECT * FROM users WHERE id = $1'
    const userResult = await executeQuerySingle<User>(userQuery, [userId])

    if (userResult.error || !userResult.data) {
      return errorResponse('User not found', 404)
    }

    const user = userResult.data

    // Create or retrieve Stripe customer
    const { customer, error: customerError } = await getOrCreateStripeCustomer(
      userId,
      user.email,
      user.full_name,
      user.stripe_customer_id
    )

    if (customerError || !customer) {
      return errorResponse(customerError || 'Failed to create customer', 500)
    }

    // Update user with Stripe customer ID if not already set
    if (!user.stripe_customer_id) {
      const updateUserQuery = 'UPDATE users SET stripe_customer_id = $1 WHERE id = $2'
      await executeQuerySingle(updateUserQuery, [customer.id, userId])
    }

    // Create payment intent
    const amountInCents = formatStripeAmount(amount)
    const metadata = {
      booking_id: bookingId,
      user_id: userId,
      booking_type: booking.booking_type,
      workspace_id: booking.workspace_id,
      booking_date: booking.booking_date,
    }

    const { paymentIntent, error: paymentError } = await createPaymentIntent(
      amountInCents,
      customer.id,
      metadata
    )

    if (paymentError || !paymentIntent) {
      return errorResponse(paymentError || 'Failed to create payment intent', 500)
    }

    // Return client secret for frontend
    return successResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: paymentIntent.currency,
      customerId: customer.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create payment intent',
      500
    )
  }
}

/**
 * GET /api/payments/create-intent
 * Return method not allowed
 */
export async function GET() {
  return errorResponse('Method not allowed', 405)
}