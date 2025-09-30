import { NextRequest } from 'next/server'
import { getBlogPostBySlug } from '@/lib/db/repositories/blog.repository'
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api/response'

/**
 * GET /api/blog/posts/:slug
 * Retrieve a single blog post by its slug
 *
 * Parameters:
 * - slug: Blog post slug (string)
 *
 * Response:
 * - 200: Blog post details
 * - 404: Blog post not found or not published
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      return notFoundResponse('Invalid blog post slug')
    }

    // Fetch blog post by slug (only published posts)
    const result = await getBlogPostBySlug(slug, false)

    if (result.error) {
      console.error('Error fetching blog post by slug:', result.error)

      // Return 404 if post not found
      if (result.error === 'Blog post not found') {
        return notFoundResponse('Blog post not found or not published')
      }

      // Return 500 for other errors
      return errorResponse(result.error, 500)
    }

    if (!result.data) {
      return notFoundResponse('Blog post not found or not published')
    }

    // Return blog post
    return successResponse(result.data, 'Blog post retrieved successfully')
  } catch (error) {
    console.error('Error in GET /api/blog/posts/[slug]:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch blog post',
      500
    )
  }
}