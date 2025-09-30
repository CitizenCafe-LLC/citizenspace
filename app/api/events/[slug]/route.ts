/**
 * GET /api/events/:slug - Get single event details
 * Returns full event information with RSVP count and user's RSVP status
 */

import { NextRequest } from 'next/server'
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response'
import { getEventBySlug } from '@/lib/db/repositories/events.repository'
import { optionalAuth } from '@/middleware/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return notFoundResponse('Event slug is required')
    }

    // Get optional user authentication (for showing user RSVP status)
    const user = await optionalAuth(request)

    // Fetch event by slug
    const result = await getEventBySlug(slug, user?.userId)

    if (result.error) {
      console.error('Error fetching event:', result.error)
      return serverErrorResponse('Failed to fetch event')
    }

    if (!result.data) {
      return notFoundResponse('Event not found')
    }

    return successResponse(result.data, 'Event fetched successfully')
  } catch (error) {
    console.error('Error in GET /api/events/:slug:', error)
    return serverErrorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    )
  }
}