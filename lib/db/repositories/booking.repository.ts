import { executeQuery, executeQuerySingle } from '../postgres'
import type { Booking, MembershipCredit, CreditTransaction, User } from '../types'
import { Workspace } from '../types'

/**
 * Repository for booking-related database operations
 * Handles all CRUD operations for bookings, credits, and transactions
 */

export interface CreateBookingParams {
  user_id: string
  workspace_id: string
  booking_type: 'hourly-desk' | 'meeting-room' | 'day-pass'
  booking_date: string
  start_time: string
  end_time: string
  duration_hours: number
  attendees: number
  subtotal: number
  discount_amount: number
  nft_discount_applied: boolean
  credits_used?: number
  credits_overage_hours?: number
  overage_charge?: number
  processing_fee: number
  total_price: number
  special_requests?: string
  payment_method: 'card' | 'credits' | 'membership'
  payment_intent_id?: string
}

export interface UpdateBookingParams {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status?: 'pending' | 'paid' | 'refunded'
  payment_intent_id?: string
  check_in_time?: string
  check_out_time?: string
  actual_duration_hours?: number
  final_charge?: number
}

/**
 * Generate unique confirmation code
 */
function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

/**
 * Create a new booking
 */
export async function createBooking(params: CreateBookingParams) {
  const confirmationCode = generateConfirmationCode()

  const query = `
    INSERT INTO bookings (
      user_id, workspace_id, booking_type, booking_date, start_time, end_time,
      duration_hours, attendees, subtotal, discount_amount, nft_discount_applied,
      credits_used, credits_overage_hours, overage_charge, processing_fee, total_price,
      special_requests, payment_method, payment_intent_id, confirmation_code, status,
      payment_status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
    )
    RETURNING *
  `

  const queryParams = [
    params.user_id,
    params.workspace_id,
    params.booking_type,
    params.booking_date,
    params.start_time,
    params.end_time,
    params.duration_hours,
    params.attendees,
    params.subtotal,
    params.discount_amount,
    params.nft_discount_applied,
    params.credits_used || null,
    params.credits_overage_hours || null,
    params.overage_charge || null,
    params.processing_fee,
    params.total_price,
    params.special_requests || null,
    params.payment_method,
    params.payment_intent_id || null,
    confirmationCode,
    'pending',
    'pending',
  ]

  const result = await executeQuerySingle<Booking>(query, queryParams)

  if (result.error) {
    console.error('Error creating booking:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string) {
  const query = `
    SELECT
      b.*,
      jsonb_build_object(
        'id', w.id,
        'name', w.name,
        'type', w.type,
        'resource_category', w.resource_category,
        'capacity', w.capacity,
        'base_price_hourly', w.base_price_hourly,
        'amenities', w.amenities,
        'available', w.available
      ) as workspaces,
      jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'full_name', u.full_name,
        'nft_holder', u.nft_holder
      ) as users
    FROM bookings b
    LEFT JOIN workspaces w ON b.workspace_id = w.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.id = $1
  `

  const result = await executeQuerySingle<Booking>(query, [id])

  if (result.error) {
    console.error('Error fetching booking:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(
  userId: string,
  filters?: {
    status?: string
    booking_type?: string
    start_date?: string
    end_date?: string
  }
) {
  const whereClauses: string[] = ['b.user_id = $1']
  const params: any[] = [userId]
  let paramCount = 2

  if (filters?.status) {
    whereClauses.push(`b.status = $${paramCount++}`)
    params.push(filters.status)
  }

  if (filters?.booking_type) {
    whereClauses.push(`b.booking_type = $${paramCount++}`)
    params.push(filters.booking_type)
  }

  if (filters?.start_date) {
    whereClauses.push(`b.booking_date >= $${paramCount++}`)
    params.push(filters.start_date)
  }

  if (filters?.end_date) {
    whereClauses.push(`b.booking_date <= $${paramCount++}`)
    params.push(filters.end_date)
  }

  const query = `
    SELECT
      b.*,
      jsonb_build_object(
        'id', w.id,
        'name', w.name,
        'type', w.type,
        'resource_category', w.resource_category,
        'capacity', w.capacity,
        'base_price_hourly', w.base_price_hourly,
        'amenities', w.amenities,
        'available', w.available
      ) as workspaces
    FROM bookings b
    LEFT JOIN workspaces w ON b.workspace_id = w.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY b.booking_date DESC, b.start_time DESC
  `

  const result = await executeQuery<Booking>(query, params)

  if (result.error) {
    console.error('Error fetching user bookings:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Get active booking for user (currently checked in)
 */
export async function getActiveBooking(userId: string) {
  const query = `
    SELECT
      b.*,
      jsonb_build_object(
        'id', w.id,
        'name', w.name,
        'type', w.type,
        'resource_category', w.resource_category,
        'capacity', w.capacity,
        'base_price_hourly', w.base_price_hourly,
        'amenities', w.amenities,
        'available', w.available
      ) as workspaces
    FROM bookings b
    LEFT JOIN workspaces w ON b.workspace_id = w.id
    WHERE b.user_id = $1
      AND b.status = 'confirmed'
      AND b.check_in_time IS NOT NULL
      AND b.check_out_time IS NULL
    LIMIT 1
  `

  const result = await executeQuerySingle<Booking>(query, [userId])

  if (result.error) {
    console.error('Error fetching active booking:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Update booking
 */
export async function updateBooking(id: string, params: UpdateBookingParams) {
  const setClauses: string[] = []
  const queryParams: any[] = []
  let paramCount = 1

  if (params.status !== undefined) {
    setClauses.push(`status = $${paramCount++}`)
    queryParams.push(params.status)
  }

  if (params.payment_status !== undefined) {
    setClauses.push(`payment_status = $${paramCount++}`)
    queryParams.push(params.payment_status)
  }

  if (params.payment_intent_id !== undefined) {
    setClauses.push(`payment_intent_id = $${paramCount++}`)
    queryParams.push(params.payment_intent_id)
  }

  if (params.check_in_time !== undefined) {
    setClauses.push(`check_in_time = $${paramCount++}`)
    queryParams.push(params.check_in_time)
  }

  if (params.check_out_time !== undefined) {
    setClauses.push(`check_out_time = $${paramCount++}`)
    queryParams.push(params.check_out_time)
  }

  if (params.actual_duration_hours !== undefined) {
    setClauses.push(`actual_duration_hours = $${paramCount++}`)
    queryParams.push(params.actual_duration_hours)
  }

  if (params.final_charge !== undefined) {
    setClauses.push(`final_charge = $${paramCount++}`)
    queryParams.push(params.final_charge)
  }

  if (setClauses.length === 0) {
    return { data: null, error: 'No fields to update' }
  }

  queryParams.push(id)

  const query = `
    UPDATE bookings
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING *
  `

  const result = await executeQuerySingle<Booking>(query, queryParams)

  if (result.error) {
    console.error('Error updating booking:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Cancel booking
 */
export async function cancelBooking(id: string) {
  return updateBooking(id, {
    status: 'cancelled',
  })
}

/**
 * Check in to booking
 */
export async function checkInBooking(id: string) {
  const now = new Date().toISOString()
  return updateBooking(id, {
    check_in_time: now,
    status: 'confirmed',
  })
}

/**
 * Check out from booking
 */
export async function checkOutBooking(
  id: string,
  actualDurationHours: number,
  finalCharge: number
) {
  const now = new Date().toISOString()
  return updateBooking(id, {
    check_out_time: now,
    actual_duration_hours: actualDurationHours,
    final_charge: finalCharge,
    status: 'completed',
  })
}

/**
 * Get user's membership credits
 */
export async function getUserCredits(
  userId: string,
  creditType: 'meeting-room' | 'printing' | 'guest-pass'
) {
  const query = `
    SELECT * FROM membership_credits
    WHERE user_id = $1
      AND credit_type = $2
      AND status = 'active'
    LIMIT 1
  `

  const result = await executeQuerySingle<MembershipCredit>(query, [userId, creditType])

  if (result.error) {
    console.error('Error fetching user credits:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Deduct credits from user's account
 */
export async function deductCredits(
  creditId: string,
  amount: number,
  bookingId: string,
  description: string
) {
  // Get current credit record
  const fetchQuery = 'SELECT * FROM membership_credits WHERE id = $1'
  const creditResult = await executeQuerySingle<MembershipCredit>(fetchQuery, [creditId])

  if (creditResult.error || !creditResult.data) {
    return { data: null, error: creditResult.error || 'Credit not found' }
  }

  const credit = creditResult.data
  const newUsedAmount = credit.used_amount + amount
  const newRemainingAmount = credit.remaining_amount - amount

  if (newRemainingAmount < 0) {
    return { data: null, error: 'Insufficient credits' }
  }

  // Update credit record
  const updateQuery = `
    UPDATE membership_credits
    SET used_amount = $1, remaining_amount = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `

  const updateResult = await executeQuerySingle<MembershipCredit>(updateQuery, [
    newUsedAmount,
    newRemainingAmount,
    creditId,
  ])

  if (updateResult.error) {
    console.error('Error updating credits:', updateResult.error)
    return { data: null, error: updateResult.error }
  }

  // Create transaction record
  const transactionQuery = `
    INSERT INTO credit_transactions (
      user_id, membership_credit_id, booking_id, transaction_type,
      amount, balance_after, description
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `

  const transactionResult = await executeQuerySingle(transactionQuery, [
    credit.user_id,
    creditId,
    bookingId,
    'usage',
    -amount,
    newRemainingAmount,
    description,
  ])

  if (transactionResult.error) {
    console.error('Error creating credit transaction:', transactionResult.error)
    // Don't fail the whole operation if transaction logging fails
  }

  return { data: updateResult.data, error: null }
}

/**
 * Refund credits to user's account
 */
export async function refundCredits(
  creditId: string,
  amount: number,
  bookingId: string,
  description: string
) {
  // Get current credit record
  const fetchQuery = 'SELECT * FROM membership_credits WHERE id = $1'
  const creditResult = await executeQuerySingle<MembershipCredit>(fetchQuery, [creditId])

  if (creditResult.error || !creditResult.data) {
    return { data: null, error: creditResult.error || 'Credit not found' }
  }

  const credit = creditResult.data
  const newUsedAmount = Math.max(0, credit.used_amount - amount)
  const newRemainingAmount = credit.remaining_amount + amount

  // Update credit record
  const updateQuery = `
    UPDATE membership_credits
    SET used_amount = $1, remaining_amount = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `

  const updateResult = await executeQuerySingle<MembershipCredit>(updateQuery, [
    newUsedAmount,
    newRemainingAmount,
    creditId,
  ])

  if (updateResult.error) {
    console.error('Error refunding credits:', updateResult.error)
    return { data: null, error: updateResult.error }
  }

  // Create transaction record
  const transactionQuery = `
    INSERT INTO credit_transactions (
      user_id, membership_credit_id, booking_id, transaction_type,
      amount, balance_after, description
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `

  const transactionResult = await executeQuerySingle(transactionQuery, [
    credit.user_id,
    creditId,
    bookingId,
    'refund',
    amount,
    newRemainingAmount,
    description,
  ])

  if (transactionResult.error) {
    console.error('Error creating credit transaction:', transactionResult.error)
  }

  return { data: updateResult.data, error: null }
}

/**
 * Get credit transactions for a user
 */
export async function getCreditTransactions(
  userId: string,
  creditType?: 'meeting-room' | 'printing' | 'guest-pass'
) {
  const whereClauses: string[] = ['ct.user_id = $1']
  const params: any[] = [userId]
  let paramCount = 2

  if (creditType) {
    whereClauses.push(`mc.credit_type = $${paramCount++}`)
    params.push(creditType)
  }

  const query = `
    SELECT
      ct.*,
      jsonb_build_object(
        'credit_type', mc.credit_type
      ) as membership_credits,
      jsonb_build_object(
        'confirmation_code', b.confirmation_code,
        'booking_date', b.booking_date
      ) as bookings
    FROM credit_transactions ct
    LEFT JOIN membership_credits mc ON ct.membership_credit_id = mc.id
    LEFT JOIN bookings b ON ct.booking_id = b.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY ct.created_at DESC
  `

  const result = await executeQuery<CreditTransaction>(query, params)

  if (result.error) {
    console.error('Error fetching credit transactions:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Check if workspace is available for booking
 */
export async function isWorkspaceAvailable(
  workspaceId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<{ available: boolean; error: string | null }> {
  const whereClauses: string[] = [
    'workspace_id = $1',
    'booking_date = $2',
    "status IN ('confirmed', 'pending')",
  ]
  const params: any[] = [workspaceId, date]
  let paramCount = 3

  if (excludeBookingId) {
    whereClauses.push(`id != $${paramCount++}`)
    params.push(excludeBookingId)
  }

  const query = `
    SELECT start_time, end_time FROM bookings
    WHERE ${whereClauses.join(' AND ')}
  `

  const result = await executeQuery<{ start_time: string; end_time: string }>(query, params)

  if (result.error) {
    console.error('Error checking availability:', result.error)
    return { available: false, error: result.error }
  }

  const bookings = result.data || []

  // Convert time to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const requestStart = timeToMinutes(startTime)
  const requestEnd = timeToMinutes(endTime)

  // Check for overlaps
  for (const booking of bookings) {
    const bookingStart = timeToMinutes(booking.start_time)
    const bookingEnd = timeToMinutes(booking.end_time)

    // Check for overlap: (StartA < EndB) and (EndA > StartB)
    if (requestStart < bookingEnd && requestEnd > bookingStart) {
      return { available: false, error: null }
    }
  }

  return { available: true, error: null }
}

/**
 * Get user by ID with membership info
 */
export async function getUserWithMembership(userId: string) {
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
        'meeting_room_credits_hours', mp.meeting_room_credits_hours,
        'printing_credits', mp.printing_credits,
        'cafe_discount_percentage', mp.cafe_discount_percentage,
        'guest_passes_per_month', mp.guest_passes_per_month,
        'access_hours', mp.access_hours,
        'includes_hot_desk', mp.includes_hot_desk
      ) as membership_plans
    FROM users u
    LEFT JOIN membership_plans mp ON u.membership_plan_id = mp.id
    WHERE u.id = $1
  `

  const result = await executeQuerySingle<User>(query, [userId])

  if (result.error) {
    console.error('Error fetching user:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * ADMIN FUNCTIONS
 */

/**
 * Get all bookings with filters (admin/staff)
 */
export async function getAllBookings(filters?: {
  status?: string
  booking_type?: string
  user_id?: string
  workspace_id?: string
  start_date?: string
  end_date?: string
  payment_status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const whereClauses: string[] = []
  const params: any[] = []
  let paramCount = 1

  if (filters?.status) {
    whereClauses.push(`b.status = $${paramCount++}`)
    params.push(filters.status)
  }

  if (filters?.booking_type) {
    whereClauses.push(`b.booking_type = $${paramCount++}`)
    params.push(filters.booking_type)
  }

  if (filters?.user_id) {
    whereClauses.push(`b.user_id = $${paramCount++}`)
    params.push(filters.user_id)
  }

  if (filters?.workspace_id) {
    whereClauses.push(`b.workspace_id = $${paramCount++}`)
    params.push(filters.workspace_id)
  }

  if (filters?.start_date) {
    whereClauses.push(`b.booking_date >= $${paramCount++}`)
    params.push(filters.start_date)
  }

  if (filters?.end_date) {
    whereClauses.push(`b.booking_date <= $${paramCount++}`)
    params.push(filters.end_date)
  }

  if (filters?.payment_status) {
    whereClauses.push(`b.payment_status = $${paramCount++}`)
    params.push(filters.payment_status)
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

  // Count total records
  const countQuery = `SELECT COUNT(*) FROM bookings b ${whereClause}`
  const countResult = await executeQuerySingle<{ count: string }>(countQuery, params)
  const count = parseInt(countResult.data?.count || '0')

  // Build pagination
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  const sortBy = filters?.sortBy || 'b.booking_date'
  const sortOrder = filters?.sortOrder === 'asc' ? 'ASC' : 'DESC'

  params.push(limit, offset)

  const query = `
    SELECT
      b.*,
      jsonb_build_object(
        'id', w.id,
        'name', w.name,
        'type', w.type,
        'resource_category', w.resource_category
      ) as workspaces,
      jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'full_name', u.full_name,
        'nft_holder', u.nft_holder
      ) as users
    FROM bookings b
    LEFT JOIN workspaces w ON b.workspace_id = w.id
    LEFT JOIN users u ON b.user_id = u.id
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `

  const result = await executeQuery<Booking>(query, params)

  if (result.error) {
    console.error('Error fetching all bookings:', result.error)
    return { data: null, error: result.error, count: 0 }
  }

  return { data: result.data, error: null, count }
}

/**
 * Update booking with admin notes (admin only)
 */
export async function updateBookingAdmin(
  id: string,
  params: UpdateBookingParams & {
    booking_date?: string
    start_time?: string
    end_time?: string
    workspace_id?: string
    admin_notes?: string
  }
) {
  const setClauses: string[] = []
  const queryParams: any[] = []
  let paramCount = 1

  if (params.status !== undefined) {
    setClauses.push(`status = $${paramCount++}`)
    queryParams.push(params.status)
  }

  if (params.payment_status !== undefined) {
    setClauses.push(`payment_status = $${paramCount++}`)
    queryParams.push(params.payment_status)
  }

  if (params.booking_date !== undefined) {
    setClauses.push(`booking_date = $${paramCount++}`)
    queryParams.push(params.booking_date)
  }

  if (params.start_time !== undefined) {
    setClauses.push(`start_time = $${paramCount++}`)
    queryParams.push(params.start_time)
  }

  if (params.end_time !== undefined) {
    setClauses.push(`end_time = $${paramCount++}`)
    queryParams.push(params.end_time)
  }

  if (params.workspace_id !== undefined) {
    setClauses.push(`workspace_id = $${paramCount++}`)
    queryParams.push(params.workspace_id)
  }

  if (params.admin_notes !== undefined) {
    setClauses.push(`admin_notes = $${paramCount++}`)
    queryParams.push(params.admin_notes)
  }

  if (setClauses.length === 0) {
    return { data: null, error: 'No fields to update' }
  }

  queryParams.push(id)

  const query = `
    UPDATE bookings
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING *
  `

  const result = await executeQuerySingle<Booking>(query, queryParams)

  if (result.error) {
    console.error('Error updating booking:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}

/**
 * Delete/cancel booking with reason (admin only)
 */
export async function deleteBookingAdmin(id: string, reason?: string) {
  // First, get the booking to check if refund is needed
  const booking = await getBookingById(id)

  if (booking.error || !booking.data) {
    return { data: null, error: 'Booking not found' }
  }

  // Update booking to cancelled with reason
  const updateQuery = `
    UPDATE bookings
    SET status = 'cancelled',
        admin_notes = CONCAT(COALESCE(admin_notes, ''), ' [CANCELLED BY ADMIN: ', $1, ']'),
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `

  const result = await executeQuerySingle<Booking>(updateQuery, [
    reason || 'No reason provided',
    id,
  ])

  if (result.error) {
    console.error('Error deleting booking:', result.error)
    return { data: null, error: result.error }
  }

  return {
    data: result.data,
    error: null,
    shouldRefund: booking.data.payment_status === 'paid'
  }
}

/**
 * Get booking statistics (admin dashboard)
 */
export async function getBookingStatistics(filters?: {
  start_date?: string
  end_date?: string
}) {
  const whereClauses: string[] = []
  const params: any[] = []
  let paramCount = 1

  if (filters?.start_date) {
    whereClauses.push(`booking_date >= $${paramCount++}`)
    params.push(filters.start_date)
  }

  if (filters?.end_date) {
    whereClauses.push(`booking_date <= $${paramCount++}`)
    params.push(filters.end_date)
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

  const query = `
    SELECT
      COUNT(*) as total_bookings,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
      COUNT(*) FILTER (WHERE booking_type = 'hourly-desk') as hourly_desk_bookings,
      COUNT(*) FILTER (WHERE booking_type = 'meeting-room') as meeting_room_bookings,
      COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue,
      COALESCE(AVG(total_price) FILTER (WHERE payment_status = 'paid'), 0) as average_booking_value,
      COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'refunded'), 0) as total_refunded
    FROM bookings
    ${whereClause}
  `

  const result = await executeQuerySingle(query, params)

  if (result.error) {
    console.error('Error fetching booking statistics:', result.error)
    return { data: null, error: result.error }
  }

  // Parse numeric fields
  const stats = result.data
    ? {
        ...result.data,
        total_revenue: parseFloat(result.data.total_revenue || '0'),
        average_booking_value: parseFloat(result.data.average_booking_value || '0'),
        total_refunded: parseFloat(result.data.total_refunded || '0'),
      }
    : null

  return { data: stats, error: null }
}

/**
 * Get popular booking times (admin analytics)
 */
export async function getPopularBookingTimes() {
  const query = `
    SELECT
      EXTRACT(HOUR FROM start_time::time) as hour,
      COUNT(*) as booking_count
    FROM bookings
    WHERE status != 'cancelled'
      AND booking_date >= NOW() - INTERVAL '90 days'
    GROUP BY hour
    ORDER BY booking_count DESC
    LIMIT 10
  `

  const result = await executeQuery(query)

  if (result.error) {
    console.error('Error fetching popular times:', result.error)
    return { data: null, error: result.error }
  }

  return { data: result.data, error: null }
}
