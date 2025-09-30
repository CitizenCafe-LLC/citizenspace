import type { NextRequest } from 'next/server'
import { successResponse, badRequestResponse, serverErrorResponse } from '@/lib/api/response'
import { safeValidateParams, paginationSchema } from '@/lib/api/validation'
import { getMeetingRooms } from '@/lib/db/repositories/workspace.repository'

/**
 * GET /api/workspaces/meeting-rooms
 * List all meeting rooms (workspaces with resource_category = 'meeting-room')
 *
 * Query Parameters:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - sortBy: field to sort by (default: created_at)
 * - sortOrder: asc or desc (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = Object.fromEntries(searchParams.entries())

    // Validate pagination
    const paginationValidation = safeValidateParams(paginationSchema, params)
    if (!paginationValidation.success) {
      return badRequestResponse(`Invalid pagination: ${paginationValidation.error}`)
    }

    const pagination = paginationValidation.data

    // Fetch meeting rooms from database
    const { data, error, count } = await getMeetingRooms(pagination)

    if (error) {
      console.error('Error fetching meeting rooms:', error)
      return serverErrorResponse('Failed to fetch meeting rooms')
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / pagination.limit)

    return successResponse(data, 'Meeting rooms retrieved successfully', {
      page: pagination.page,
      limit: pagination.limit,
      total: count,
      totalPages,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/workspaces/meeting-rooms:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}
