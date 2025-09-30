/**
 * Admin Booking Detail API
 * GET /api/admin/bookings/:id - Get single booking with full details
 * PATCH /api/admin/bookings/:id - Update booking
 * DELETE /api/admin/bookings/:id - Cancel booking
 */

import type { NextRequest } from 'next/server'
import { withStaffOrAdminAuth, withAdminAuth, getClientIp, getUserAgent } from '@/lib/auth/rbac'
import {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response'
import {
  getBookingById,
  updateBookingAdmin,
  deleteBookingAdmin,
} from '@/lib/db/repositories/booking.repository'
import { createAuditLog, createChangeObject } from '@/lib/db/repositories/audit.repository'

/**
 * GET - Get booking by ID (staff/admin)
 */
async function handleGet(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    const { data, error } = await getBookingById(id)

    if (error || !data) {
      return notFoundResponse(error || 'Booking not found')
    }

    return successResponse(data, 'Booking retrieved successfully')
  } catch (error) {
    console.error('Error in GET /api/admin/bookings/:id:', error)
    return serverErrorResponse('Failed to fetch booking')
  }
}

/**
 * PATCH - Update booking (admin only)
 */
async function handlePatch(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    // Get existing booking for audit trail
    const existing = await getBookingById(id)
    if (existing.error || !existing.data) {
      return notFoundResponse('Booking not found')
    }

    // Validate update data
    const allowedFields = [
      'status',
      'payment_status',
      'booking_date',
      'start_time',
      'end_time',
      'workspace_id',
      'admin_notes',
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

    // Update booking
    const { data, error } = await updateBookingAdmin(id, updateData)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to update booking')
    }

    // Create audit log
    const changes = createChangeObject(existing.data, data)
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'update',
      resource_type: 'booking',
      resource_id: id,
      changes,
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return successResponse(data, 'Booking updated successfully')
  } catch (error) {
    console.error('Error in PATCH /api/admin/bookings/:id:', error)
    return serverErrorResponse('Failed to update booking')
  }
}

/**
 * DELETE - Cancel booking (admin only)
 */
async function handleDelete(
  request: NextRequest,
  context: { user: any; params: { id: string } }
) {
  try {
    const { id } = context.params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || 'Cancelled by admin'

    const { data, error, shouldRefund } = await deleteBookingAdmin(id, reason)

    if (error || !data) {
      return serverErrorResponse(error || 'Failed to cancel booking')
    }

    // Create audit log
    await createAuditLog({
      admin_user_id: context.user.userId,
      action: 'delete',
      resource_type: 'booking',
      resource_id: id,
      changes: { reason, shouldRefund },
      ip_address: getClientIp(request),
      user_agent: getUserAgent(request),
    })

    return successResponse(
      { booking: data, shouldRefund },
      'Booking cancelled successfully'
    )
  } catch (error) {
    console.error('Error in DELETE /api/admin/bookings/:id:', error)
    return serverErrorResponse('Failed to cancel booking')
  }
}

export const GET = withStaffOrAdminAuth(handleGet)
export const PATCH = withAdminAuth(handlePatch)
export const DELETE = withAdminAuth(handleDelete)