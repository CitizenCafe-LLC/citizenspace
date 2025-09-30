/**
 * Admin Users API
 * GET /api/admin/users - List all users with filters
 */

import type { NextRequest } from 'next/server'
import { withAdminAuth } from '@/lib/auth/rbac'
import { successResponse, serverErrorResponse } from '@/lib/api/response'
import { getAllUsers } from '@/lib/db/repositories/users.repository'
import type { UserRole } from '@/lib/auth/rbac'

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract filters from query params
    const filters = {
      role: searchParams.get('role') as UserRole | undefined,
      nft_holder: searchParams.get('nft_holder')
        ? searchParams.get('nft_holder') === 'true'
        : undefined,
      membership_plan_id: searchParams.get('membership_plan_id') || undefined,
      membership_status: searchParams.get('membership_status') as
        | 'active'
        | 'paused'
        | 'cancelled'
        | undefined,
      search: searchParams.get('search') || undefined,
    }

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'u.created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    const { data, error, count } = await getAllUsers(filters, pagination)

    if (error) {
      return serverErrorResponse(error)
    }

    const totalPages = Math.ceil(count / pagination.limit)

    return successResponse(
      data,
      'Users retrieved successfully',
      {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        totalPages,
      }
    )
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return serverErrorResponse('Failed to fetch users')
  }
}

export const GET = withAdminAuth(handleGet)