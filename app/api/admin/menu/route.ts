/**
 * Admin Menu API
 * GET /api/admin/menu - List all menu items (including unpublished)
 * POST /api/admin/menu - Create new menu item
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
  getAllMenuItems,
  createMenuItem,
} from '@/lib/db/repositories/menu.repository'
import { createAuditLog } from '@/lib/db/repositories/audit.repository'

/**
 * GET - List all menu items (staff/admin)
 */
async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      category: searchParams.get('category') as any,
      orderable: searchParams.get('orderable')
        ? searchParams.get('orderable') === 'true'
        : undefined,
      featured: searchParams.get('featured')
        ? searchParams.get('featured') === 'true'
        : undefined,
    }

    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '100'),
      sortBy: searchParams.get('sortBy') || 'category, title',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    }

    const { data, error, count } = await getAllMenuItems(filters, pagination)

    if (error) {
      return serverErrorResponse(error)
    }

    const totalPages = Math.ceil(count / pagination.limit)

    return successResponse(
      data,
      'Menu items retrieved successfully',
      {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        totalPages,
      }
    )
  } catch (error) {
    console.error('Error in GET /api/admin/menu:', error)
    return serverErrorResponse('Failed to fetch menu items')
  }
}

/**
 * POST - Create new menu item (admin only)
 */
async function handlePost(
  request: NextRequest,
  context: { user: any }
) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['title', 'price', 'category']

    for (const field of requiredFields) {
      if (!body[field]) {
        return badRequestResponse(`Missing required field: ${field}`)
      }
    }

    // Validate category
    if (!['coffee', 'tea', 'pastries', 'meals'].includes(body.category)) {
      return badRequestResponse('Invalid category. Must be: coffee, tea, pastries, or meals')
    }

    // Prepare menu item data
    const menuItemData = {
      title: body.title,
      description: body.description || undefined,
      price: parseFloat(body.price),
      category: body.category,
      dietary_tags: body.dietary_tags || [],
      image: body.image || undefined,
      orderable: body.orderable !== undefined ? body.orderable : true,
      featured: body.featured !== undefined ? body.featured : false,
    }

    const { data, error } = await createMenuItem(menuItemData)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to create menu item')
    }

    // Create audit log
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'create',
      resource_type: 'menu_item',
      resource_id: data.id,
      changes: { created: menuItemData },
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return createdResponse(data, 'Menu item created successfully')
  } catch (error) {
    console.error('Error in POST /api/admin/menu:', error)
    return serverErrorResponse('Failed to create menu item')
  }
}

export const GET = withStaffOrAdminAuth(handleGet)
export const POST = withAdminAuth(handlePost)