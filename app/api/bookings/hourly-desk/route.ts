import type { NextRequest } from 'next/server'
import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api/response'
import { getWorkspaceById } from '@/lib/db/repositories/workspace.repository'
import {
  createBooking,
  isWorkspaceAvailable,
  getUserWithMembership,
} from '@/lib/db/repositories/booking.repository'
import {
  calculateHourlyDeskPricing,
  calculateDurationHours,
  validateBookingDuration,
} from '@/lib/services/pricing.service'
import { z } from 'zod'

/**
 * POST /api/bookings/hourly-desk
 * Create an hourly hot desk booking
 *
 * Request Body:
 * - workspace_id: UUID of the hot desk workspace
 * - booking_date: Date in YYYY-MM-DD format
 * - start_time: Time in HH:MM format
 * - end_time: Time in HH:MM format
 * - attendees: Number of people (default: 1)
 * - special_requests: Optional special requests
 *
 * Authorization: Required (JWT token in Authorization header)
 */

const hourlyDeskBookingSchema = z.object({
  workspace_id: z.string().uuid('Invalid workspace ID'),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
  attendees: z.number().int().min(1).default(1),
  special_requests: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // TODO: Extract user from JWT token in Authorization header
    // For now, we'll use a mock user ID from headers for testing
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return unauthorizedResponse('Authentication required')
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = hourlyDeskBookingSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(
        `Invalid request: ${validation.error.errors.map(e => e.message).join(', ')}`
      )
    }

    const { workspace_id, booking_date, start_time, end_time, attendees, special_requests } =
      validation.data

    // 1. Validate booking is for future date/time
    const bookingDateTime = new Date(`${booking_date}T${start_time}`)
    const now = new Date()
    if (bookingDateTime < now) {
      return badRequestResponse('Cannot book in the past')
    }

    // 2. Get workspace details
    const { data: workspace, error: workspaceError } = await getWorkspaceById(workspace_id)
    if (workspaceError || !workspace) {
      return notFoundResponse('Workspace not found')
    }

    // 3. Verify workspace is a hot desk
    if (workspace.resource_category !== 'desk') {
      return badRequestResponse('This endpoint is only for hot desk bookings')
    }

    if (!workspace.available) {
      return badRequestResponse('This workspace is not available')
    }

    // 4. Calculate duration
    const durationHours = calculateDurationHours(start_time, end_time)
    if (durationHours <= 0) {
      return badRequestResponse('End time must be after start time')
    }

    // 5. Validate duration against workspace constraints
    const durationValidation = validateBookingDuration(workspace, durationHours)
    if (!durationValidation.valid) {
      return badRequestResponse(durationValidation.error!)
    }

    // 6. Check availability
    const { available, error: availabilityError } = await isWorkspaceAvailable(
      workspace_id,
      booking_date,
      start_time,
      end_time
    )

    if (availabilityError) {
      return serverErrorResponse('Error checking availability')
    }

    if (!available) {
      return badRequestResponse('This time slot is already booked')
    }

    // 7. Get user with membership information
    const { data: user, error: userError } = await getUserWithMembership(userId)
    if (userError || !user) {
      return notFoundResponse('User not found')
    }

    // 8. Calculate pricing
    const pricing = calculateHourlyDeskPricing(durationHours, {
      nft_holder: user.nft_holder,
      membership_plan_id: user.membership_plan_id,
      membership_plan: user.membership_plans
        ? {
            includes_hot_desk: user.membership_plans.includes_hot_desk,
            membership_status: user.membership_status || undefined,
          }
        : null,
    })

    // 9. Create booking
    const { data: booking, error: bookingError } = await createBooking({
      user_id: userId,
      workspace_id,
      booking_type: 'hourly-desk',
      booking_date,
      start_time,
      end_time,
      duration_hours: durationHours,
      attendees,
      subtotal: pricing.subtotal,
      discount_amount: pricing.discountAmount,
      nft_discount_applied: pricing.nftDiscountApplied,
      processing_fee: pricing.processingFee,
      total_price: pricing.totalPrice,
      special_requests: special_requests || null,
      payment_method: pricing.paymentMethod,
    })

    if (bookingError || !booking) {
      console.error('Error creating booking:', bookingError)
      return serverErrorResponse('Failed to create booking')
    }

    // 10. If payment required, return payment intent information
    // TODO: Integrate with Stripe to create payment intent
    const requiresPayment = pricing.totalPrice > 0

    return successResponse(
      {
        booking: {
          id: booking.id,
          confirmation_code: booking.confirmation_code,
          workspace: {
            id: workspace.id,
            name: workspace.name,
            type: workspace.type,
          },
          booking_date,
          start_time,
          end_time,
          duration_hours: durationHours,
          status: booking.status,
          payment_status: booking.payment_status,
        },
        pricing: {
          subtotal: pricing.subtotal,
          discount_amount: pricing.discountAmount,
          nft_discount_applied: pricing.nftDiscountApplied,
          processing_fee: pricing.processingFee,
          total_price: pricing.totalPrice,
          payment_method: pricing.paymentMethod,
        },
        requires_payment: requiresPayment,
        // TODO: Add payment_intent_client_secret when Stripe is integrated
      },
      'Booking created successfully',
      201
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/bookings/hourly-desk:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}
