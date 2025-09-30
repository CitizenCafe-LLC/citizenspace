/**
 * Integration tests for Menu Management APIs
 * Tests cover all menu endpoints with various scenarios
 * Target: 80%+ code coverage
 */

import { NextRequest } from 'next/server'
import { GET as getMenuItems } from '@/app/api/menu/route'
import { GET as getMenuByCategory } from '@/app/api/menu/[category]/route'
import { GET as getMenuItemById } from '@/app/api/menu/items/[id]/route'

// Mock repository functions
jest.mock('@/lib/db/repositories/menu.repository')
jest.mock('@/lib/auth/middleware')

import * as menuRepo from '@/lib/db/repositories/menu.repository'
import * as authMiddleware from '@/lib/auth/middleware'

// Helper to create mock NextRequest
function createMockRequest(url: string): NextRequest {
  const fullUrl = new URL(url, 'http://localhost:3000')
  return {
    nextUrl: {
      searchParams: fullUrl.searchParams,
    },
    url: fullUrl.toString(),
    method: 'GET',
    headers: new Headers(),
  } as NextRequest
}

// Mock menu data
const mockMenuItems = [
  {
    id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    title: 'House Blend',
    description: 'Our signature medium roast',
    price: 3.5,
    category: 'coffee' as const,
    dietary_tags: [],
    image: null,
    orderable: true,
    featured: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e',
    title: 'Almond Croissant',
    description: 'Buttery pastry with almond cream',
    price: 3.75,
    category: 'pastries' as const,
    dietary_tags: ['vegetarian'],
    image: null,
    orderable: true,
    featured: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

const mockMenuItemsWithPricing = mockMenuItems.map(item => ({
  ...item,
  originalPrice: item.price,
  discountApplied: false,
}))

describe('GET /api/menu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all menu items successfully', async () => {
    const mockGetMenuItems = menuRepo.getMenuItemsWithPricing as jest.MockedFunction<
      typeof menuRepo.getMenuItemsWithPricing
    >
    mockGetMenuItems.mockResolvedValue({
      data: mockMenuItemsWithPricing,
      error: null,
      count: 2,
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu')
    const response = await getMenuItems(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.meta).toEqual({
      page: 1,
      limit: 100,
      total: 2,
      totalPages: 1,
    })
  })

  it('should filter menu items by category', async () => {
    const coffeeItems = [mockMenuItemsWithPricing[0]]

    const mockGetMenuItems = menuRepo.getMenuItemsWithPricing as jest.MockedFunction<
      typeof menuRepo.getMenuItemsWithPricing
    >
    mockGetMenuItems.mockResolvedValue({
      data: coffeeItems,
      error: null,
      count: 1,
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu?category=coffee')
    const response = await getMenuItems(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].category).toBe('coffee')
  })

  it('should return featured items only', async () => {
    const featuredItems = [mockMenuItemsWithPricing[1]]

    const mockGetMenuItems = menuRepo.getMenuItemsWithPricing as jest.MockedFunction<
      typeof menuRepo.getMenuItemsWithPricing
    >
    mockGetMenuItems.mockResolvedValue({
      data: featuredItems,
      error: null,
      count: 1,
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu?featured=true')
    const response = await getMenuItems(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].featured).toBe(true)
  })

  it('should apply NFT holder discount when authenticated', async () => {
    const nftItems = mockMenuItems.map(item => ({
      ...item,
      originalPrice: item.price,
      price: item.price * 0.9, // 10% discount
      discountApplied: true,
    }))

    const mockGetMenuItems = menuRepo.getMenuItemsWithPricing as jest.MockedFunction<
      typeof menuRepo.getMenuItemsWithPricing
    >
    mockGetMenuItems.mockResolvedValue({
      data: nftItems,
      error: null,
      count: 2,
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
      nftHolder: true,
    })

    const request = createMockRequest('/api/menu')
    const response = await getMenuItems(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data[0].discountApplied).toBe(true)
    expect(data.data[0].price).toBeLessThan(data.data[0].originalPrice)
  })

  it('should reject invalid category', async () => {
    const request = createMockRequest('/api/menu?category=invalid')
    const response = await getMenuItems(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid category')
  })

  it('should handle pagination correctly', async () => {
    const mockGetMenuItems = menuRepo.getMenuItemsWithPricing as jest.MockedFunction<
      typeof menuRepo.getMenuItemsWithPricing
    >
    mockGetMenuItems.mockResolvedValue({
      data: [mockMenuItemsWithPricing[0]],
      error: null,
      count: 2,
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu?page=2&limit=1')
    const response = await getMenuItems(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.meta.page).toBe(2)
    expect(data.meta.limit).toBe(1)
    expect(data.meta.totalPages).toBe(2)
  })

  it('should handle database errors gracefully', async () => {
    const mockGetMenuItems = menuRepo.getMenuItemsWithPricing as jest.MockedFunction<
      typeof menuRepo.getMenuItemsWithPricing
    >
    mockGetMenuItems.mockResolvedValue({
      data: null,
      error: 'Database connection failed',
      count: 0,
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu')
    const response = await getMenuItems(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to fetch menu items')
  })
})

describe('GET /api/menu/:category', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return menu items for valid category', async () => {
    const coffeeItems = [mockMenuItemsWithPricing[0]]

    const mockGetMenuItems = menuRepo.getMenuItemsWithPricing as jest.MockedFunction<
      typeof menuRepo.getMenuItemsWithPricing
    >
    mockGetMenuItems.mockResolvedValue({
      data: coffeeItems,
      error: null,
      count: 1,
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu/coffee')
    const response = await getMenuByCategory(request, { params: { category: 'coffee' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].category).toBe('coffee')
  })

  it('should reject invalid category', async () => {
    const request = createMockRequest('/api/menu/invalid')
    const response = await getMenuByCategory(request, { params: { category: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid category')
  })

  it('should handle all valid categories', async () => {
    const categories = ['coffee', 'tea', 'pastries', 'meals']

    for (const category of categories) {
      const mockGetMenuItems = menuRepo.getMenuItemsWithPricing as jest.MockedFunction<
        typeof menuRepo.getMenuItemsWithPricing
      >
      mockGetMenuItems.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
        typeof authMiddleware.getCurrentUser
      >
      mockGetCurrentUser.mockResolvedValue(null)

      const request = createMockRequest(`/api/menu/${category}`)
      const response = await getMenuByCategory(request, { params: { category } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    }
  })
})

describe('GET /api/menu/items/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return menu item by ID', async () => {
    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: mockMenuItems[0],
      error: null,
    })

    const mockCalculatePrice = menuRepo.calculateMenuItemPrice as jest.MockedFunction<
      typeof menuRepo.calculateMenuItemPrice
    >
    mockCalculatePrice.mockReturnValue(3.5)

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu/items/a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d')
    const response = await getMenuItemById(request, {
      params: { id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d' },
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d')
    expect(data.data.title).toBe('House Blend')
  })

  it('should apply NFT discount for authenticated NFT holder', async () => {
    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: mockMenuItems[0],
      error: null,
    })

    const mockCalculatePrice = menuRepo.calculateMenuItemPrice as jest.MockedFunction<
      typeof menuRepo.calculateMenuItemPrice
    >
    mockCalculatePrice.mockReturnValue(3.15) // 10% off 3.50

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
      nftHolder: true,
    })

    const request = createMockRequest('/api/menu/items/a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d')
    const response = await getMenuItemById(request, {
      params: { id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d' },
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.discountApplied).toBe(true)
    expect(data.data.price).toBe(3.15)
    expect(data.data.originalPrice).toBe(3.5)
  })

  it('should return 404 for non-existent item', async () => {
    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: null,
      error: 'Menu item not found',
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu/items/00000000-0000-0000-0000-000000000000')
    const response = await getMenuItemById(request, {
      params: { id: '00000000-0000-0000-0000-000000000000' },
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Menu item not found')
  })

  it('should reject invalid UUID format', async () => {
    const request = createMockRequest('/api/menu/items/invalid-id')
    const response = await getMenuItemById(request, {
      params: { id: 'invalid-id' },
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid menu item ID format')
  })

  it('should handle database errors', async () => {
    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: null,
      error: 'Database error',
    })

    const mockGetCurrentUser = authMiddleware.getCurrentUser as jest.MockedFunction<
      typeof authMiddleware.getCurrentUser
    >
    mockGetCurrentUser.mockResolvedValue(null)

    const request = createMockRequest('/api/menu/items/a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d')
    const response = await getMenuItemById(request, {
      params: { id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d' },
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})