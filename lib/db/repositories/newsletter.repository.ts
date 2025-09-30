import { executeQuery, executeQuerySingle } from '../postgres'
import type { PaginationParams } from '../types'

/**
 * Repository for newsletter subscriber database operations
 * Implements data access layer with proper error handling
 */

export interface NewsletterSubscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed' | 'bounced'
  preferences: Record<string, any>
  subscribed_at: Date
  unsubscribed_at?: Date | null
  created_at: Date
  updated_at: Date
}

export interface CreateNewsletterSubscriberData {
  email: string
  preferences?: Record<string, any>
}

export interface NewsletterSubscriberFilters {
  status?: NewsletterSubscriber['status']
  email?: string
  subscribed_after?: string
  subscribed_before?: string
}

/**
 * Create a new newsletter subscriber
 * If email already exists, returns existing record
 */
export async function createNewsletterSubscriber(data: CreateNewsletterSubscriberData) {
  try {
    // First check if email already exists
    const existingQuery = 'SELECT * FROM newsletter_subscribers WHERE email = $1'
    const existing = await executeQuerySingle<NewsletterSubscriber>(existingQuery, [data.email])

    // If subscriber exists
    if (existing.data) {
      // If they previously unsubscribed, reactivate
      if (existing.data.status === 'unsubscribed') {
        const updateQuery = `
          UPDATE newsletter_subscribers
          SET status = 'active',
              unsubscribed_at = NULL,
              preferences = $2,
              updated_at = NOW()
          WHERE email = $1
          RETURNING *
        `
        const result = await executeQuerySingle<NewsletterSubscriber>(updateQuery, [
          data.email,
          JSON.stringify(data.preferences || {}),
        ])

        return {
          data: result.data,
          error: result.error,
          already_subscribed: false,
        }
      }

      // Already subscribed - return success
      return {
        data: existing.data,
        error: null,
        already_subscribed: true,
      }
    }

    // Create new subscriber
    const query = `
      INSERT INTO newsletter_subscribers (email, preferences)
      VALUES ($1, $2)
      RETURNING *
    `

    const result = await executeQuerySingle<NewsletterSubscriber>(query, [
      data.email,
      JSON.stringify(data.preferences || {}),
    ])

    if (result.error) {
      console.error('Error creating newsletter subscriber:', result.error)
      return { data: null, error: result.error, already_subscribed: false }
    }

    return { data: result.data, error: null, already_subscribed: false }
  } catch (error) {
    console.error('Error in createNewsletterSubscriber:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create newsletter subscriber',
      already_subscribed: false,
    }
  }
}

/**
 * Get newsletter subscriber by email
 */
export async function getNewsletterSubscriberByEmail(email: string) {
  try {
    const query = 'SELECT * FROM newsletter_subscribers WHERE email = $1'
    const result = await executeQuerySingle<NewsletterSubscriber>(query, [email])

    if (result.error) {
      console.error('Error fetching newsletter subscriber:', result.error)
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getNewsletterSubscriberByEmail:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch newsletter subscriber',
    }
  }
}

/**
 * Get newsletter subscriber by ID
 */
export async function getNewsletterSubscriberById(id: string) {
  try {
    const query = 'SELECT * FROM newsletter_subscribers WHERE id = $1'
    const result = await executeQuerySingle<NewsletterSubscriber>(query, [id])

    if (result.error) {
      console.error('Error fetching newsletter subscriber:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Newsletter subscriber not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getNewsletterSubscriberById:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch newsletter subscriber',
    }
  }
}

/**
 * Update newsletter subscriber status
 */
export async function updateNewsletterSubscriberStatus(
  id: string,
  status: NewsletterSubscriber['status']
) {
  try {
    const query = `
      UPDATE newsletter_subscribers
      SET status = $2,
          unsubscribed_at = CASE WHEN $2 = 'unsubscribed' THEN NOW() ELSE NULL END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `

    const result = await executeQuerySingle<NewsletterSubscriber>(query, [id, status])

    if (result.error) {
      console.error('Error updating newsletter subscriber:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Newsletter subscriber not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in updateNewsletterSubscriberStatus:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update newsletter subscriber',
    }
  }
}

/**
 * Unsubscribe by email
 */
export async function unsubscribeByEmail(email: string) {
  try {
    const query = `
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed',
          unsubscribed_at = NOW(),
          updated_at = NOW()
      WHERE email = $1
      RETURNING *
    `

    const result = await executeQuerySingle<NewsletterSubscriber>(query, [email])

    if (result.error) {
      console.error('Error unsubscribing:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Newsletter subscriber not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in unsubscribeByEmail:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to unsubscribe',
    }
  }
}

/**
 * Update newsletter subscriber preferences
 */
export async function updateNewsletterPreferences(
  email: string,
  preferences: Record<string, any>
) {
  try {
    const query = `
      UPDATE newsletter_subscribers
      SET preferences = $2,
          updated_at = NOW()
      WHERE email = $1
      RETURNING *
    `

    const result = await executeQuerySingle<NewsletterSubscriber>(query, [
      email,
      JSON.stringify(preferences),
    ])

    if (result.error) {
      console.error('Error updating preferences:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Newsletter subscriber not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in updateNewsletterPreferences:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update preferences',
    }
  }
}

/**
 * Get all newsletter subscribers with optional filtering and pagination
 */
export async function getAllNewsletterSubscribers(
  filters?: NewsletterSubscriberFilters,
  pagination?: PaginationParams
) {
  try {
    const whereClauses: string[] = []
    const params: any[] = []
    let paramCount = 1

    // Build WHERE clauses based on filters
    if (filters) {
      if (filters.status) {
        whereClauses.push(`status = $${paramCount++}`)
        params.push(filters.status)
      }
      if (filters.email) {
        whereClauses.push(`email ILIKE $${paramCount++}`)
        params.push(`%${filters.email}%`)
      }
      if (filters.subscribed_after) {
        whereClauses.push(`subscribed_at >= $${paramCount++}`)
        params.push(filters.subscribed_after)
      }
      if (filters.subscribed_before) {
        whereClauses.push(`subscribed_at <= $${paramCount++}`)
        params.push(filters.subscribed_before)
      }
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Build ORDER BY clause
    const sortBy = pagination?.sortBy || 'subscribed_at'
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC'
    const orderClause = `ORDER BY ${sortBy} ${sortOrder}`

    // Build LIMIT and OFFSET
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit
    const limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`
    params.push(limit, offset)

    // Count total records
    const countQuery = `SELECT COUNT(*) FROM newsletter_subscribers ${whereClause}`
    const countResult = await executeQuerySingle<{ count: string }>(
      countQuery,
      params.slice(0, params.length - 2) // Exclude LIMIT and OFFSET params
    )

    if (countResult.error) {
      return { data: null, error: countResult.error, count: 0 }
    }

    const count = parseInt(countResult.data?.count || '0')

    // Fetch data
    const dataQuery = `
      SELECT * FROM newsletter_subscribers
      ${whereClause}
      ${orderClause}
      ${limitClause}
    `

    const result = await executeQuery<NewsletterSubscriber>(dataQuery, params)

    if (result.error) {
      return { data: null, error: result.error, count: 0 }
    }

    return { data: result.data, error: null, count }
  } catch (error) {
    console.error('Error in getAllNewsletterSubscribers:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch newsletter subscribers',
      count: 0,
    }
  }
}

/**
 * Get newsletter subscriber statistics
 */
export async function getNewsletterSubscriberStats() {
  try {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced_count,
        COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '30 days') as last_30_days,
        COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '7 days') as last_7_days
      FROM newsletter_subscribers
    `

    const result = await executeQuerySingle<{
      total: string
      active_count: string
      unsubscribed_count: string
      bounced_count: string
      last_30_days: string
      last_7_days: string
    }>(query)

    if (result.error) {
      console.error('Error fetching newsletter subscriber stats:', result.error)
      return { data: null, error: result.error }
    }

    // Convert string counts to numbers
    const stats = result.data
      ? {
          total: parseInt(result.data.total),
          active_count: parseInt(result.data.active_count),
          unsubscribed_count: parseInt(result.data.unsubscribed_count),
          bounced_count: parseInt(result.data.bounced_count),
          last_30_days: parseInt(result.data.last_30_days),
          last_7_days: parseInt(result.data.last_7_days),
        }
      : null

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error in getNewsletterSubscriberStats:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    }
  }
}

/**
 * Delete newsletter subscriber (hard delete for GDPR compliance)
 */
export async function deleteNewsletterSubscriber(id: string) {
  try {
    const query = `
      DELETE FROM newsletter_subscribers
      WHERE id = $1
      RETURNING *
    `

    const result = await executeQuerySingle<NewsletterSubscriber>(query, [id])

    if (result.error) {
      console.error('Error deleting newsletter subscriber:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Newsletter subscriber not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in deleteNewsletterSubscriber:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to delete newsletter subscriber',
    }
  }
}