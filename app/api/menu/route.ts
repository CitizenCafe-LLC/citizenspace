import type { NextRequest } from 'next/server'
import { successResponse, badRequestResponse, serverErrorResponse } from '@/lib/api/response'
import { getAllMenuItems, getMenuItemsWithPricing } from '@/lib/db/repositories/menu.repository'
import { getCurrentUser } from '@/lib/auth/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/menu
 * List all menu items with optional filtering
 *
 * Query Parameters:
 * - category: filter by category (coffee, tea, pastries, meals)
 * - featured: boolean filter for featured items
 * - orderable: boolean filter for orderable items (default: true)
 * - page: page number (default: 1)
 * - limit: items per page (default: 100)
 *
 * Authentication: Optional (shows NFT pricing if authenticated)
 *
 * Response:
 * - Returns menu items with pricing adjusted for NFT holders if authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse filters
    const category = searchParams.get('category') as
      | 'coffee'
      | 'tea'
      | 'pastries'
      | 'meals'
      | null
    const featured = searchParams.get('featured')
      ? searchParams.get('featured') === 'true'
      : undefined
    const orderable = searchParams.get('orderable')
      ? searchParams.get('orderable') === 'true'
      : true

    // Validate category if provided
    if (category && !['coffee', 'tea', 'pastries', 'meals'].includes(category)) {
      return badRequestResponse('Invalid category. Must be one of: coffee, tea, pastries, meals')
    }

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)

    if (page < 1 || limit < 1) {
      return badRequestResponse('Page and limit must be positive integers')
    }

    // Build filters
    const filters: any = { orderable }
    if (category) filters.category = category
    if (featured !== undefined) filters.featured = featured

    const pagination = { page, limit }

    // Check if user is authenticated (optional)
    const user = await getCurrentUser(request)
    const isNftHolder = user?.nftHolder || false

    // Fetch menu items with pricing
    const { data, error, count } = await getMenuItemsWithPricing(isNftHolder, filters, pagination)

    if (error) {
      console.error('Error fetching menu items:', error)
      return serverErrorResponse('Failed to fetch menu items')
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit)

    return successResponse(
      data,
      'Menu items retrieved successfully',
      {
        page,
        limit,
        total: count,
        totalPages,
      }
    )
  } catch (error) {
    console.error('Unexpected error in GET /api/menu:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}