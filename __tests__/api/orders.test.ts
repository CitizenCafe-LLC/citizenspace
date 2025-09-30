/**
 * Integration tests for Orders Management APIs
 * Tests cover all order endpoints with various scenarios
 * Target: 80%+ code coverage
 */

import { NextRequest } from 'next/server'
import { POST as createOrder, GET as getOrders } from '@/app/api/orders/route'
import { GET as getOrderById } from '@/app/api/orders/[id]/route'
import { PATCH as updateOrderStatus } from '@/app/api/orders/[id]/status/route'

// Mock repository functions
jest.mock('@/lib/db/repositories/orders.repository')
jest.mock('@/lib/db/repositories/menu.repository')
jest.mock('@/lib/auth/middleware')

import * as ordersRepo from '@/lib/db/repositories/orders.repository'
import * as menuRepo from '@/lib/db/repositories/menu.repository'
import * as authMiddleware from '@/lib/auth/middleware'

// Helper to create mock NextRequest
function createMockRequest(
  url: string,
  method: string = 'GET',
  body?: any,
  token?: string
): NextRequest {
  const fullUrl = new URL(url, 'http://localhost:3000')
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (body) {
    headers.set('Content-Type', 'application/json')
  }

  return {
    nextUrl: {
      searchParams: fullUrl.searchParams,
    },
    url: fullUrl.toString(),
    method,
    headers,
    json: async () => body,
  } as any
}

// Mock data
const mockMenuItem = {
  id: 'menu-item-1',
  title: 'House Blend',
  price: 3.5,
  orderable: true,
}

const mockOrder = {
  id: 'order-123',
  user_id: 'user-123',
  subtotal: 7.0,
  discount_amount: 0,
  nft_discount_applied: false,
  processing_fee: 0.5,
  total_price: 7.5,
  status: 'pending' as const,
  payment_status: 'pending' as const,
  payment_intent_id: null,
  special_instructions: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  items: [
    {
      id: 'item-1',
      order_id: 'order-123',
      menu_item_id: 'menu-item-1',
      quantity: 2,
      unit_price: 3.5,
      subtotal: 7.0,
      created_at: '2025-01-01T00:00:00Z',
      menu_item: {
        id: 'menu-item-1',
        title: 'House Blend',
        category: 'coffee',
      },
    },
  ],
}

const mockUser = {
  userId: 'user-123',
  email: 'test@example.com',
  role: 'user' as const,
  nftHolder: false,
}

const mockStaffUser = {
  userId: 'staff-123',
  email: 'staff@example.com',
  role: 'staff' as const,
  nftHolder: false,
}

describe('POST /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create order successfully for authenticated user', async () => {
    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: mockMenuItem,
      error: null,
    })

    const mockCreateOrder = ordersRepo.createOrder as jest.MockedFunction<
      typeof ordersRepo.createOrder
    >
    mockCreateOrder.mockResolvedValue({
      data: mockOrder,
      error: null,
    })

    const requestBody = {
      items: [
        {
          menu_item_id: 'menu-item-1',
          quantity: 2,
        },
      ],
      special_instructions: 'Extra hot please',
    }

    const request = createMockRequest('/api/orders', 'POST', requestBody, 'valid-token')

    // Mock the withAuth wrapper by calling the handler directly with user context
    const { POST } = await import('@/app/api/orders/route')
    const handler = POST as any
    const response = await handler(request, { user: mockUser })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('id')
    expect(data.data.items).toHaveLength(1)
  })

  it('should apply NFT discount for NFT holder', async () => {
    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: mockMenuItem,
      error: null,
    })

    const orderWithDiscount = {
      ...mockOrder,
      discount_amount: 0.7, // 10% of 7.0
      nft_discount_applied: true,
      total_price: 6.83, // 7.0 - 0.7 + processing fee
    }

    const mockCreateOrder = ordersRepo.createOrder as jest.MockedFunction<
      typeof ordersRepo.createOrder
    >
    mockCreateOrder.mockResolvedValue({
      data: orderWithDiscount,
      error: null,
    })

    const requestBody = {
      items: [
        {
          menu_item_id: 'menu-item-1',
          quantity: 2,
        },
      ],
    }

    const nftUser = { ...mockUser, nftHolder: true }
    const request = createMockRequest('/api/orders', 'POST', requestBody, 'valid-token')

    const { POST } = await import('@/app/api/orders/route')
    const handler = POST as any
    const response = await handler(request, { user: nftUser })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data.nft_discount_applied).toBe(true)
    expect(data.data.discount_amount).toBeGreaterThan(0)
  })

  it('should reject order with empty items', async () => {
    const requestBody = {
      items: [],
    }

    const request = createMockRequest('/api/orders', 'POST', requestBody, 'valid-token')

    const { POST } = await import('@/app/api/orders/route')
    const handler = POST as any
    const response = await handler(request, { user: mockUser })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('at least one item')
  })

  it('should reject order with invalid menu item', async () => {
    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: null,
      error: 'Menu item not found',
    })

    const requestBody = {
      items: [
        {
          menu_item_id: 'invalid-item',
          quantity: 1,
        },
      ],
    }

    const request = createMockRequest('/api/orders', 'POST', requestBody, 'valid-token')

    const { POST } = await import('@/app/api/orders/route')
    const handler = POST as any
    const response = await handler(request, { user: mockUser })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid menu item')
  })

  it('should reject order with non-orderable item', async () => {
    const nonOrderableItem = { ...mockMenuItem, orderable: false }

    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: nonOrderableItem,
      error: null,
    })

    const requestBody = {
      items: [
        {
          menu_item_id: 'menu-item-1',
          quantity: 1,
        },
      ],
    }

    const request = createMockRequest('/api/orders', 'POST', requestBody, 'valid-token')

    const { POST } = await import('@/app/api/orders/route')
    const handler = POST as any
    const response = await handler(request, { user: mockUser })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('not currently orderable')
  })

  it('should reject order with invalid quantity', async () => {
    const requestBody = {
      items: [
        {
          menu_item_id: 'menu-item-1',
          quantity: 0,
        },
      ],
    }

    const request = createMockRequest('/api/orders', 'POST', requestBody, 'valid-token')

    const { POST } = await import('@/app/api/orders/route')
    const handler = POST as any
    const response = await handler(request, { user: mockUser })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('positive quantity')
  })

  it('should reject special instructions over 500 characters', async () => {
    const mockGetMenuItem = menuRepo.getMenuItemById as jest.MockedFunction<
      typeof menuRepo.getMenuItemById
    >
    mockGetMenuItem.mockResolvedValue({
      data: mockMenuItem,
      error: null,
    })

    const requestBody = {
      items: [
        {
          menu_item_id: 'menu-item-1',
          quantity: 1,
        },
      ],
      special_instructions: 'a'.repeat(501),
    }

    const request = createMockRequest('/api/orders', 'POST', requestBody, 'valid-token')

    const { POST } = await import('@/app/api/orders/route')
    const handler = POST as any
    const response = await handler(request, { user: mockUser })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('500 characters')
  })
})

describe('GET /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return user orders for regular user', async () => {
    const mockAuthenticateRequest = authMiddleware.authenticateRequest as jest.MockedFunction<
      typeof authMiddleware.authenticateRequest
    >
    mockAuthenticateRequest.mockResolvedValue({
      authenticated: true,
      user: mockUser,
    })

    const mockGetUserOrders = ordersRepo.getUserOrders as jest.MockedFunction<
      typeof ordersRepo.getUserOrders
    >
    mockGetUserOrders.mockResolvedValue({
      data: [mockOrder],
      error: null,
      count: 1,
    })

    const request = createMockRequest('/api/orders', 'GET', null, 'valid-token')
    const response = await getOrders(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(mockGetUserOrders).toHaveBeenCalledWith('user-123', expect.any(Object))
  })

  it('should return all orders for staff', async () => {
    const mockAuthenticateRequest = authMiddleware.authenticateRequest as jest.MockedFunction<
      typeof authMiddleware.authenticateRequest
    >
    mockAuthenticateRequest.mockResolvedValue({
      authenticated: true,
      user: mockStaffUser,
    })

    const mockGetAllOrders = ordersRepo.getAllOrders as jest.MockedFunction<
      typeof ordersRepo.getAllOrders
    >
    mockGetAllOrders.mockResolvedValue({
      data: [mockOrder],
      error: null,
      count: 1,
    })

    const request = createMockRequest('/api/orders', 'GET', null, 'valid-token')
    const response = await getOrders(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(mockGetAllOrders).toHaveBeenCalled()
  })

  it('should filter orders by status for staff', async () => {
    const mockAuthenticateRequest = authMiddleware.authenticateRequest as jest.MockedFunction<
      typeof authMiddleware.authenticateRequest
    >
    mockAuthenticateRequest.mockResolvedValue({
      authenticated: true,
      user: mockStaffUser,
    })

    const mockGetAllOrders = ordersRepo.getAllOrders as jest.MockedFunction<
      typeof ordersRepo.getAllOrders
    >
    mockGetAllOrders.mockResolvedValue({
      data: [mockOrder],
      error: null,
      count: 1,
    })

    const request = createMockRequest('/api/orders?status=pending', 'GET', null, 'valid-token')
    const response = await getOrders(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockGetAllOrders).toHaveBeenCalledWith(expect.any(Object), 'pending')
  })

  it('should require authentication', async () => {
    const mockAuthenticateRequest = authMiddleware.authenticateRequest as jest.MockedFunction<
      typeof authMiddleware.authenticateRequest
    >
    mockAuthenticateRequest.mockResolvedValue({
      authenticated: false,
      error: 'No token provided',
    })

    const request = createMockRequest('/api/orders', 'GET')
    const response = await getOrders(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('should handle pagination', async () => {
    const mockAuthenticateRequest = authMiddleware.authenticateRequest as jest.MockedFunction<
      typeof authMiddleware.authenticateRequest
    >
    mockAuthenticateRequest.mockResolvedValue({
      authenticated: true,
      user: mockUser,
    })

    const mockGetUserOrders = ordersRepo.getUserOrders as jest.MockedFunction<
      typeof ordersRepo.getUserOrders
    >
    mockGetUserOrders.mockResolvedValue({
      data: [mockOrder],
      error: null,
      count: 10,
    })

    const request = createMockRequest('/api/orders?page=2&limit=5', 'GET', null, 'valid-token')
    const response = await getOrders(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.meta.page).toBe(2)
    expect(data.meta.limit).toBe(5)
    expect(data.meta.totalPages).toBe(2)
  })
})

describe('GET /api/orders/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return order for owner', async () => {
    const mockGetOrderById = ordersRepo.getOrderById as jest.MockedFunction<
      typeof ordersRepo.getOrderById
    >
    mockGetOrderById.mockResolvedValue({
      data: mockOrder,
      error: null,
    })

    const request = createMockRequest('/api/orders/order-123', 'GET', null, 'valid-token')

    const { GET } = await import('@/app/api/orders/[id]/route')
    const handler = GET as any
    const response = await handler(request, { user: mockUser, params: { id: 'order-123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('order-123')
  })

  it('should allow staff to view any order', async () => {
    const mockGetOrderById = ordersRepo.getOrderById as jest.MockedFunction<
      typeof ordersRepo.getOrderById
    >
    mockGetOrderById.mockResolvedValue({
      data: mockOrder,
      error: null,
    })

    const request = createMockRequest('/api/orders/order-123', 'GET', null, 'staff-token')

    const { GET } = await import('@/app/api/orders/[id]/route')
    const handler = GET as any
    const response = await handler(request, { user: mockStaffUser, params: { id: 'order-123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should deny access to other users orders', async () => {
    const mockGetOrderById = ordersRepo.getOrderById as jest.MockedFunction<
      typeof ordersRepo.getOrderById
    >
    mockGetOrderById.mockResolvedValue({
      data: mockOrder,
      error: null,
    })

    const otherUser = { ...mockUser, userId: 'other-user' }
    const request = createMockRequest('/api/orders/order-123', 'GET', null, 'other-token')

    const { GET } = await import('@/app/api/orders/[id]/route')
    const handler = GET as any
    const response = await handler(request, { user: otherUser, params: { id: 'order-123' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error).toContain('permission')
  })

  it('should return 404 for non-existent order', async () => {
    const mockGetOrderById = ordersRepo.getOrderById as jest.MockedFunction<
      typeof ordersRepo.getOrderById
    >
    mockGetOrderById.mockResolvedValue({
      data: null,
      error: 'Order not found',
    })

    const request = createMockRequest('/api/orders/invalid-id', 'GET', null, 'valid-token')

    const { GET } = await import('@/app/api/orders/[id]/route')
    const handler = GET as any
    const response = await handler(request, { user: mockUser, params: { id: 'invalid-id' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should reject invalid UUID format', async () => {
    const request = createMockRequest('/api/orders/invalid', 'GET', null, 'valid-token')

    const { GET } = await import('@/app/api/orders/[id]/route')
    const handler = GET as any
    const response = await handler(request, { user: mockUser, params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid order ID')
  })
})

describe('PATCH /api/orders/:id/status', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update order status for staff', async () => {
    const updatedOrder = { ...mockOrder, status: 'preparing' as const }

    const mockUpdateStatus = ordersRepo.updateOrderStatus as jest.MockedFunction<
      typeof ordersRepo.updateOrderStatus
    >
    mockUpdateStatus.mockResolvedValue({
      data: updatedOrder,
      error: null,
    })

    const requestBody = { status: 'preparing' }
    const request = createMockRequest('/api/orders/order-123/status', 'PATCH', requestBody, 'staff-token')

    const { PATCH } = await import('@/app/api/orders/[id]/status/route')
    const handler = PATCH as any
    const response = await handler(request, { user: mockStaffUser, params: { id: 'order-123' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.status).toBe('preparing')
  })

  it('should accept all valid status values', async () => {
    const statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled']

    for (const status of statuses) {
      const mockUpdateStatus = ordersRepo.updateOrderStatus as jest.MockedFunction<
        typeof ordersRepo.updateOrderStatus
      >
      mockUpdateStatus.mockResolvedValue({
        data: { ...mockOrder, status: status as any },
        error: null,
      })

      const requestBody = { status }
      const request = createMockRequest('/api/orders/order-123/status', 'PATCH', requestBody, 'staff-token')

      const { PATCH } = await import('@/app/api/orders/[id]/status/route')
      const handler = PATCH as any
      const response = await handler(request, { user: mockStaffUser, params: { id: 'order-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    }
  })

  it('should reject invalid status', async () => {
    const requestBody = { status: 'invalid' }
    const request = createMockRequest('/api/orders/order-123/status', 'PATCH', requestBody, 'staff-token')

    const { PATCH } = await import('@/app/api/orders/[id]/status/route')
    const handler = PATCH as any
    const response = await handler(request, { user: mockStaffUser, params: { id: 'order-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid status')
  })

  it('should require status in request body', async () => {
    const requestBody = {}
    const request = createMockRequest('/api/orders/order-123/status', 'PATCH', requestBody, 'staff-token')

    const { PATCH } = await import('@/app/api/orders/[id]/status/route')
    const handler = PATCH as any
    const response = await handler(request, { user: mockStaffUser, params: { id: 'order-123' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Status is required')
  })

  it('should return 404 for non-existent order', async () => {
    const mockUpdateStatus = ordersRepo.updateOrderStatus as jest.MockedFunction<
      typeof ordersRepo.updateOrderStatus
    >
    mockUpdateStatus.mockResolvedValue({
      data: null,
      error: 'Order not found',
    })

    const requestBody = { status: 'preparing' }
    const request = createMockRequest('/api/orders/invalid/status', 'PATCH', requestBody, 'staff-token')

    const { PATCH } = await import('@/app/api/orders/[id]/status/route')
    const handler = PATCH as any
    const response = await handler(request, { user: mockStaffUser, params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })
})