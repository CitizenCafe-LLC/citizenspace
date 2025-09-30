/**
 * Blog Posts API Endpoint Tests
 * Tests for GET /api/blog/posts
 */

import { GET } from '@/app/api/blog/posts/route'
import { NextRequest } from 'next/server'
import * as blogRepository from '@/lib/db/repositories/blog.repository'

// Mock the blog repository
jest.mock('@/lib/db/repositories/blog.repository')

const mockGetAllBlogPosts = blogRepository.getAllBlogPosts as jest.MockedFunction<
  typeof blogRepository.getAllBlogPosts
>
const mockSearchBlogPosts = blogRepository.searchBlogPosts as jest.MockedFunction<
  typeof blogRepository.searchBlogPosts
>
const mockGetPostsByTag = blogRepository.getPostsByTag as jest.MockedFunction<
  typeof blogRepository.getPostsByTag
>
const mockGetPostsByCategory = blogRepository.getPostsByCategory as jest.MockedFunction<
  typeof blogRepository.getPostsByCategory
>

describe('GET /api/blog/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost:3000/api/blog/posts')
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return new NextRequest(url)
  }

  it('should fetch all blog posts with default pagination', async () => {
    const mockPosts = [
      {
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
      },
    ]

    mockGetAllBlogPosts.mockResolvedValueOnce({
      data: mockPosts,
      error: null,
      count: 1,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockPosts)
    expect(data.meta).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })
    expect(mockGetAllBlogPosts).toHaveBeenCalledWith(
      expect.objectContaining({ published: true }),
      expect.objectContaining({ page: 1, limit: 20 })
    )
  })

  it('should handle pagination parameters', async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 50,
    })

    const request = createMockRequest({ page: '2', limit: '10' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.meta).toEqual({
      page: 2,
      limit: 10,
      total: 50,
      totalPages: 5,
    })
    expect(mockGetAllBlogPosts).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ page: 2, limit: 10 })
    )
  })

  it('should filter by tag', async () => {
    mockGetPostsByTag.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 0,
    })

    const request = createMockRequest({ tag: 'Coworking' })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockGetPostsByTag).toHaveBeenCalledWith(
      'Coworking',
      expect.any(Object)
    )
  })

  it('should filter by category', async () => {
    mockGetPostsByCategory.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 0,
    })

    const request = createMockRequest({ category: 'Business' })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockGetPostsByCategory).toHaveBeenCalledWith(
      'Business',
      expect.any(Object)
    )
  })

  it('should perform full-text search', async () => {
    mockSearchBlogPosts.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 0,
    })

    const request = createMockRequest({ search: 'coworking productivity' })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockSearchBlogPosts).toHaveBeenCalledWith(
      'coworking productivity',
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('should handle custom sort parameters', async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 0,
    })

    const request = createMockRequest({ sortBy: 'reading_time', sortOrder: 'asc' })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockGetAllBlogPosts).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ sortBy: 'reading_time', sortOrder: 'asc' })
    )
  })

  it('should validate limit parameter', async () => {
    const request = createMockRequest({ limit: '150' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Limit must be between 1 and 100')
  })

  it('should validate page parameter', async () => {
    const request = createMockRequest({ page: '0' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Page must be greater than 0')
  })

  it('should validate sortOrder parameter', async () => {
    const request = createMockRequest({ sortOrder: 'invalid' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Sort order must be either "asc" or "desc"')
  })

  it('should validate sortBy parameter', async () => {
    const request = createMockRequest({ sortBy: 'invalid_field' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid sortBy field')
  })

  it('should handle repository errors', async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({
      data: null,
      error: 'Database connection failed',
      count: 0,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database connection failed')
  })

  it('should handle unexpected errors', async () => {
    mockGetAllBlogPosts.mockRejectedValueOnce(new Error('Unexpected error'))

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Unexpected error')
  })

  it('should calculate total pages correctly', async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 25,
    })

    const request = createMockRequest({ limit: '10' })
    const response = await GET(request)
    const data = await response.json()

    expect(data.meta.totalPages).toBe(3) // 25 items / 10 per page = 3 pages
  })

  it('should handle empty results', async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({
      data: [],
      error: null,
      count: 0,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual([])
    expect(data.meta.total).toBe(0)
    expect(data.meta.totalPages).toBe(0)
  })
})