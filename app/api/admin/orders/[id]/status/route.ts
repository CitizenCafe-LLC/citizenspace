/**
 * Admin Order Status Update API
 * PATCH /api/admin/orders/:id/status - Update order status (staff/admin)
 */

import type { NextRequest } from 'next/server'
import { withStaffOrAdminAuth, getClientIp, getUserAgent } from '@/lib/auth/rbac'
import {
  successResponse,
  serverErrorResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api/response'
import {
  getOrderById,
  updateOrderStatus,
  type OrderStatus,
} from '@/lib/db/repositories/orders.repository'
import { createAuditLog } from '@/lib/db/repositories/audit.repository'

async function handlePatch(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    // Validate status
    const validStatuses: OrderStatus[] = [
      'pending',
      'preparing',
      'ready',
      'completed',
      'cancelled',
    ]

    if (!body.status || !validStatuses.includes(body.status)) {
      return badRequestResponse(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      )
    }

    // Check if order exists
    const existing = await getOrderById(id)
    if (existing.error || !existing.data) {
      return notFoundResponse('Order not found')
    }

    // Update status
    const { data, error } = await updateOrderStatus(id, body.status)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to update order status')
    }

    // Create audit log
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'status_change',
      resource_type: 'order',
      resource_id: id,
      changes: {
        from: existing.data.status,
        to: body.status,
      },
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return successResponse(data, 'Order status updated successfully')
  } catch (error) {
    console.error('Error in PATCH /api/admin/orders/:id/status:', error)
    return serverErrorResponse('Failed to update order status')
  }
}

export const PATCH = withStaffOrAdminAuth(handlePatch)