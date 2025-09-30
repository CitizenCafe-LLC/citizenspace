import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { getUserCredits } from '@/lib/db/repositories/booking.repository'
import { apiResponse, apiError } from '@/lib/api/response'

/**
 * GET /api/memberships/credits/meeting-rooms
 * Get user's meeting room credits specifically
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return apiError('Unauthorized', 401)
    }

    const userId = authResult.user.userId

    // Get user's credits
    const result = await getUserCredits(userId)

    if (result.error) {
      return apiError('Failed to fetch meeting room credits', 500, result.error)
    }

    if (!result.data) {
      return apiError('User not found', 404)
    }

    const credits = result.data

    // Check if user has a membership
    if (!credits.membership_plan_id) {
      return apiResponse({
        user_id: userId,
        has_membership: false,
        credits_available: 0,
        message: 'No active membership. Meeting room credits require a membership plan.',
      })
    }

    return apiResponse({
      user_id: userId,
      has_membership: true,
      credits_available: credits.meeting_room_credits_hours || 0,
      last_allocated: credits.meeting_room_credits_last_allocated,
      membership: {
        plan_id: credits.membership_plan_id,
        plan_name: credits.membership_plans?.name,
        monthly_allocation: credits.membership_plans?.meeting_room_credits_hours || 0,
        billing_period: credits.membership_plans?.billing_period,
      },
    })
  } catch (error) {
    console.error('Error fetching meeting room credits:', error)
    return apiError('Internal server error', 500)
  }
}