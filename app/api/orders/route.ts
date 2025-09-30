import type { NextRequest } from 'next/server'
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response'
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  type CreateOrderData,
  type OrderStatus,
} from '@/lib/db/repositories/orders.repository'
import { getMenuItemById } from '@/lib/db/repositories/menu.repository'
import { withAuth, authenticateRequest } from '@/lib/auth/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * POST /api/orders
 * Create a new order
 *
 * Authentication: Required
 *
 * Request Body:
 * {
 *   items: [
 *     {
 *       menu_item_id: string (UUID),
 *       quantity: number (positive integer)
 *     }
 *   ],
 *   special_instructions?: string
 * }
 *
 * Response:
 * - Returns created order with items and total pricing
 * - NFT holders automatically receive 10% discount
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json()

    // Validate request body
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return badRequestResponse('Order must contain at least one item')
    }

    // Validate each item
    const itemsWithPrices: Array<{
      menu_item_id: string
      quantity: number
      unit_price: number
    }> = []

    for (const item of body.items) {
      if (!item.menu_item_id || typeof item.menu_item_id !== 'string') {
        return badRequestResponse('Each item must have a valid menu_item_id')
      }

      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        return badRequestResponse('Each item must have a positive quantity')
      }

      // Fetch menu item to get current price
      const { data: menuItem, error } = await getMenuItemById(item.menu_item_id)

      if (error || !menuItem) {
        return badRequestResponse(`Invalid menu item: ${item.menu_item_id}`)
      }

      if (!menuItem.orderable) {
        return badRequestResponse(`Menu item '${menuItem.title}' is not currently orderable`)
      }

      itemsWithPrices.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItem.price,
      })
    }

    // Validate special instructions length
    if (body.special_instructions && body.special_instructions.length > 500) {
      return badRequestResponse('Special instructions must be 500 characters or less')
    }

    // Create order
    const orderData: CreateOrderData = {
      user_id: user.userId,
      items: itemsWithPrices,
      special_instructions: body.special_instructions,
      is_nft_holder: user.nftHolder,
    }

    const { data: order, error: orderError } = await createOrder(orderData)

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return serverErrorResponse('Failed to create order')
    }

    return createdResponse(order, 'Order created successfully')
  } catch (error) {
    console.error('Unexpected error in POST /api/orders:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
})

/**
 * GET /api/orders
 * Get orders for the authenticated user or all orders (staff/admin)
 *
 * Authentication: Required
 *
 * Query Parameters:
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 50)
 * - status: filter by order status (optional, staff/admin only)
 *
 * Response:
 * - Returns paginated list of orders with items
 * - Regular users see only their own orders
 * - Staff/admin can see all orders and filter by status
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request)

    if (!authResult.authenticated || !authResult.user) {
      return unauthorizedResponse()
    }

    const { user } = authResult
    const searchParams = request.nextUrl.searchParams

    // Parse pagination
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 50)

    const pagination = {
      page,
      limit,
      sortBy: 'created_at',
      sortOrder: 'desc' as const,
    }

    // Check if user is staff/admin
    const isStaff = user.role === 'staff' || user.role === 'admin'

    // If staff/admin, allow viewing all orders with status filter
    if (isStaff) {
      const statusFilter = searchParams.get('status') as OrderStatus | null

      if (
        statusFilter &&
        !['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(statusFilter)
      ) {
        return badRequestResponse('Invalid status filter')
      }

      const { data, error, count } = await getAllOrders(pagination, statusFilter || undefined)

      if (error) {
        console.error('Error fetching orders:', error)
        return serverErrorResponse('Failed to fetch orders')
      }

      const totalPages = Math.ceil(count / limit)

      return successResponse(data, 'Orders retrieved successfully', {
        page,
        limit,
        total: count,
        totalPages,
      })
    }

    // Regular users only see their own orders
    const { data, error, count } = await getUserOrders(user.userId, pagination)

    if (error) {
      console.error('Error fetching user orders:', error)
      return serverErrorResponse('Failed to fetch orders')
    }

    const totalPages = Math.ceil(count / limit)

    return successResponse(data, 'Orders retrieved successfully', {
      page,
      limit,
      total: count,
      totalPages,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/orders:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}