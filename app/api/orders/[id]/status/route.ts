import type { NextRequest } from 'next/server'
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/response'
import { updateOrderStatus, type OrderStatus } from '@/lib/db/repositories/orders.repository'
import { withStaffAuth } from '@/lib/auth/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/orders/:id/status
 * Update order status (staff/admin only)
 *
 * Authentication: Required (staff or admin role)
 *
 * Path Parameters:
 * - id: UUID of the order
 *
 * Request Body:
 * {
 *   status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
 * }
 *
 * Response:
 * - Returns updated order
 *
 * Status Transitions:
 * - pending -> preparing, cancelled
 * - preparing -> ready, cancelled
 * - ready -> completed, cancelled
 * - completed -> (final state)
 * - cancelled -> (final state)
 */
export const PATCH = withStaffAuth(async (request: NextRequest, { params }: any) => {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return badRequestResponse('Invalid order ID format')
    }

    // Parse request body
    const body = await request.json()

    if (!body.status) {
      return badRequestResponse('Status is required')
    }

    // Validate status
    const validStatuses: OrderStatus[] = [
      'pending',
      'preparing',
      'ready',
      'completed',
      'cancelled',
    ]

    if (!validStatuses.includes(body.status)) {
      return badRequestResponse(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      )
    }

    // Update order status
    const { data: order, error } = await updateOrderStatus(id, body.status)

    if (error) {
      console.error('Error updating order status:', error)
      if (error === 'Order not found') {
        return notFoundResponse('Order not found')
      }
      return serverErrorResponse('Failed to update order status')
    }

    if (!order) {
      return notFoundResponse('Order not found')
    }

    return successResponse(order, `Order status updated to ${body.status}`)
  } catch (error) {
    console.error('Unexpected error in PATCH /api/orders/:id/status:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
})