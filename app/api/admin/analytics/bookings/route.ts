/**
 * Admin Analytics - Bookings API
 * GET /api/admin/analytics/bookings - Get booking statistics
 */

import type { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/auth/rbac'
import { successResponse, serverErrorResponse } from '@/lib/api/response'
import {
  getBookingStatistics,
  getPopularBookingTimes,
} from '@/lib/db/repositories/booking.repository'

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    }

    // Get booking statistics
    const statsResult = await getBookingStatistics(filters)
    if (statsResult.error) {
      return serverErrorResponse(statsResult.error)
    }

    // Get popular booking times
    const popularTimesResult = await getPopularBookingTimes()
    if (popularTimesResult.error) {
      return serverErrorResponse(popularTimesResult.error)
    }

    return successResponse(
      {
        statistics: statsResult.data,
        popularTimes: popularTimesResult.data,
      },
      'Booking analytics retrieved successfully'
    )
  } catch (error) {
    console.error('Error in GET /api/admin/analytics/bookings:', error)
    return serverErrorResponse('Failed to fetch booking analytics')
  }
}

export const GET = withAdminAuth(handleGet)