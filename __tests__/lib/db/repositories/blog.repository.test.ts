/**
 * Blog Repository Tests
 * Comprehensive tests for blog database operations with 80%+ coverage
 */

import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  searchBlogPosts,
  getPostsByTag,
  getPostsByCategory,
  getBlogCategories,
  getCategoryBySlug,
  updateCategoryCounts,
  getRecentBlogPosts,
  getFeaturedBlogPosts,
  getAllBlogTags,
} from '@/lib/db/repositories/blog.repository'
import { executeQuery, executeQuerySingle } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Blog Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllBlogPosts', () => {
    it('should fetch all published blog posts with default pagination', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post 1',
          slug: 'test-post-1',
          excerpt: 'Test excerpt 1',
          content: 'Test content 1',
          author_name: 'Author 1',
          tags: ['tag1'],
          published: true,
          published_at: '2025-01-01',
          reading_time: 5,
        },
      ]

      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '1' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: mockPosts, error: null })

      const result = await getAllBlogPosts()

      expect(result.data).toEqual(mockPosts)
      expect(result.error).toBeNull()
      expect(result.count).toBe(1)
      expect(mockExecuteQuery).toHaveBeenCalled()
    })

    it('should filter by tag', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '1' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getAllBlogPosts({ tag: 'coworking' })

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('tags @>'),
        expect.any(Array)
      )
    })

    it('should filter by category', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '0' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getAllBlogPosts({ category: 'Business' })

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalled()
    })

    it('should support full-text search', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '1' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getAllBlogPosts({ search: 'coworking productivity' })

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('plainto_tsquery'),
        expect.any(Array)
      )
    })

    it('should handle pagination parameters', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '100' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getAllBlogPosts(
        {},
        { page: 2, limit: 10, sortBy: 'reading_time', sortOrder: 'asc' }
      )

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.arrayContaining([10, 10]) // limit and offset
      )
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: null,
        error: 'Database connection failed',
      })

      const result = await getAllBlogPosts()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database connection failed')
      expect(result.count).toBe(0)
    })

    it('should default to published posts only', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '5' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      await getAllBlogPosts()

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('published = true'),
        expect.any(Array)
      )
    })

    it('should allow fetching unpublished posts', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '2' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      await getAllBlogPosts({ published: false })

      expect(mockExecuteQuery).toHaveBeenCalled()
      // Should not include published = true filter
    })
  })

  describe('getBlogPostBySlug', () => {
    it('should fetch a published blog post by slug', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        author_name: 'Author',
        tags: ['tag1'],
        published: true,
        published_at: '2025-01-01',
        reading_time: 5,
      }

      mockExecuteQuerySingle.mockResolvedValueOnce({ data: mockPost, error: null })

      const result = await getBlogPostBySlug('test-post')

      expect(result.data).toEqual(mockPost)
      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('published = true'),
        ['test-post']
      )
    })

    it('should return error when post not found', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: null, error: null })

      const result = await getBlogPostBySlug('non-existent-post')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Blog post not found')
    })

    it('should fetch unpublished post when flag is set', async () => {
      const mockPost = {
        id: '1',
        slug: 'draft-post',
        published: false,
      }

      mockExecuteQuerySingle.mockResolvedValueOnce({ data: mockPost, error: null })

      const result = await getBlogPostBySlug('draft-post', true)

      expect(result.data).toEqual(mockPost)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE slug = $1'),
        ['draft-post']
      )
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: null,
        error: 'Database query failed',
      })

      const result = await getBlogPostBySlug('test-post')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Database query failed')
    })
  })

  describe('getBlogPostById', () => {
    it('should fetch a blog post by ID', async () => {
      const mockPost = {
        id: 'abc-123',
        title: 'Test Post',
        published: true,
      }

      mockExecuteQuerySingle.mockResolvedValueOnce({ data: mockPost, error: null })

      const result = await getBlogPostById('abc-123')

      expect(result.data).toEqual(mockPost)
      expect(result.error).toBeNull()
    })

    it('should return error when post not found', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: null, error: null })

      const result = await getBlogPostById('non-existent-id')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Blog post not found')
    })
  })

  describe('searchBlogPosts', () => {
    it('should perform full-text search with ranking', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'Coworking Space Tips',
          rank: 0.5,
        },
      ]

      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '1' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: mockResults, error: null })

      const result = await searchBlogPosts('coworking')

      expect(result.data).toEqual(mockResults)
      expect(result.count).toBe(1)
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ts_rank'),
        expect.any(Array)
      )
    })

    it('should support additional filters with search', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '0' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await searchBlogPosts('productivity', { tag: 'Business' })

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalled()
    })

    it('should handle pagination in search results', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '50' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await searchBlogPosts('test', {}, { page: 2, limit: 10 })

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.any(Array)
      )
    })
  })

  describe('getPostsByTag', () => {
    it('should fetch posts filtered by tag', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '3' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getPostsByTag('Coworking')

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalled()
    })
  })

  describe('getPostsByCategory', () => {
    it('should fetch posts filtered by category', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '5' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getPostsByCategory('Business')

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalled()
    })
  })

  describe('getBlogCategories', () => {
    it('should fetch all categories sorted by post count', async () => {
      const mockCategories = [
        { id: '1', name: 'Coworking', slug: 'coworking', post_count: 10 },
        { id: '2', name: 'Productivity', slug: 'productivity', post_count: 5 },
      ]

      mockExecuteQuery.mockResolvedValueOnce({ data: mockCategories, error: null })

      const result = await getBlogCategories('post_count')

      expect(result.data).toEqual(mockCategories)
      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY post_count DESC'),
        undefined
      )
    })

    it('should fetch categories sorted by name', async () => {
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getBlogCategories('name')

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY name ASC'),
        undefined
      )
    })

    it('should handle database errors', async () => {
      mockExecuteQuery.mockResolvedValueOnce({ data: null, error: 'Connection error' })

      const result = await getBlogCategories()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Connection error')
    })
  })

  describe('getCategoryBySlug', () => {
    it('should fetch a category by slug', async () => {
      const mockCategory = {
        id: '1',
        name: 'Coworking',
        slug: 'coworking',
        post_count: 15,
      }

      mockExecuteQuerySingle.mockResolvedValueOnce({ data: mockCategory, error: null })

      const result = await getCategoryBySlug('coworking')

      expect(result.data).toEqual(mockCategory)
      expect(result.error).toBeNull()
    })

    it('should return error when category not found', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: null, error: null })

      const result = await getCategoryBySlug('non-existent')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Category not found')
    })
  })

  describe('updateCategoryCounts', () => {
    it('should update category post counts', async () => {
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await updateCategoryCounts()

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('update_blog_category_counts'),
        undefined
      )
    })

    it('should handle errors when updating counts', async () => {
      mockExecuteQuery.mockResolvedValueOnce({ data: null, error: 'Update failed' })

      const result = await updateCategoryCounts()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })

  describe('getRecentBlogPosts', () => {
    it('should fetch recent posts with default limit', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '5' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getRecentBlogPosts()

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY published_at DESC'),
        expect.arrayContaining([5, 0])
      )
    })

    it('should accept custom limit', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({ data: { count: '3' }, error: null })
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getRecentBlogPosts(3)

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([3, 0])
      )
    })
  })

  describe('getFeaturedBlogPosts', () => {
    it('should fetch featured posts', async () => {
      const mockPosts = [
        { id: '1', title: 'Featured 1' },
        { id: '2', title: 'Featured 2' },
        { id: '3', title: 'Featured 3' },
      ]

      mockExecuteQuery.mockResolvedValueOnce({ data: mockPosts, error: null })

      const result = await getFeaturedBlogPosts(3)

      expect(result.data).toEqual(mockPosts)
      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(expect.any(String), [3])
    })
  })

  describe('getAllBlogTags', () => {
    it('should fetch all unique tags from published posts', async () => {
      const mockTags = [
        { tag: 'Coworking' },
        { tag: 'Productivity' },
        { tag: 'Business' },
      ]

      mockExecuteQuery.mockResolvedValueOnce({ data: mockTags, error: null })

      const result = await getAllBlogTags()

      expect(result.data).toEqual(['Coworking', 'Productivity', 'Business'])
      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('jsonb_array_elements_text'),
        undefined
      )
    })

    it('should handle empty tag list', async () => {
      mockExecuteQuery.mockResolvedValueOnce({ data: [], error: null })

      const result = await getAllBlogTags()

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuery.mockResolvedValueOnce({ data: null, error: 'Query failed' })

      const result = await getAllBlogTags()

      expect(result.data).toBeNull()
      expect(result.error).toBe('Query failed')
    })
  })
})