/**
 * Audit Repository
 * Handles all database operations for audit logging
 * Tracks administrative actions for security and compliance
 */

import { executeQuery, executeQuerySingle } from '../postgres'

export type AuditAction = 'create' | 'update' | 'delete' | 'status_change' | 'refund'
export type ResourceType = 'booking' | 'user' | 'workspace' | 'menu_item' | 'order' | 'membership'

export interface AuditLog {
  id: string
  admin_user_id: string
  action: AuditAction
  resource_type: ResourceType
  resource_id: string
  changes: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface CreateAuditLogParams {
  admin_user_id: string
  action: AuditAction
  resource_type: ResourceType
  resource_id: string
  changes?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const query = `
      INSERT INTO audit_logs (
        admin_user_id, action, resource_type, resource_id,
        changes, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const queryParams = [
      params.admin_user_id,
      params.action,
      params.resource_type,
      params.resource_id,
      params.changes ? JSON.stringify(params.changes) : null,
      params.ip_address || null,
      params.user_agent || null,
    ]

    const result = await executeQuerySingle<AuditLog>(query, queryParams)

    if (result.error) {
      console.error('Error creating audit log:', result.error)
      // Don't fail the operation if audit logging fails
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in createAuditLog:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create audit log',
    }
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(filters?: {
  admin_user_id?: string
  resource_type?: ResourceType
  resource_id?: string
  action?: AuditAction
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}) {
  try {
    const whereClauses: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (filters?.admin_user_id) {
      whereClauses.push(`admin_user_id = $${paramCount++}`)
      params.push(filters.admin_user_id)
    }

    if (filters?.resource_type) {
      whereClauses.push(`resource_type = $${paramCount++}`)
      params.push(filters.resource_type)
    }

    if (filters?.resource_id) {
      whereClauses.push(`resource_id = $${paramCount++}`)
      params.push(filters.resource_id)
    }

    if (filters?.action) {
      whereClauses.push(`action = $${paramCount++}`)
      params.push(filters.action)
    }

    if (filters?.start_date) {
      whereClauses.push(`created_at >= $${paramCount++}`)
      params.push(filters.start_date)
    }

    if (filters?.end_date) {
      whereClauses.push(`created_at <= $${paramCount++}`)
      params.push(filters.end_date)
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Count total records
    const countQuery = `SELECT COUNT(*) FROM audit_logs ${whereClause}`
    const countResult = await executeQuerySingle<{ count: string }>(
      countQuery,
      params
    )

    const count = parseInt(countResult.data?.count || '0')

    // Build pagination
    const limit = filters?.limit || 50
    const offset = filters?.offset || 0
    params.push(limit, offset)

    // Fetch logs with admin user details
    const dataQuery = `
      SELECT
        al.*,
        jsonb_build_object(
          'id', u.id,
          'email', u.email,
          'full_name', u.full_name
        ) as admin_user
      FROM audit_logs al
      LEFT JOIN users u ON al.admin_user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `

    const result = await executeQuery<AuditLog>(dataQuery, params)

    if (result.error) {
      return { data: null, error: result.error, count: 0 }
    }

    return { data: result.data, error: null, count }
  } catch (error) {
    console.error('Error in getAuditLogs:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
      count: 0,
    }
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: ResourceType,
  resourceId: string,
  limit: number = 50
) {
  return getAuditLogs({
    resource_type: resourceType,
    resource_id: resourceId,
    limit,
  })
}

/**
 * Get audit logs for a specific admin user
 */
export async function getAdminUserAuditLogs(
  adminUserId: string,
  limit: number = 100,
  offset: number = 0
) {
  return getAuditLogs({
    admin_user_id: adminUserId,
    limit,
    offset,
  })
}

/**
 * Helper function to create before/after changes object
 */
export function createChangeObject(
  before: Record<string, any>,
  after: Record<string, any>
): Record<string, any> {
  const changes: Record<string, any> = {}

  // Track what changed
  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) {
      changes[key] = {
        before: before[key],
        after: after[key],
      }
    }
  }

  return changes
}