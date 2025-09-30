/**
 * Admin Analytics - Revenue API
 * GET /api/admin/analytics/revenue - Get revenue statistics
 */

import type { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/auth/rbac'
import { successResponse, serverErrorResponse } from '@/lib/api/response'
import { getBookingStatistics } from '@/lib/db/repositories/booking.repository'
import { getOrderStats } from '@/lib/db/repositories/orders.repository'

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    }

    // Get booking revenue
    const bookingStatsResult = await getBookingStatistics(filters)
    if (bookingStatsResult.error) {
      return serverErrorResponse(bookingStatsResult.error)
    }

    // Get order revenue (cafe)
    const orderStatsResult = await getOrderStats()
    if (orderStatsResult.error) {
      return serverErrorResponse(orderStatsResult.error)
    }

    // Calculate total revenue
    const bookingRevenue = bookingStatsResult.data?.total_revenue || 0
    const cafeRevenue = orderStatsResult.data?.total_revenue || 0
    const totalRevenue = bookingRevenue + cafeRevenue

    return successResponse(
      {
        totalRevenue,
        breakdown: {
          bookings: {
            revenue: bookingRevenue,
            count: bookingStatsResult.data?.total_bookings || 0,
            average: bookingStatsResult.data?.average_booking_value || 0,
            refunded: bookingStatsResult.data?.total_refunded || 0,
          },
          cafe: {
            revenue: cafeRevenue,
            count: orderStatsResult.data?.total_orders || 0,
            average: orderStatsResult.data?.average_order_value || 0,
          },
        },
        period: {
          start_date: filters.start_date || 'all_time',
          end_date: filters.end_date || 'now',
        },
      },
      'Revenue analytics retrieved successfully'
    )
  } catch (error) {
    console.error('Error in GET /api/admin/analytics/revenue:', error)
    return serverErrorResponse('Failed to fetch revenue analytics')
  }
}

export const GET = withAdminAuth(handleGet)