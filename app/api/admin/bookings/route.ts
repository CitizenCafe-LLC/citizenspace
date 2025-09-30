/**
 * Admin Bookings API
 * GET /api/admin/bookings - List all bookings with filters
 */

import type { NextRequest } from 'next/server'
import { withStaffOrAdminAuth } from '@/lib/auth/rbac'
import { successResponse, serverErrorResponse } from '@/lib/api/response'
import { getAllBookings } from '@/lib/db/repositories/booking.repository'

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract filters from query params
    const filters = {
      status: searchParams.get('status') || undefined,
      booking_type: searchParams.get('booking_type') || undefined,
      user_id: searchParams.get('user_id') || undefined,
      workspace_id: searchParams.get('workspace_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      payment_status: searchParams.get('payment_status') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'b.booking_date',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    const { data, error, count } = await getAllBookings(filters)

    if (error) {
      return serverErrorResponse(error)
    }

    const totalPages = Math.ceil(count / filters.limit)

    return successResponse(
      data,
      'Bookings retrieved successfully',
      {
        page: filters.page,
        limit: filters.limit,
        total: count,
        totalPages,
      }
    )
  } catch (error) {
    console.error('Error in GET /api/admin/bookings:', error)
    return serverErrorResponse('Failed to fetch bookings')
  }
}

export const GET = withStaffOrAdminAuth(handleGet)