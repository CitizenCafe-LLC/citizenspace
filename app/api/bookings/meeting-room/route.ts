import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import {
  createBooking,
  getUserWithMembership,
  getUserCredits,
  deductCredits,
} from '@/lib/db/repositories/booking.repository'
import { getWorkspaceById } from '@/lib/db/repositories/workspace.repository'
import { apiResponse, apiError } from '@/lib/api/response'
import { z } from 'zod'

const meetingRoomBookingSchema = z.object({
  workspace_id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  attendees: z.number().int().min(1).max(20).optional(),
  special_requests: z.string().optional(),
})

/**
 * POST /api/bookings/meeting-room
 * Create a meeting room booking with credit deduction
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return apiError('Unauthorized', 401)
    }

    const userId = authResult.user.userId

    // Parse and validate request body
    const body = await request.json()
    const validation = meetingRoomBookingSchema.safeParse(body)

    if (!validation.success) {
      return apiError('Invalid request data', 400, validation.error.errors)
    }

    const { workspace_id, booking_date, start_time, end_time, attendees, special_requests } =
      validation.data

    // Get workspace details
    const workspaceResult = await getWorkspaceById(workspace_id)
    if (workspaceResult.error || !workspaceResult.data) {
      return apiError('Meeting room not found', 404)
    }

    const workspace = workspaceResult.data

    // Verify it's a meeting room
    if (workspace.resource_category !== 'meeting-room') {
      return apiError('Workspace is not a meeting room', 400)
    }

    // Calculate duration in hours
    const [startHour, startMin] = start_time.split(':').map(Number)
    const [endHour, endMin] = end_time.split(':').map(Number)
    const durationMinutes = endHour * 60 + endMin - (startHour * 60 + startMin)
    const durationHours = durationMinutes / 60

    if (durationHours <= 0) {
      return apiError('End time must be after start time', 400)
    }

    // Get user with membership details
    const userResult = await getUserWithMembership(userId)
    if (userResult.error || !userResult.data) {
      return apiError('User not found', 404)
    }

    const user = userResult.data

    // Check if user has a membership
    if (!user.membership_plan_id) {
      return apiError('Meeting room bookings require an active membership', 403)
    }

    // Get user's available meeting room credits
    const creditsResult = await getUserCredits(userId)
    if (creditsResult.error) {
      return apiError('Failed to fetch credit balance', 500)
    }

    const availableCredits = creditsResult.data?.meeting_room_credits_hours || 0

    // Calculate pricing
    const hourlyRate = workspace.base_price_hourly
    let subtotal = hourlyRate * durationHours
    let creditsUsed = 0
    let overageHours = 0
    let overageCharge = 0

    // Apply credits first
    if (availableCredits > 0) {
      if (durationHours <= availableCredits) {
        // All hours covered by credits
        creditsUsed = durationHours
        subtotal = 0
      } else {
        // Partial coverage, calculate overage
        creditsUsed = availableCredits
        overageHours = durationHours - availableCredits
        overageCharge = overageHours * hourlyRate
        subtotal = overageCharge
      }
    } else {
      // No credits, pay full price
      overageHours = durationHours
      overageCharge = subtotal
    }

    // Apply NFT discount to overage charges
    let nftDiscount = 0
    if (user.nft_holder && overageCharge > 0) {
      nftDiscount = overageCharge * 0.5 // 50% discount
      subtotal = overageCharge - nftDiscount
    }

    const processingFee = subtotal * 0.029 // 2.9% processing fee
    const totalPrice = subtotal + processingFee

    // Create booking
    const bookingResult = await createBooking({
      user_id: userId,
      workspace_id,
      booking_type: 'meeting-room',
      booking_date,
      start_time,
      end_time,
      duration_hours: durationHours,
      attendees: attendees || 1,
      subtotal,
      discount_amount: nftDiscount,
      nft_discount_applied: user.nft_holder,
      credits_used: creditsUsed,
      credits_overage_hours: overageHours,
      overage_charge: overageCharge,
      processing_fee: processingFee,
      total_price: totalPrice,
      special_requests,
      payment_method: totalPrice > 0 ? 'pending' : 'credits',
      status: 'pending',
      payment_status: totalPrice > 0 ? 'pending' : 'paid',
    })

    if (bookingResult.error || !bookingResult.data) {
      return apiError('Failed to create booking', 500, bookingResult.error)
    }

    const booking = bookingResult.data

    // Deduct credits if used
    if (creditsUsed > 0) {
      const deductResult = await deductCredits(
        userId,
        'meeting-room',
        creditsUsed,
        booking.id,
        `Meeting room booking: ${workspace.name}`
      )

      if (deductResult.error) {
        // Rollback booking creation would happen here in a transaction
        return apiError('Failed to deduct credits', 500)
      }
    }

    return apiResponse({
      booking,
      pricing: {
        hourly_rate: hourlyRate,
        duration_hours: durationHours,
        credits_used: creditsUsed,
        overage_hours: overageHours,
        overage_charge: overageCharge,
        nft_discount: nftDiscount,
        subtotal,
        processing_fee: processingFee,
        total_price: totalPrice,
      },
      payment_required: totalPrice > 0,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
      },
    })
  } catch (error) {
    console.error('Error creating meeting room booking:', error)
    return apiError('Internal server error', 500)
  }
}