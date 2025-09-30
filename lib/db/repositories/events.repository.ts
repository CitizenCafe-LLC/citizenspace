/**
 * Events Repository
 * Handles all database operations for events and RSVPs
 */

import { executeQuery, executeQuerySingle } from '../postgres'

/**
 * Event database type
 */
export interface Event {
  id: string
  title: string
  slug: string
  description: string
  start_time: string
  end_time: string
  location: string
  host: string
  external_rsvp_url: string | null
  image: string | null
  tags: string[]
  capacity: number | null
  price: number
  created_at: string
  updated_at: string
}

/**
 * Event RSVP database type
 */
export interface EventRSVP {
  id: string
  event_id: string
  user_id: string | null
  status: 'confirmed' | 'cancelled' | 'waitlist'
  payment_status: 'pending' | 'paid' | 'refunded' | null
  payment_intent_id: string | null
  guest_name: string | null
  guest_email: string | null
  created_at: string
  updated_at: string
}

/**
 * Event with RSVP count
 */
export interface EventWithRSVPCount extends Event {
  rsvp_count: number
  available_spots: number | null
  user_rsvp_status?: string | null
}

/**
 * Filters for querying events
 */
export interface EventFilters {
  upcoming?: boolean
  past?: boolean
  tags?: string[]
  has_capacity?: boolean
  is_free?: boolean
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number
  offset?: number
}

/**
 * Get all events with filters and pagination
 */
export async function getAllEvents(
  filters?: EventFilters,
  pagination?: PaginationParams,
  userId?: string
) {
  const whereClauses: string[] = []
  const params: any[] = []
  let paramCount = 1

  // Filter by upcoming/past events
  if (filters?.upcoming) {
    whereClauses.push(`e.start_time >= NOW()`)
  }
  if (filters?.past) {
    whereClauses.push(`e.start_time < NOW()`)
  }

  // Filter by tags
  if (filters?.tags && filters.tags.length > 0) {
    whereClauses.push(`e.tags && $${paramCount}::text[]`)
    params.push(filters.tags)
    paramCount++
  }

  // Filter by capacity availability
  if (filters?.has_capacity) {
    whereClauses.push(`(e.capacity IS NULL OR e.capacity > (
      SELECT COUNT(*) FROM event_rsvps
      WHERE event_id = e.id AND status = 'confirmed'
    ))`)
  }

  // Filter by free events
  if (filters?.is_free !== undefined) {
    if (filters.is_free) {
      whereClauses.push(`e.price = 0`)
    } else {
      whereClauses.push(`e.price > 0`)
    }
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

  // Build user RSVP status subquery if user is provided
  const userRsvpSubquery = userId
    ? `, (
        SELECT status
        FROM event_rsvps
        WHERE event_id = e.id AND user_id = $${paramCount}
        LIMIT 1
      ) as user_rsvp_status`
    : ''

  if (userId) {
    params.push(userId)
    paramCount++
  }

  const query = `
    SELECT
      e.*,
      COALESCE(
        (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'confirmed'),
        0
      ) as rsvp_count,
      CASE
        WHEN e.capacity IS NULL THEN NULL
        ELSE e.capacity - COALESCE(
          (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'confirmed'),
          0
        )
      END as available_spots
      ${userRsvpSubquery}
    FROM events e
    ${whereClause}
    ORDER BY e.start_time ASC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `

  const limit = pagination?.limit || 50
  const offset = pagination?.offset || 0
  params.push(limit, offset)

  const result = await executeQuery<EventWithRSVPCount>(query, params)

  if (result.error) {
    console.error('Error fetching events:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get event by slug with RSVP information
 */
export async function getEventBySlug(slug: string, userId?: string) {
  const params: any[] = [slug]
  let paramCount = 2

  // Build user RSVP status subquery if user is provided
  const userRsvpSubquery = userId
    ? `, (
        SELECT status
        FROM event_rsvps
        WHERE event_id = e.id AND user_id = $${paramCount}
        LIMIT 1
      ) as user_rsvp_status`
    : ''

  if (userId) {
    params.push(userId)
    paramCount++
  }

  const query = `
    SELECT
      e.*,
      COALESCE(
        (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'confirmed'),
        0
      ) as rsvp_count,
      CASE
        WHEN e.capacity IS NULL THEN NULL
        ELSE e.capacity - COALESCE(
          (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'confirmed'),
          0
        )
      END as available_spots
      ${userRsvpSubquery}
    FROM events e
    WHERE e.slug = $1
  `

  const result = await executeQuerySingle<EventWithRSVPCount>(query, params)

  if (result.error) {
    console.error('Error fetching event by slug:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get event by ID
 */
export async function getEventById(id: string) {
  const query = `
    SELECT
      e.*,
      COALESCE(
        (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'confirmed'),
        0
      ) as rsvp_count,
      CASE
        WHEN e.capacity IS NULL THEN NULL
        ELSE e.capacity - COALESCE(
          (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'confirmed'),
          0
        )
      END as available_spots
    FROM events e
    WHERE e.id = $1
  `

  const result = await executeQuerySingle<EventWithRSVPCount>(query, [id])

  if (result.error) {
    console.error('Error fetching event by ID:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Check if event has available capacity
 */
export async function checkEventCapacity(eventId: string): Promise<{
  hasCapacity: boolean
  currentCount: number
  capacity: number | null
  error: string | null
}> {
  const query = `
    SELECT
      e.capacity,
      COALESCE(
        (SELECT COUNT(*) FROM event_rsvps WHERE event_id = e.id AND status = 'confirmed'),
        0
      ) as current_count
    FROM events e
    WHERE e.id = $1
  `

  const result = await executeQuerySingle<{ capacity: number | null; current_count: number }>(
    query,
    [eventId]
  )

  if (result.error || !result.data) {
    console.error('Error checking event capacity:', result.error)
    return {
      hasCapacity: false,
      currentCount: 0,
      capacity: null,
      error: result.error || 'Event not found',
    }
  }

  const { capacity, current_count } = result.data

  // If capacity is null, event has unlimited capacity
  const hasCapacity = capacity === null || current_count < capacity

  return {
    hasCapacity,
    currentCount: current_count,
    capacity,
    error: null,
  }
}

/**
 * Create RSVP for an event
 */
export async function createRSVP(params: {
  event_id: string
  user_id?: string
  status?: 'confirmed' | 'cancelled' | 'waitlist'
  payment_status?: 'pending' | 'paid' | 'refunded'
  payment_intent_id?: string
  guest_name?: string
  guest_email?: string
}) {
  const query = `
    INSERT INTO event_rsvps (
      event_id,
      user_id,
      status,
      payment_status,
      payment_intent_id,
      guest_name,
      guest_email
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `

  const queryParams = [
    params.event_id,
    params.user_id || null,
    params.status || 'confirmed',
    params.payment_status || null,
    params.payment_intent_id || null,
    params.guest_name || null,
    params.guest_email || null,
  ]

  const result = await executeQuerySingle<EventRSVP>(query, queryParams)

  if (result.error) {
    console.error('Error creating RSVP:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get RSVP by ID
 */
export async function getRSVPById(rsvpId: string) {
  const query = `SELECT * FROM event_rsvps WHERE id = $1`
  const result = await executeQuerySingle<EventRSVP>(query, [rsvpId])

  if (result.error) {
    console.error('Error fetching RSVP:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Update RSVP
 */
export async function updateRSVP(
  rsvpId: string,
  updates: {
    status?: 'confirmed' | 'cancelled' | 'waitlist'
    payment_status?: 'pending' | 'paid' | 'refunded'
    payment_intent_id?: string
  }
) {
  const setClauses: string[] = []
  const params: any[] = []
  let paramCount = 1

  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramCount++}`)
    params.push(updates.status)
  }

  if (updates.payment_status !== undefined) {
    setClauses.push(`payment_status = $${paramCount++}`)
    params.push(updates.payment_status)
  }

  if (updates.payment_intent_id !== undefined) {
    setClauses.push(`payment_intent_id = $${paramCount++}`)
    params.push(updates.payment_intent_id)
  }

  if (setClauses.length === 0) {
    return { data: null, error: 'No fields to update' }
  }

  params.push(rsvpId)

  const query = `
    UPDATE event_rsvps
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING *
  `

  const result = await executeQuerySingle<EventRSVP>(query, params)

  if (result.error) {
    console.error('Error updating RSVP:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Cancel RSVP
 */
export async function cancelRSVP(rsvpId: string, userId?: string) {
  // If userId provided, verify ownership
  if (userId) {
    const verifyQuery = `SELECT user_id FROM event_rsvps WHERE id = $1`
    const verifyResult = await executeQuerySingle<{ user_id: string | null }>(verifyQuery, [
      rsvpId,
    ])

    if (verifyResult.error || !verifyResult.data) {
      return { data: null, error: 'RSVP not found' }
    }

    if (verifyResult.data.user_id !== userId) {
      return { data: null, error: 'Unauthorized to cancel this RSVP' }
    }
  }

  return updateRSVP(rsvpId, { status: 'cancelled' })
}

/**
 * Get all RSVPs for an event
 */
export async function getEventRSVPs(eventId: string, status?: 'confirmed' | 'cancelled' | 'waitlist') {
  const whereClauses: string[] = ['event_id = $1']
  const params: any[] = [eventId]
  let paramCount = 2

  if (status) {
    whereClauses.push(`status = $${paramCount++}`)
    params.push(status)
  }

  const query = `
    SELECT
      r.*,
      CASE
        WHEN r.user_id IS NOT NULL THEN
          jsonb_build_object(
            'id', u.id,
            'email', u.email,
            'full_name', u.full_name
          )
        ELSE NULL
      END as user
    FROM event_rsvps r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY r.created_at DESC
  `

  const result = await executeQuery<EventRSVP>(query, params)

  if (result.error) {
    console.error('Error fetching event RSVPs:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get RSVP count for an event
 */
export async function getEventRSVPCount(eventId: string) {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
      COUNT(*) FILTER (WHERE status = 'waitlist') as waitlist_count,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count
    FROM event_rsvps
    WHERE event_id = $1
  `

  const result = await executeQuerySingle<{
    confirmed_count: number
    waitlist_count: number
    cancelled_count: number
  }>(query, [eventId])

  if (result.error) {
    console.error('Error fetching RSVP count:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get all RSVPs for a user
 */
export async function getUserRSVPs(
  userId: string,
  filters?: { upcoming?: boolean; past?: boolean }
) {
  const whereClauses: string[] = ['r.user_id = $1']
  const params: any[] = [userId]

  // Build additional filters based on event start time
  const additionalFilters: string[] = []

  if (filters?.upcoming) {
    additionalFilters.push(`e.start_time >= NOW()`)
  }
  if (filters?.past) {
    additionalFilters.push(`e.start_time < NOW()`)
  }

  if (additionalFilters.length > 0) {
    whereClauses.push(...additionalFilters)
  }

  const query = `
    SELECT
      r.*,
      jsonb_build_object(
        'id', e.id,
        'title', e.title,
        'slug', e.slug,
        'description', e.description,
        'start_time', e.start_time,
        'end_time', e.end_time,
        'location', e.location,
        'host', e.host,
        'image', e.image,
        'price', e.price
      ) as event
    FROM event_rsvps r
    INNER JOIN events e ON r.event_id = e.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY e.start_time DESC
  `

  const result = await executeQuery<EventRSVP>(query, params)

  if (result.error) {
    console.error('Error fetching user RSVPs:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get user's RSVP for a specific event
 */
export async function getUserEventRSVP(userId: string, eventId: string) {
  const query = `
    SELECT * FROM event_rsvps
    WHERE user_id = $1 AND event_id = $2
  `

  const result = await executeQuerySingle<EventRSVP>(query, [userId, eventId])

  if (result.error) {
    console.error('Error fetching user event RSVP:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Create a new event (admin functionality)
 */
export async function createEvent(params: {
  title: string
  slug: string
  description: string
  start_time: string
  end_time: string
  location: string
  host: string
  external_rsvp_url?: string
  image?: string
  tags?: string[]
  capacity?: number
  price?: number
}) {
  const query = `
    INSERT INTO events (
      title, slug, description, start_time, end_time, location, host,
      external_rsvp_url, image, tags, capacity, price
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `

  const queryParams = [
    params.title,
    params.slug,
    params.description,
    params.start_time,
    params.end_time,
    params.location,
    params.host,
    params.external_rsvp_url || null,
    params.image || null,
    params.tags || [],
    params.capacity || null,
    params.price || 0,
  ]

  const result = await executeQuerySingle<Event>(query, queryParams)

  if (result.error) {
    console.error('Error creating event:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}