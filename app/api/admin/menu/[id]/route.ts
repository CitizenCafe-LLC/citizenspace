/**
 * Admin Menu Item Detail API
 * PATCH /api/admin/menu/:id - Update menu item
 * DELETE /api/admin/menu/:id - Delete menu item
 */

import type { NextRequest } from 'next/server'
import { withAdminAuth, getClientIp, getUserAgent } from '@/lib/auth/rbac'
import {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response'
import {
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from '@/lib/db/repositories/menu.repository'
import { createAuditLog, createChangeObject } from '@/lib/db/repositories/audit.repository'

/**
 * PATCH - Update menu item (admin only)
 */
async function handlePatch(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    // Get existing menu item for audit trail
    const existing = await getMenuItemById(id)
    if (existing.error || !existing.data) {
      return notFoundResponse('Menu item not found')
    }

    // Validate and prepare update data
    const allowedFields = [
      'title',
      'description',
      'price',
      'category',
      'dietary_tags',
      'image',
      'orderable',
      'featured',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'price') {
          updateData[field] = parseFloat(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse('No valid fields to update')
    }

    // Validate category if provided
    if (
      updateData.category &&
      !['coffee', 'tea', 'pastries', 'meals'].includes(updateData.category)
    ) {
      return badRequestResponse('Invalid category. Must be: coffee, tea, pastries, or meals')
    }

    // Update menu item
    const { data, error } = await updateMenuItem(id, updateData)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to update menu item')
    }

    // Create audit log
    const changes = createChangeObject(existing.data, data)
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'update',
      resource_type: 'menu_item',
      resource_id: id,
      changes,
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return successResponse(data, 'Menu item updated successfully')
  } catch (error) {
    console.error('Error in PATCH /api/admin/menu/:id:', error)
    return serverErrorResponse('Failed to update menu item')
  }
}

/**
 * DELETE - Delete menu item (admin only)
 */
async function handleDelete(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params

    // TODO: Check if menu item is in active orders before deletion
    // For now, we'll allow deletion

    const { success, error } = await deleteMenuItem(id)

    if (error || !success) {
      return serverErrorResponse(error || 'Failed to delete menu item')
    }

    // Create audit log
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'delete',
      resource_type: 'menu_item',
      resource_id: id,
      changes: { deleted: true },
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return successResponse({ id }, 'Menu item deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/admin/menu/:id:', error)
    return serverErrorResponse('Failed to delete menu item')
  }
}

export const PATCH = withAdminAuth(handlePatch)
export const DELETE = withAdminAuth(handleDelete)