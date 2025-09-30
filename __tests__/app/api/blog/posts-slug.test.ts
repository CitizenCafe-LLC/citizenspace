/**
 * Blog Post by Slug API Endpoint Tests
 * Tests for GET /api/blog/posts/[slug]
 */

import { GET } from '@/app/api/blog/posts/[slug]/route'
import { NextRequest } from 'next/server'
import * as blogRepository from '@/lib/db/repositories/blog.repository'

// Mock the blog repository
jest.mock('@/lib/db/repositories/blog.repository')

const mockGetBlogPostBySlug = blogRepository.getBlogPostBySlug as jest.MockedFunction<
  typeof blogRepository.getBlogPostBySlug
>

describe('GET /api/blog/posts/[slug]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (slug: string) => {
    const url = new URL(`http://localhost:3000/api/blog/posts/${slug}`)
    return new NextRequest(url)
  }

  it('should fetch a blog post by slug', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      excerpt: 'This is a test excerpt',
      content: 'This is the full test content',
      image: 'https://example.com/image.jpg',
      author_name: 'John Doe',
      author_avatar: '/avatars/john.jpg',
      author_bio: 'Software Developer',
      tags: ['Tech', 'Programming'],
      published_at: '2025-01-15T10:00:00Z',
      reading_time: 8,
      published: true,
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
    }

    mockGetBlogPostBySlug.mockResolvedValueOnce({
      data: mockPost,
      error: null,
    })

    const request = createMockRequest('test-blog-post')
    const response = await GET(request, { params: { slug: 'test-blog-post' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockPost)
    expect(mockGetBlogPostBySlug).toHaveBeenCalledWith('test-blog-post', false)
  })

  it('should return 404 when post not found', async () => {
    mockGetBlogPostBySlug.mockResolvedValueOnce({
      data: null,
      error: 'Blog post not found',
    })

    const request = createMockRequest('non-existent-post')
    const response = await GET(request, { params: { slug: 'non-existent-post' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Blog post not found or not published')
  })

  it('should return 404 when post is unpublished', async () => {
    mockGetBlogPostBySlug.mockResolvedValueOnce({
      data: null,
      error: 'Blog post not found',
    })

    const request = createMockRequest('unpublished-post')
    const response = await GET(request, { params: { slug: 'unpublished-post' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should return 404 when data is null', async () => {
    mockGetBlogPostBySlug.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    const request = createMockRequest('test-post')
    const response = await GET(request, { params: { slug: 'test-post' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should handle database errors', async () => {
    mockGetBlogPostBySlug.mockResolvedValueOnce({
      data: null,
      error: 'Database connection failed',
    })

    const request = createMockRequest('test-post')
    const response = await GET(request, { params: { slug: 'test-post' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Database connection failed')
  })

  it('should handle unexpected errors', async () => {
    mockGetBlogPostBySlug.mockRejectedValueOnce(new Error('Unexpected error'))

    const request = createMockRequest('test-post')
    const response = await GET(request, { params: { slug: 'test-post' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Unexpected error')
  })

  it('should only fetch published posts', async () => {
    const mockPost = {
      id: '1',
      title: 'Published Post',
      slug: 'published-post',
      published: true,
    }

    mockGetBlogPostBySlug.mockResolvedValueOnce({
      data: mockPost,
      error: null,
    })

    const request = createMockRequest('published-post')
    await GET(request, { params: { slug: 'published-post' } })

    // Verify that the second parameter (includeUnpublished) is false
    expect(mockGetBlogPostBySlug).toHaveBeenCalledWith('published-post', false)
  })

  it('should handle slugs with special characters', async () => {
    const mockPost = {
      id: '1',
      title: 'Test & Special Characters',
      slug: 'test-special-characters',
      published: true,
    }

    mockGetBlogPostBySlug.mockResolvedValueOnce({
      data: mockPost,
      error: null,
    })

    const request = createMockRequest('test-special-characters')
    const response = await GET(request, { params: { slug: 'test-special-characters' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toEqual(mockPost)
  })

  it('should include all blog post fields in response', async () => {
    const mockPost = {
      id: '1',
      title: 'Complete Post',
      slug: 'complete-post',
      excerpt: 'Excerpt',
      content: 'Full content',
      image: 'https://example.com/image.jpg',
      author_name: 'Author Name',
      author_avatar: '/avatar.jpg',
      author_bio: 'Author bio',
      tags: ['tag1', 'tag2'],
      published_at: '2025-01-01T00:00:00Z',
      reading_time: 5,
      published: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    mockGetBlogPostBySlug.mockResolvedValueOnce({
      data: mockPost,
      error: null,
    })

    const request = createMockRequest('complete-post')
    const response = await GET(request, { params: { slug: 'complete-post' } })
    const data = await response.json()

    expect(data.data).toHaveProperty('id')
    expect(data.data).toHaveProperty('title')
    expect(data.data).toHaveProperty('slug')
    expect(data.data).toHaveProperty('excerpt')
    expect(data.data).toHaveProperty('content')
    expect(data.data).toHaveProperty('author_name')
    expect(data.data).toHaveProperty('tags')
    expect(data.data).toHaveProperty('published_at')
    expect(data.data).toHaveProperty('reading_time')
  })
})