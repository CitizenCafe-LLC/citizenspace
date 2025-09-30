/**
 * Users Repository
 * Handles all database operations for user management (admin functions)
 * Implements data access layer with proper error handling
 */

import { executeQuery, executeQuerySingle } from '../postgres'
import type { User, PaginationParams } from '../types'
import type { UserRole } from '../../auth/rbac'

/**
 * User filters for admin queries
 */
export interface UserFilters {
  role?: UserRole
  nft_holder?: boolean
  membership_plan_id?: string
  membership_status?: 'active' | 'paused' | 'cancelled'
  search?: string // Search by name or email
}

/**
 * User with aggregated statistics
 */
export interface UserWithStats extends User {
  bookings_count?: number
  total_spent?: number
  orders_count?: number
  membership_plan?: {
    id: string
    name: string
    slug: string
    price: number
  }
}

/**
 * Get all users with filtering and pagination (admin only)
 */
export async function getAllUsers(filters?: UserFilters, pagination?: PaginationParams) {
  try {
    const whereClauses: string[] = []
    const params: any[] = []
    let paramCount = 1

    // Build WHERE clauses based on filters
    if (filters) {
      if (filters.role) {
        whereClauses.push(`u.role = $${paramCount++}`)
        params.push(filters.role)
      }
      if (filters.nft_holder !== undefined) {
        whereClauses.push(`u.nft_holder = $${paramCount++}`)
        params.push(filters.nft_holder)
      }
      if (filters.membership_plan_id) {
        whereClauses.push(`u.membership_plan_id = $${paramCount++}`)
        params.push(filters.membership_plan_id)
      }
      if (filters.membership_status) {
        whereClauses.push(`u.membership_status = $${paramCount++}`)
        params.push(filters.membership_status)
      }
      if (filters.search) {
        whereClauses.push(
          `(u.full_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`
        )
        params.push(`%${filters.search}%`)
        paramCount++
      }
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Build ORDER BY clause
    const sortBy = pagination?.sortBy || 'u.created_at'
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC'
    const orderClause = `ORDER BY ${sortBy} ${sortOrder}`

    // Build LIMIT and OFFSET
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit
    const limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`
    params.push(limit, offset)

    // Count total records
    const countQuery = `SELECT COUNT(*) FROM users u ${whereClause}`
    const countResult = await executeQuerySingle<{ count: string }>(
      countQuery,
      params.slice(0, params.length - 2)
    )

    if (countResult.error) {
      return { data: null, error: countResult.error, count: 0 }
    }

    const count = parseInt(countResult.data?.count || '0')

    // Fetch data with membership plan details
    const dataQuery = `
      SELECT
        u.*,
        jsonb_build_object(
          'id', mp.id,
          'name', mp.name,
          'slug', mp.slug,
          'price', mp.price
        ) as membership_plan,
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as bookings_count,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE user_id = u.id AND payment_status = 'paid') as total_spent,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as orders_count
      FROM users u
      LEFT JOIN membership_plans mp ON u.membership_plan_id = mp.id
      ${whereClause}
      ${orderClause}
      ${limitClause}
    `

    const result = await executeQuery<UserWithStats>(dataQuery, params)

    if (result.error) {
      return { data: null, error: result.error, count: 0 }
    }

    // Parse numeric fields
    const users = result.data?.map(user => ({
      ...user,
      total_spent: parseFloat(user.total_spent as any) || 0,
    }))

    return { data: users, error: null, count }
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
      count: 0,
    }
  }
}

/**
 * Get user by ID with full details (admin only)
 */
export async function getUserByIdAdmin(userId: string) {
  try {
    const query = `
      SELECT
        u.*,
        jsonb_build_object(
          'id', mp.id,
          'name', mp.name,
          'slug', mp.slug,
          'price', mp.price,
          'billing_period', mp.billing_period,
          'features', mp.features,
          'meeting_room_credits_hours', mp.meeting_room_credits_hours
        ) as membership_plan,
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as bookings_count,
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id AND status = 'confirmed') as active_bookings_count,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE user_id = u.id AND payment_status = 'paid') as total_spent,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as orders_count,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id AND payment_status = 'paid') as completed_orders_count
      FROM users u
      LEFT JOIN membership_plans mp ON u.membership_plan_id = mp.id
      WHERE u.id = $1
    `

    const result = await executeQuerySingle<UserWithStats>(query, [userId])

    if (result.error) {
      console.error('Error fetching user:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'User not found' }
    }

    // Parse numeric fields
    const user = {
      ...result.data,
      total_spent: parseFloat(result.data.total_spent as any) || 0,
    }

    return { data: user, error: null }
  } catch (error) {
    console.error('Error in getUserByIdAdmin:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
    }
  }
}

/**
 * Update user information (admin only)
 */
export async function updateUser(
  userId: string,
  data: Partial<{
    email: string
    full_name: string
    phone: string
    role: UserRole
    nft_holder: boolean
    nft_token_id: string
    membership_plan_id: string
    membership_status: 'active' | 'paused' | 'cancelled'
    wallet_address: string
  }>
) {
  try {
    const setClauses: string[] = []
    const params: any[] = []
    let paramCount = 1

    // Build SET clauses dynamically
    if (data.email !== undefined) {
      setClauses.push(`email = $${paramCount++}`)
      params.push(data.email)
    }
    if (data.full_name !== undefined) {
      setClauses.push(`full_name = $${paramCount++}`)
      params.push(data.full_name)
    }
    if (data.phone !== undefined) {
      setClauses.push(`phone = $${paramCount++}`)
      params.push(data.phone)
    }
    if (data.role !== undefined) {
      setClauses.push(`role = $${paramCount++}`)
      params.push(data.role)
    }
    if (data.nft_holder !== undefined) {
      setClauses.push(`nft_holder = $${paramCount++}`)
      params.push(data.nft_holder)
    }
    if (data.nft_token_id !== undefined) {
      setClauses.push(`nft_token_id = $${paramCount++}`)
      params.push(data.nft_token_id)
    }
    if (data.membership_plan_id !== undefined) {
      setClauses.push(`membership_plan_id = $${paramCount++}`)
      params.push(data.membership_plan_id)
    }
    if (data.membership_status !== undefined) {
      setClauses.push(`membership_status = $${paramCount++}`)
      params.push(data.membership_status)
    }
    if (data.wallet_address !== undefined) {
      setClauses.push(`wallet_address = $${paramCount++}`)
      params.push(data.wallet_address)
    }

    if (setClauses.length === 0) {
      return { data: null, error: 'No fields to update' }
    }

    params.push(userId)

    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await executeQuerySingle<User>(query, params)

    if (result.error) {
      console.error('Error updating user:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'User not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in updateUser:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update user',
    }
  }
}

/**
 * Soft delete user (admin only)
 * Marks user as deleted and anonymizes data
 */
export async function deleteUser(userId: string) {
  try {
    // Check for active bookings
    const checkQuery = `
      SELECT COUNT(*) as active_bookings
      FROM bookings
      WHERE user_id = $1 AND status IN ('pending', 'confirmed')
    `
    const checkResult = await executeQuerySingle<{ active_bookings: string }>(
      checkQuery,
      [userId]
    )

    const activeBookings = parseInt(checkResult.data?.active_bookings || '0')

    if (activeBookings > 0) {
      return {
        data: null,
        error: `Cannot delete user with ${activeBookings} active booking(s). Please cancel bookings first.`,
      }
    }

    // Soft delete by anonymizing user data
    const deleteQuery = `
      UPDATE users
      SET
        email = CONCAT('deleted_', id, '@deleted.com'),
        full_name = 'Deleted User',
        phone = NULL,
        wallet_address = NULL,
        nft_token_id = NULL,
        membership_plan_id = NULL,
        membership_status = NULL,
        stripe_customer_id = NULL,
        stripe_subscription_id = NULL,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, email
    `

    const result = await executeQuerySingle<{ id: string; email: string }>(
      deleteQuery,
      [userId]
    )

    if (result.error) {
      console.error('Error deleting user:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'User not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in deleteUser:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    }
  }
}

/**
 * Get user statistics (admin dashboard)
 */
export async function getUserStatistics() {
  try {
    const query = `
      SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
        COUNT(*) FILTER (WHERE role = 'staff') as staff_count,
        COUNT(*) FILTER (WHERE role = 'user') as user_count,
        COUNT(*) FILTER (WHERE nft_holder = true) as nft_holder_count,
        COUNT(*) FILTER (WHERE membership_status = 'active') as active_members,
        COUNT(*) FILTER (WHERE membership_status = 'paused') as paused_members,
        COUNT(*) FILTER (WHERE membership_status = 'cancelled') as cancelled_members,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_last_30_days,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_last_7_days
      FROM users
    `

    const result = await executeQuerySingle(query)

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getUserStatistics:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch user statistics',
    }
  }
}

/**
 * Get membership distribution
 */
export async function getMembershipDistribution() {
  try {
    const query = `
      SELECT
        mp.name as membership_name,
        mp.slug as membership_slug,
        COUNT(u.id) as user_count,
        COALESCE(SUM(mp.price), 0) as total_revenue
      FROM membership_plans mp
      LEFT JOIN users u ON u.membership_plan_id = mp.id AND u.membership_status = 'active'
      WHERE mp.active = true
      GROUP BY mp.id, mp.name, mp.slug, mp.price
      ORDER BY user_count DESC
    `

    const result = await executeQuery(query)

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Parse revenue
    const data = result.data?.map(row => ({
      ...row,
      total_revenue: parseFloat(row.total_revenue || '0'),
    }))

    return { data, error: null }
  } catch (error) {
    console.error('Error in getMembershipDistribution:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch membership distribution',
    }
  }
}