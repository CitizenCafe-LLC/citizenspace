/**
 * Admin Workspaces API
 * GET /api/admin/workspaces - List all workspaces
 * POST /api/admin/workspaces - Create new workspace
 */

import type { NextRequest } from 'next/server'
import { withStaffOrAdminAuth, withAdminAuth, getClientIp, getUserAgent } from '@/lib/auth/rbac'
import {
  successResponse,
  createdResponse,
  serverErrorResponse,
  badRequestResponse,
} from '@/lib/api/response'
import {
  getAllWorkspaces,
  createWorkspace,
} from '@/lib/db/repositories/workspace.repository'
import { createAuditLog } from '@/lib/db/repositories/audit.repository'

/**
 * GET - List all workspaces (staff/admin)
 */
async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      type: searchParams.get('type') as any,
      resource_category: searchParams.get('resource_category') as any,
      available: searchParams.get('available')
        ? searchParams.get('available') === 'true'
        : undefined,
    }

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    const { data, error, count } = await getAllWorkspaces(filters, pagination)

    if (error) {
      return serverErrorResponse(error)
    }

    const totalPages = Math.ceil(count / pagination.limit)

    return successResponse(
      data,
      'Workspaces retrieved successfully',
      {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        totalPages,
      }
    )
  } catch (error) {
    console.error('Error in GET /api/admin/workspaces:', error)
    return serverErrorResponse('Failed to fetch workspaces')
  }
}

/**
 * POST - Create new workspace (admin only)
 */
async function handlePost(
  request: NextRequest,
  context: { user: any }
) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'name',
      'type',
      'resource_category',
      'description',
      'capacity',
      'base_price_hourly',
      'floor_location',
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return badRequestResponse(`Missing required field: ${field}`)
      }
    }

    // Validate resource_category
    if (!['desk', 'meeting-room'].includes(body.resource_category)) {
      return badRequestResponse('resource_category must be "desk" or "meeting-room"')
    }

    // Set defaults
    const workspaceData = {
      name: body.name,
      type: body.type,
      resource_category: body.resource_category,
      description: body.description,
      capacity: parseInt(body.capacity),
      base_price_hourly: parseFloat(body.base_price_hourly),
      requires_credits: body.requires_credits !== undefined ? body.requires_credits : false,
      min_duration: body.min_duration || 1,
      max_duration: body.max_duration || 8,
      amenities: body.amenities || [],
      images: body.images || [],
      available: body.available !== undefined ? body.available : true,
      floor_location: body.floor_location,
    }

    const { data, error } = await createWorkspace(workspaceData)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to create workspace')
    }

    // Create audit log
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'create',
      resource_type: 'workspace',
      resource_id: data.id,
      changes: { created: workspaceData },
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return createdResponse(data, 'Workspace created successfully')
  } catch (error) {
    console.error('Error in POST /api/admin/workspaces:', error)
    return serverErrorResponse('Failed to create workspace')
  }
}

export const GET = withStaffOrAdminAuth(handleGet)
export const POST = withAdminAuth(handlePost)