import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { getUserCredits } from '@/lib/db/repositories/booking.repository'
import { apiResponse, apiError } from '@/lib/api/response'

/**
 * GET /api/memberships/credits
 * Get user's credit balances (all types)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return apiError('Unauthorized', 401)
    }

    const userId = authResult.user.userId

    // Get user's credit balances
    const result = await getUserCredits(userId)

    if (result.error) {
      return apiError('Failed to fetch credits', 500, result.error)
    }

    if (!result.data) {
      return apiError('User not found', 404)
    }

    const credits = result.data

    return apiResponse({
      user_id: userId,
      credits: {
        meeting_room: {
          hours_available: credits.meeting_room_credits_hours || 0,
          last_allocated: credits.meeting_room_credits_last_allocated,
        },
        printing: {
          pages_available: credits.printing_credits || 0,
          last_allocated: credits.printing_credits_last_allocated,
        },
        guest_passes: {
          passes_available: credits.guest_passes_remaining || 0,
          last_allocated: credits.guest_passes_last_allocated,
        },
      },
      membership: {
        plan_id: credits.membership_plan_id,
        plan_name: credits.membership_plans?.name,
        billing_period: credits.membership_plans?.billing_period,
        subscription_status: credits.subscription_status,
      },
    })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return apiError('Internal server error', 500)
  }
}