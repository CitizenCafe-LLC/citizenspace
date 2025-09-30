import { executeQuery, executeQuerySingle } from '../postgres'
import type { PaginationParams } from '../types'

/**
 * Repository for contact submission database operations
 * Implements data access layer with proper error handling
 */

export interface ContactSubmission {
  id: string
  name: string
  email: string
  topic: 'general' | 'booking' | 'partnership' | 'press'
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  admin_notes?: string | null
  created_at: Date
  updated_at: Date
}

export interface CreateContactSubmissionData {
  name: string
  email: string
  topic: 'general' | 'booking' | 'partnership' | 'press'
  message: string
}

export interface ContactSubmissionFilters {
  status?: ContactSubmission['status']
  topic?: ContactSubmission['topic']
  email?: string
  date_from?: string
  date_to?: string
  search?: string // Search in name, email, or message
}

/**
 * Create a new contact submission
 */
export async function createContactSubmission(data: CreateContactSubmissionData) {
  try {
    const query = `
      INSERT INTO contact_submissions (name, email, topic, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `

    const result = await executeQuerySingle<ContactSubmission>(query, [
      data.name,
      data.email,
      data.topic,
      data.message,
    ])

    if (result.error) {
      console.error('Error creating contact submission:', result.error)
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in createContactSubmission:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create contact submission',
    }
  }
}

/**
 * Get all contact submissions with optional filtering and pagination
 */
export async function getAllContactSubmissions(
  filters?: ContactSubmissionFilters,
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
      if (filters.topic) {
        whereClauses.push(`topic = $${paramCount++}`)
        params.push(filters.topic)
      }
      if (filters.email) {
        whereClauses.push(`email = $${paramCount++}`)
        params.push(filters.email)
      }
      if (filters.date_from) {
        whereClauses.push(`created_at >= $${paramCount++}`)
        params.push(filters.date_from)
      }
      if (filters.date_to) {
        whereClauses.push(`created_at <= $${paramCount++}`)
        params.push(filters.date_to)
      }
      if (filters.search) {
        whereClauses.push(`(
          name ILIKE $${paramCount} OR
          email ILIKE $${paramCount} OR
          message ILIKE $${paramCount}
        )`)
        params.push(`%${filters.search}%`)
        paramCount++
      }
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Build ORDER BY clause
    const sortBy = pagination?.sortBy || 'created_at'
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC'
    const orderClause = `ORDER BY ${sortBy} ${sortOrder}`

    // Build LIMIT and OFFSET
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit
    const limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`
    params.push(limit, offset)

    // Count total records
    const countQuery = `SELECT COUNT(*) FROM contact_submissions ${whereClause}`
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
      SELECT * FROM contact_submissions
      ${whereClause}
      ${orderClause}
      ${limitClause}
    `

    const result = await executeQuery<ContactSubmission>(dataQuery, params)

    if (result.error) {
      return { data: null, error: result.error, count: 0 }
    }

    return { data: result.data, error: null, count }
  } catch (error) {
    console.error('Error in getAllContactSubmissions:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch contact submissions',
      count: 0,
    }
  }
}

/**
 * Get contact submission by ID
 */
export async function getContactSubmissionById(id: string) {
  try {
    const query = 'SELECT * FROM contact_submissions WHERE id = $1'
    const result = await executeQuerySingle<ContactSubmission>(query, [id])

    if (result.error) {
      console.error('Error fetching contact submission:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Contact submission not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in getContactSubmissionById:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch contact submission',
    }
  }
}

/**
 * Update contact submission status and admin notes
 */
export async function updateContactSubmissionStatus(
  id: string,
  status: ContactSubmission['status'],
  notes?: string
) {
  try {
    const query = `
      UPDATE contact_submissions
      SET status = $2, admin_notes = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `

    const result = await executeQuerySingle<ContactSubmission>(query, [id, status, notes || null])

    if (result.error) {
      console.error('Error updating contact submission:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Contact submission not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in updateContactSubmissionStatus:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update contact submission',
    }
  }
}

/**
 * Delete contact submission (soft delete by marking as closed)
 */
export async function deleteContactSubmission(id: string) {
  try {
    const query = `
      UPDATE contact_submissions
      SET status = 'closed', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `

    const result = await executeQuerySingle<ContactSubmission>(query, [id])

    if (result.error) {
      console.error('Error deleting contact submission:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Contact submission not found' }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error in deleteContactSubmission:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to delete contact submission',
    }
  }
}

/**
 * Get contact submission statistics
 */
export async function getContactSubmissionStats() {
  try {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
        COUNT(*) FILTER (WHERE topic = 'general') as general_count,
        COUNT(*) FILTER (WHERE topic = 'booking') as booking_count,
        COUNT(*) FILTER (WHERE topic = 'partnership') as partnership_count,
        COUNT(*) FILTER (WHERE topic = 'press') as press_count
      FROM contact_submissions
    `

    const result = await executeQuerySingle<{
      total: string
      new_count: string
      in_progress_count: string
      resolved_count: string
      closed_count: string
      general_count: string
      booking_count: string
      partnership_count: string
      press_count: string
    }>(query)

    if (result.error) {
      console.error('Error fetching contact submission stats:', result.error)
      return { data: null, error: result.error }
    }

    // Convert string counts to numbers
    const stats = result.data
      ? {
          total: parseInt(result.data.total),
          new_count: parseInt(result.data.new_count),
          in_progress_count: parseInt(result.data.in_progress_count),
          resolved_count: parseInt(result.data.resolved_count),
          closed_count: parseInt(result.data.closed_count),
          general_count: parseInt(result.data.general_count),
          booking_count: parseInt(result.data.booking_count),
          partnership_count: parseInt(result.data.partnership_count),
          press_count: parseInt(result.data.press_count),
        }
      : null

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error in getContactSubmissionStats:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    }
  }
}