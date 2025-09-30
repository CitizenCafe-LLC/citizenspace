/**
 * Admin Workspace Detail API
 * PATCH /api/admin/workspaces/:id - Update workspace
 * DELETE /api/admin/workspaces/:id - Soft delete workspace
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
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from '@/lib/db/repositories/workspace.repository'
import { createAuditLog, createChangeObject } from '@/lib/db/repositories/audit.repository'

/**
 * PATCH - Update workspace (admin only)
 */
async function handlePatch(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    // Get existing workspace for audit trail
    const existing = await getWorkspaceById(id)
    if (existing.error || !existing.data) {
      return notFoundResponse('Workspace not found')
    }

    // Validate and prepare update data
    const allowedFields = [
      'name',
      'type',
      'resource_category',
      'description',
      'capacity',
      'base_price_hourly',
      'requires_credits',
      'min_duration',
      'max_duration',
      'amenities',
      'images',
      'available',
      'floor_location',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Parse numeric fields
        if (field === 'capacity' && typeof body[field] !== 'number') {
          updateData[field] = parseInt(body[field])
        } else if (field === 'base_price_hourly' && typeof body[field] !== 'number') {
          updateData[field] = parseFloat(body[field])
        } else if (
          ['min_duration', 'max_duration'].includes(field) &&
          typeof body[field] !== 'number'
        ) {
          updateData[field] = parseInt(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse('No valid fields to update')
    }

    // Validate resource_category if provided
    if (
      updateData.resource_category &&
      !['desk', 'meeting-room'].includes(updateData.resource_category)
    ) {
      return badRequestResponse('resource_category must be "desk" or "meeting-room"')
    }

    // Update workspace
    const { data, error } = await updateWorkspace(id, updateData)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to update workspace')
    }

    // Create audit log
    const changes = createChangeObject(existing.data, data)
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'update',
      resource_type: 'workspace',
      resource_id: id,
      changes,
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return successResponse(data, 'Workspace updated successfully')
  } catch (error) {
    console.error('Error in PATCH /api/admin/workspaces/:id:', error)
    return serverErrorResponse('Failed to update workspace')
  }
}

/**
 * DELETE - Soft delete workspace (admin only)
 */
async function handleDelete(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params

    const { data, error } = await deleteWorkspace(id)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to delete workspace')
    }

    // Create audit log
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'delete',
      resource_type: 'workspace',
      resource_id: id,
      changes: { deleted: true },
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return successResponse(data, 'Workspace deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/admin/workspaces/:id:', error)
    return serverErrorResponse('Failed to delete workspace')
  }
}

export const PATCH = withAdminAuth(handlePatch)
export const DELETE = withAdminAuth(handleDelete)