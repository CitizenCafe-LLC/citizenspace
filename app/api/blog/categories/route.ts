import { NextRequest } from 'next/server'
import { getBlogCategories } from '@/lib/db/repositories/blog.repository'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api/response'

/**
 * GET /api/blog/categories
 * Retrieve all blog categories with post counts
 *
 * Query Parameters:
 * - sortBy: Sort by 'post_count' or 'name' (default: post_count)
 *
 * Response:
 * - 200: List of blog categories
 * - 400: Invalid query parameters
 * - 500: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const sortBy = searchParams.get('sortBy') || 'post_count'

    // Validate sortBy parameter
    if (sortBy !== 'post_count' && sortBy !== 'name') {
      return badRequestResponse('sortBy must be either "post_count" or "name"')
    }

    // Fetch categories
    const result = await getBlogCategories(sortBy as 'post_count' | 'name')

    if (result.error) {
      console.error('Error fetching blog categories:', result.error)
      return errorResponse(result.error, 500)
    }

    // Return categories
    return successResponse(result.data, 'Blog categories retrieved successfully')
  } catch (error) {
    console.error('Error in GET /api/blog/categories:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch blog categories',
      500
    )
  }
}