/**
 * Admin Orders API
 * GET /api/admin/orders - List all orders with filters (for staff/admin)
 */

import type { NextRequest } from 'next/server'
import { withStaffOrAdminAuth } from '@/lib/auth/rbac'
import { successResponse, serverErrorResponse } from '@/lib/api/response'
import { getAllOrders, type OrderStatus } from '@/lib/db/repositories/orders.repository'

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const statusFilter = searchParams.get('status') as OrderStatus | undefined
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    const { data, error, count } = await getAllOrders(pagination, statusFilter)

    if (error) {
      return serverErrorResponse(error)
    }

    const totalPages = Math.ceil(count / pagination.limit)

    return successResponse(
      data,
      'Orders retrieved successfully',
      {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        totalPages,
      }
    )
  } catch (error) {
    console.error('Error in GET /api/admin/orders:', error)
    return serverErrorResponse('Failed to fetch orders')
  }
}

export const GET = withStaffOrAdminAuth(handleGet)