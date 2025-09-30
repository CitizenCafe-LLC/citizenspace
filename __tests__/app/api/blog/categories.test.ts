/**
 * Blog Categories API Endpoint Tests
 * Tests for GET /api/blog/categories
 */

import { GET } from '@/app/api/blog/categories/route'
import { NextRequest } from 'next/server'
import * as blogRepository from '@/lib/db/repositories/blog.repository'

// Mock the blog repository
jest.mock('@/lib/db/repositories/blog.repository')

const mockGetBlogCategories = blogRepository.getBlogCategories as jest.MockedFunction<
  typeof blogRepository.getBlogCategories
>

describe('GET /api/blog/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost:3000/api/blog/categories')
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return new NextRequest(url)
  }

  it('should fetch all categories sorted by post count (default)', async () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Coworking',
        slug: 'coworking',
        post_count: 15,
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Productivity',
        slug: 'productivity',
        post_count: 10,
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: '3',
        name: 'Business',
        slug: 'business',
        post_count: 5,
        created_at: '2025-01-01T00:00:00Z',
      },
    ]

    mockGetBlogCategories.mockResolvedValueOnce({
      data: mockCategories,
      error: null,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockCategories)
    expect(mockGetBlogCategories).toHaveBeenCalledWith('post_count')
  })

  it('should sort categories by name when specified', async () => {
    const mockCategories = [
      {
        id: '3',
        name: 'Business',
        slug: 'business',
        post_count: 5,
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: '1',
        name: 'Coworking',
        slug: 'coworking',
        post_count: 15,
        created_at: '2025-01-01T00:00:00Z',
      },
    ]

    mockGetBlogCategories.mockResolvedValueOnce({
      data: mockCategories,
      error: null,
    })

    const request = createMockRequest({ sortBy: 'name' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual(mockCategories)
    expect(mockGetBlogCategories).toHaveBeenCalledWith('name')
  })

  it('should validate sortBy parameter', async () => {
    const request = createMockRequest({ sortBy: 'invalid' })
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('sortBy must be either "post_count" or "name"')
    expect(mockGetBlogCategories).not.toHaveBeenCalled()
  })

  it('should handle empty category list', async () => {
    mockGetBlogCategories.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual([])
  })

  it('should handle repository errors', async () => {
    mockGetBlogCategories.mockResolvedValueOnce({
      data: null,
      error: 'Database connection failed',
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database connection failed')
  })

  it('should handle unexpected errors', async () => {
    mockGetBlogCategories.mockRejectedValueOnce(new Error('Unexpected error'))

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Unexpected error')
  })

  it('should include all category fields in response', async () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Coworking',
        slug: 'coworking',
        post_count: 15,
        created_at: '2025-01-01T00:00:00Z',
      },
    ]

    mockGetBlogCategories.mockResolvedValueOnce({
      data: mockCategories,
      error: null,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.data[0]).toHaveProperty('id')
    expect(data.data[0]).toHaveProperty('name')
    expect(data.data[0]).toHaveProperty('slug')
    expect(data.data[0]).toHaveProperty('post_count')
    expect(data.data[0]).toHaveProperty('created_at')
  })

  it('should return categories with post counts', async () => {
    const mockCategories = [
      { id: '1', name: 'Category 1', slug: 'cat-1', post_count: 10, created_at: '2025-01-01' },
      { id: '2', name: 'Category 2', slug: 'cat-2', post_count: 0, created_at: '2025-01-01' },
    ]

    mockGetBlogCategories.mockResolvedValueOnce({
      data: mockCategories,
      error: null,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.data[0].post_count).toBe(10)
    expect(data.data[1].post_count).toBe(0)
  })

  it('should handle sortBy=post_count explicitly', async () => {
    mockGetBlogCategories.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const request = createMockRequest({ sortBy: 'post_count' })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockGetBlogCategories).toHaveBeenCalledWith('post_count')
  })

  it('should include success message in response', async () => {
    mockGetBlogCategories.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(data.message).toBe('Blog categories retrieved successfully')
  })
})