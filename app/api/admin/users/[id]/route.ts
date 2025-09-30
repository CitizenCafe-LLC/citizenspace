/**
 * Admin User Detail API
 * GET /api/admin/users/:id - Get single user with full details
 * PATCH /api/admin/users/:id - Update user
 * DELETE /api/admin/users/:id - Soft delete user
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
  getUserByIdAdmin,
  updateUser,
  deleteUser,
} from '@/lib/db/repositories/users.repository'
import { createAuditLog, createChangeObject } from '@/lib/db/repositories/audit.repository'
import type { UserRole } from '@/lib/auth/rbac'

/**
 * GET - Get user by ID (admin only)
 */
async function handleGet(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    const { data, error } = await getUserByIdAdmin(id)

    if (error || !data) {
      return notFoundResponse(error || 'User not found')
    }

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = data as any

    return successResponse(userWithoutPassword, 'User retrieved successfully')
  } catch (error) {
    console.error('Error in GET /api/admin/users/:id:', error)
    return serverErrorResponse('Failed to fetch user')
  }
}

/**
 * PATCH - Update user (admin only)
 */
async function handlePatch(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    // Get existing user for audit trail
    const existing = await getUserByIdAdmin(id)
    if (existing.error || !existing.data) {
      return notFoundResponse('User not found')
    }

    // Validate update data
    const allowedFields = [
      'email',
      'full_name',
      'phone',
      'role',
      'nft_holder',
      'nft_token_id',
      'membership_plan_id',
      'membership_status',
      'wallet_address',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse('No valid fields to update')
    }

    // Validate role if provided
    if (updateData.role && !['user', 'staff', 'admin'].includes(updateData.role)) {
      return badRequestResponse('Invalid role. Must be: user, staff, or admin')
    }

    // Prevent self-demotion from admin
    if (
      context.user.userId === id &&
      updateData.role &&
      updateData.role !== 'admin'
    ) {
      return badRequestResponse('Cannot change your own admin role')
    }

    // Update user
    const { data, error } = await updateUser(id, updateData)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to update user')
    }

    // Create audit log
    const changes = createChangeObject(existing.data, data)
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'update',
      resource_type: 'user',
      resource_id: id,
      changes,
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = data as any

    return successResponse(userWithoutPassword, 'User updated successfully')
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/:id:', error)
    return serverErrorResponse('Failed to update user')
  }
}

/**
 * DELETE - Soft delete user (admin only)
 */
async function handleDelete(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params

    // Prevent self-deletion
    if (context.user.userId === id) {
      return badRequestResponse('Cannot delete your own account')
    }

    const { data, error } = await deleteUser(id)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to delete user')
    }

    // Create audit log
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'delete',
      resource_type: 'user',
      resource_id: id,
      changes: { deleted: true },
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return successResponse(data, 'User deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/:id:', error)
    return serverErrorResponse('Failed to delete user')
  }
}

export const GET = withAdminAuth(handleGet)
export const PATCH = withAdminAuth(handlePatch)
export const DELETE = withAdminAuth(handleDelete)