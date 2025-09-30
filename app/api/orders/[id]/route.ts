import type { NextRequest } from 'next/server'
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/response'
import { getOrderById } from '@/lib/db/repositories/orders.repository'
import { withAuth } from '@/lib/auth/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/orders/:id
 * Get a single order by ID
 *
 * Authentication: Required
 *
 * Path Parameters:
 * - id: UUID of the order
 *
 * Response:
 * - Returns order details with items and menu item information
 * - Users can only view their own orders
 * - Staff/admin can view any order
 */
export const GET = withAuth(async (request: NextRequest, { user, params }: any) => {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return badRequestResponse('Invalid order ID format')
    }

    // Fetch order
    const { data: order, error } = await getOrderById(id)

    if (error) {
      console.error('Error fetching order:', error)
      if (error === 'Order not found') {
        return notFoundResponse('Order not found')
      }
      return serverErrorResponse('Failed to fetch order')
    }

    if (!order) {
      return notFoundResponse('Order not found')
    }

    // Check authorization
    const isStaff = user.role === 'staff' || user.role === 'admin'
    const isOwner = order.user_id === user.userId

    if (!isStaff && !isOwner) {
      return forbiddenResponse('You do not have permission to view this order')
    }

    return successResponse(order, 'Order retrieved successfully')
  } catch (error) {
    console.error('Unexpected error in GET /api/orders/:id:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
})