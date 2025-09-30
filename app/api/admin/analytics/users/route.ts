/**
 * Admin Analytics - Users API
 * GET /api/admin/analytics/users - Get user statistics
 */

import type { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/auth/rbac'
import { successResponse, serverErrorResponse } from '@/lib/api/response'
import {
  getUserStatistics,
  getMembershipDistribution,
} from '@/lib/db/repositories/users.repository'

async function handleGet(request: NextRequest) {
  try {
    // Get user statistics
    const userStatsResult = await getUserStatistics()
    if (userStatsResult.error) {
      return serverErrorResponse(userStatsResult.error)
    }

    // Get membership distribution
    const membershipDistResult = await getMembershipDistribution()
    if (membershipDistResult.error) {
      return serverErrorResponse(membershipDistResult.error)
    }

    return successResponse(
      {
        statistics: userStatsResult.data,
        membershipDistribution: membershipDistResult.data,
      },
      'User analytics retrieved successfully'
    )
  } catch (error) {
    console.error('Error in GET /api/admin/analytics/users:', error)
    return serverErrorResponse('Failed to fetch user analytics')
  }
}

export const GET = withAdminAuth(handleGet)