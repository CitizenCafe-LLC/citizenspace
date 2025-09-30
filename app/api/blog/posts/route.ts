import { NextRequest } from 'next/server'
import {
  getAllBlogPosts,
  searchBlogPosts,
  getPostsByTag,
  getPostsByCategory,
} from '@/lib/db/repositories/blog.repository'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api/response'

/**
 * GET /api/blog/posts
 * Retrieve all blog posts with optional filtering and pagination
 *
 * Query Parameters:
 * - tag: Filter by tag (string)
 * - category: Filter by category (string)
 * - search: Full-text search query (string)
 * - limit: Number of posts per page (default: 20)
 * - page: Page number (default: 1)
 * - sortBy: Sort field (default: published_at)
 * - sortOrder: Sort order (asc/desc, default: desc)
 *
 * Response:
 * - 200: List of blog posts with pagination metadata
 * - 400: Invalid query parameters
 * - 500: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const tag = searchParams.get('tag')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limitParam = searchParams.get('limit')
    const pageParam = searchParams.get('page')
    const sortBy = searchParams.get('sortBy') || 'published_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Validate pagination parameters
    const limit = limitParam ? parseInt(limitParam, 10) : 20
    const page = pageParam ? parseInt(pageParam, 10) : 1

    if (limit < 1 || limit > 100) {
      return badRequestResponse('Limit must be between 1 and 100')
    }

    if (page < 1) {
      return badRequestResponse('Page must be greater than 0')
    }

    // Validate sort order
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      return badRequestResponse('Sort order must be either "asc" or "desc"')
    }

    // Validate sort field
    const validSortFields = ['published_at', 'reading_time', 'title', 'created_at']
    if (!validSortFields.includes(sortBy)) {
      return badRequestResponse(
        `Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`
      )
    }

    // Build filters
    const filters = {
      tag: tag || undefined,
      category: category || undefined,
      search: search || undefined,
      published: true,
    }

    // Build pagination
    const pagination = {
      page,
      limit,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    }

    // Fetch posts based on filters
    let result

    if (search) {
      // Use full-text search if search query provided
      result = await searchBlogPosts(search, filters, pagination)
    } else if (tag) {
      // Filter by tag
      result = await getPostsByTag(tag, pagination)
    } else if (category) {
      // Filter by category
      result = await getPostsByCategory(category, pagination)
    } else {
      // Get all posts
      result = await getAllBlogPosts(filters, pagination)
    }

    if (result.error) {
      console.error('Error fetching blog posts:', result.error)
      return errorResponse(result.error, 500)
    }

    // Calculate total pages
    const totalPages = Math.ceil(result.count / limit)

    // Return response with pagination metadata
    return successResponse(
      result.data,
      'Blog posts retrieved successfully',
      {
        page,
        limit,
        total: result.count,
        totalPages,
      }
    )
  } catch (error) {
    console.error('Error in GET /api/blog/posts:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch blog posts',
      500
    )
  }
}