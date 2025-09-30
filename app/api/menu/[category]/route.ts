import type { NextRequest } from 'next/server'
import { successResponse, badRequestResponse, serverErrorResponse } from '@/lib/api/response'
import { getMenuItemsWithPricing } from '@/lib/db/repositories/menu.repository'
import { getCurrentUser } from '@/lib/auth/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/menu/:category
 * List menu items filtered by category
 *
 * Path Parameters:
 * - category: coffee, tea, pastries, or meals
 *
 * Query Parameters:
 * - featured: boolean filter for featured items
 * - page: page number (default: 1)
 * - limit: items per page (default: 100)
 *
 * Authentication: Optional (shows NFT pricing if authenticated)
 *
 * Response:
 * - Returns menu items for the specified category
 * - Pricing adjusted for NFT holders if authenticated
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params

    // Validate category
    const validCategories = ['coffee', 'tea', 'pastries', 'meals']
    if (!validCategories.includes(category)) {
      return badRequestResponse(
        `Invalid category '${category}'. Must be one of: ${validCategories.join(', ')}`
      )
    }

    const searchParams = request.nextUrl.searchParams

    // Parse filters
    const featured = searchParams.get('featured')
      ? searchParams.get('featured') === 'true'
      : undefined

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)

    if (page < 1 || limit < 1) {
      return badRequestResponse('Page and limit must be positive integers')
    }

    // Build filters
    const filters: any = {
      category: category as 'coffee' | 'tea' | 'pastries' | 'meals',
      orderable: true,
    }
    if (featured !== undefined) {
      filters.featured = featured
    }

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
      `${category.charAt(0).toUpperCase() + category.slice(1)} menu items retrieved successfully`,
      {
        page,
        limit,
        total: count,
        totalPages,
      }
    )
  } catch (error) {
    console.error('Unexpected error in GET /api/menu/:category:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}