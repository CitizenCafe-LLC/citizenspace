/**
 * GET /api/events - List all events with filters
 * Query params: upcoming, past, tags, limit, offset
 */

import { NextRequest } from 'next/server'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api/response'
import { getAllEvents } from '@/lib/db/repositories/events.repository'
import { optionalAuth } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    // Get optional user authentication (for showing user RSVP status)
    const user = await optionalAuth(request)

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const upcoming = searchParams.get('upcoming') === 'true'
    const past = searchParams.get('past') === 'true'
    const tagsParam = searchParams.get('tags')
    const hasCapacity = searchParams.get('has_capacity') === 'true'
    const isFree = searchParams.get('is_free') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Parse tags if provided (comma-separated)
    const tags = tagsParam ? tagsParam.split(',').map((tag) => tag.trim()) : undefined

    // Validate pagination parameters
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return errorResponse('Invalid limit parameter. Must be between 1 and 100', 400)
    }

    if (isNaN(offset) || offset < 0) {
      return errorResponse('Invalid offset parameter. Must be 0 or greater', 400)
    }

    // Build filters
    const filters = {
      upcoming: upcoming || undefined,
      past: past || undefined,
      tags,
      has_capacity: hasCapacity || undefined,
      is_free: isFree ? true : undefined,
    }

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) => filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
    )

    // Fetch events
    const result = await getAllEvents(
      Object.keys(filters).length > 0 ? filters : undefined,
      { limit, offset },
      user?.userId
    )

    if (result.error) {
      console.error('Error fetching events:', result.error)
      return serverErrorResponse('Failed to fetch events')
    }

    // Calculate total count for pagination (simplified - using returned count)
    const total = result.data?.length || 0
    const hasMore = total === limit

    return successResponse(
      result.data || [],
      'Events fetched successfully',
      {
        limit,
        offset,
        total,
        hasMore,
      }
    )
  } catch (error) {
    console.error('Error in GET /api/events:', error)
    return serverErrorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    )
  }
}