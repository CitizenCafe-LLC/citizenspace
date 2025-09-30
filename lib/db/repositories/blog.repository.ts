import { executeQuery, executeQuerySingle } from '../postgres'
import type {
  BlogPost,
  BlogCategory,
  BlogPostFilters,
  BlogSearchResult,
  PaginationParams,
} from '../types'

/**
 * Repository for blog-related database operations
 * Implements data access layer with proper error handling and full-text search
 */

/**
 * Get all blog posts with optional filtering and pagination
 * Supports filtering by tag, category, search query, and published status
 */
export async function getAllBlogPosts(filters?: BlogPostFilters, pagination?: PaginationParams) {
  try {
    const whereClauses: string[] = []
    const params: any[] = []
    let paramCount = 1

    // Default to published posts only unless explicitly filtering
    if (filters?.published !== false) {
      whereClauses.push(`published = true`)
    }

    // Filter by tag
    if (filters?.tag) {
      whereClauses.push(`tags @> $${paramCount}::jsonb`)
      params.push(JSON.stringify([filters.tag]))
      paramCount++
    }

    // Filter by category (categories are stored as tags)
    if (filters?.category) {
      whereClauses.push(`tags @> $${paramCount}::jsonb`)
      params.push(JSON.stringify([filters.category]))
      paramCount++
    }

    // Full-text search
    if (filters?.search) {
      whereClauses.push(
        `to_tsvector('english', title || ' ' || excerpt || ' ' || content) @@ plainto_tsquery('english', $${paramCount})`
      )
      params.push(filters.search)
      paramCount++
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Build ORDER BY clause
    const sortBy = pagination?.sortBy || 'published_at'
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC'

    // If searching, add relevance ranking
    let orderClause = ''
    if (filters?.search) {
      orderClause = `ORDER BY
        ts_rank(
          to_tsvector('english', title || ' ' || excerpt || ' ' || content),
          plainto_tsquery('english', $${params.length})
        ) DESC,
        ${sortBy} ${sortOrder}`
    } else {
      orderClause = `ORDER BY ${sortBy} ${sortOrder}`
    }

    // Build LIMIT and OFFSET
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit
    const limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`
    params.push(limit, offset)

    // Count total records
    const countQuery = `SELECT COUNT(*) FROM blog_posts ${whereClause}`
    const countResult = await executeQuerySingle<{ count: string }>(
      countQuery,
      params.slice(0, params.length - 2) // Exclude LIMIT and OFFSET params
    )

    if (countResult.error) {
      return { data: null, error: countResult.error, count: 0 }
    }

    const count = parseInt(countResult.data?.count || '0')

    // Fetch data
    const dataQuery = `
      SELECT * FROM blog_posts
      ${whereClause}
      ${orderClause}
      ${limitClause}
    `

    const result = await executeQuery<BlogPost>(dataQuery, params)

    if (result.error) {
      return { data: null, error: result.error, count: 0 }
    }

    return { data: result.data, error: null, count }
  } catch (error) {
    console.error('Error in getAllBlogPosts:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch blog posts',
      count: 0,
    }
  }
}

/**
 * Get blog post by slug
 * Returns null if post not found or not published
 */
export async function getBlogPostBySlug(slug: string, includeUnpublished: boolean = false) {
  try {
    const whereClause = includeUnpublished
      ? 'WHERE slug = $1'
      : 'WHERE slug = $1 AND published = true'

    const query = `SELECT * FROM blog_posts ${whereClause}`
    const result = await executeQuerySingle<BlogPost>(query, [slug])

    if (result.error) {
      console.error('Error fetching blog post by slug:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Blog post not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getBlogPostBySlug:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch blog post',
    }
  }
}

/**
 * Get blog post by ID
 */
export async function getBlogPostById(id: string, includeUnpublished: boolean = false) {
  try {
    const whereClause = includeUnpublished
      ? 'WHERE id = $1'
      : 'WHERE id = $1 AND published = true'

    const query = `SELECT * FROM blog_posts ${whereClause}`
    const result = await executeQuerySingle<BlogPost>(query, [id])

    if (result.error) {
      console.error('Error fetching blog post by ID:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Blog post not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getBlogPostById:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch blog post',
    }
  }
}

/**
 * Search blog posts using PostgreSQL full-text search
 * Returns posts ordered by relevance
 */
export async function searchBlogPosts(
  query: string,
  filters?: BlogPostFilters,
  pagination?: PaginationParams
) {
  try {
    // Use the database function for full-text search
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit

    const whereClauses: string[] = []
    const params: any[] = [query]
    let paramCount = 2

    // Additional filters
    if (filters?.tag) {
      whereClauses.push(`tags @> $${paramCount}::jsonb`)
      params.push(JSON.stringify([filters.tag]))
      paramCount++
    }

    if (filters?.category) {
      whereClauses.push(`tags @> $${paramCount}::jsonb`)
      params.push(JSON.stringify([filters.category]))
      paramCount++
    }

    const additionalWhere = whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : ''

    // Count total results
    const countQuery = `
      SELECT COUNT(*) FROM blog_posts
      WHERE published = true
      AND to_tsvector('english', title || ' ' || excerpt || ' ' || content) @@ plainto_tsquery('english', $1)
      ${additionalWhere}
    `
    const countResult = await executeQuerySingle<{ count: string }>(countQuery, params)

    if (countResult.error) {
      return { data: null, error: countResult.error, count: 0 }
    }

    const count = parseInt(countResult.data?.count || '0')

    // Fetch search results with ranking
    params.push(limit, offset)
    const searchQuery = `
      SELECT
        *,
        ts_rank(
          to_tsvector('english', title || ' ' || excerpt || ' ' || content),
          plainto_tsquery('english', $1)
        ) AS rank
      FROM blog_posts
      WHERE published = true
      AND to_tsvector('english', title || ' ' || excerpt || ' ' || content) @@ plainto_tsquery('english', $1)
      ${additionalWhere}
      ORDER BY rank DESC, published_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `

    const result = await executeQuery<BlogSearchResult>(searchQuery, params)

    if (result.error) {
      return { data: null, error: result.error, count: 0 }
    }

    return { data: result.data, error: null, count }
  } catch (error) {
    console.error('Error in searchBlogPosts:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to search blog posts',
      count: 0,
    }
  }
}

/**
 * Get posts by tag with pagination
 */
export async function getPostsByTag(tag: string, pagination?: PaginationParams) {
  return getAllBlogPosts({ tag, published: true }, pagination)
}

/**
 * Get posts by category with pagination
 */
export async function getPostsByCategory(category: string, pagination?: PaginationParams) {
  return getAllBlogPosts({ category, published: true }, pagination)
}

/**
 * Get all blog categories
 * Returns categories sorted by post count (descending) or name (ascending)
 */
export async function getBlogCategories(sortBy: 'post_count' | 'name' = 'post_count') {
  try {
    const orderClause = sortBy === 'post_count'
      ? 'ORDER BY post_count DESC, name ASC'
      : 'ORDER BY name ASC'

    const query = `SELECT * FROM blog_categories ${orderClause}`
    const result = await executeQuery<BlogCategory>(query)

    if (result.error) {
      console.error('Error fetching blog categories:', result.error)
      return { data: null, error: result.error }
    }

    return { data: result.data || [], error: null }
  } catch (error) {
    console.error('Error in getBlogCategories:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch blog categories',
    }
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  try {
    const query = 'SELECT * FROM blog_categories WHERE slug = $1'
    const result = await executeQuerySingle<BlogCategory>(query, [slug])

    if (result.error) {
      console.error('Error fetching category by slug:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Category not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getCategoryBySlug:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch category',
    }
  }
}

/**
 * Update category post counts
 * This is called by trigger but can also be called manually
 */
export async function updateCategoryCounts() {
  try {
    const query = 'SELECT update_blog_category_counts()'
    const result = await executeQuery(query)

    if (result.error) {
      console.error('Error updating category counts:', result.error)
      return { success: false, error: result.error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in updateCategoryCounts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category counts',
    }
  }
}

/**
 * Get recent blog posts
 * Convenience function for homepage or sidebar
 */
export async function getRecentBlogPosts(limit: number = 5) {
  return getAllBlogPosts(
    { published: true },
    { page: 1, limit, sortBy: 'published_at', sortOrder: 'desc' }
  )
}

/**
 * Get featured blog posts (by reading time or views)
 * Returns posts sorted by a specific metric
 */
export async function getFeaturedBlogPosts(limit: number = 3) {
  try {
    const query = `
      SELECT * FROM blog_posts
      WHERE published = true
      ORDER BY published_at DESC
      LIMIT $1
    `
    const result = await executeQuery<BlogPost>(query, [limit])

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getFeaturedBlogPosts:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch featured posts',
    }
  }
}

/**
 * Get all unique tags from published blog posts
 */
export async function getAllBlogTags() {
  try {
    const query = `
      SELECT DISTINCT jsonb_array_elements_text(tags) AS tag
      FROM blog_posts
      WHERE published = true
      ORDER BY tag ASC
    `
    const result = await executeQuery<{ tag: string }>(query)

    if (result.error) {
      return { data: null, error: result.error }
    }

    const tags = result.data?.map(row => row.tag) || []
    return { data: tags, error: null }
  } catch (error) {
    console.error('Error in getAllBlogTags:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch blog tags',
    }
  }
}