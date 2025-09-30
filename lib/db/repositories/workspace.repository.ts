import { executeQuery, executeQuerySingle } from '../postgres';
import {
  Workspace,
  WorkspaceFilters,
  PaginationParams,
  AvailabilityQuery,
  AvailabilitySlot,
  Booking,
} from '../types';

/**
 * Repository for workspace-related database operations
 * Implements data access layer with proper error handling
 * Uses PostgreSQL directly instead of Supabase
 */

/**
 * Get all workspaces with optional filtering and pagination
 */
export async function getAllWorkspaces(
  filters?: WorkspaceFilters,
  pagination?: PaginationParams
) {
  try {
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Build WHERE clauses based on filters
    if (filters) {
      if (filters.type) {
        whereClauses.push(`type = $${paramCount++}`);
        params.push(filters.type);
      }
      if (filters.resource_category) {
        whereClauses.push(`resource_category = $${paramCount++}`);
        params.push(filters.resource_category);
      }
      if (filters.min_capacity !== undefined) {
        whereClauses.push(`capacity >= $${paramCount++}`);
        params.push(filters.min_capacity);
      }
      if (filters.max_capacity !== undefined) {
        whereClauses.push(`capacity <= $${paramCount++}`);
        params.push(filters.max_capacity);
      }
      if (filters.min_price !== undefined) {
        whereClauses.push(`base_price_hourly >= $${paramCount++}`);
        params.push(filters.min_price);
      }
      if (filters.max_price !== undefined) {
        whereClauses.push(`base_price_hourly <= $${paramCount++}`);
        params.push(filters.max_price);
      }
      if (filters.amenities && filters.amenities.length > 0) {
        whereClauses.push(`amenities @> $${paramCount++}::jsonb`);
        params.push(JSON.stringify(filters.amenities));
      }
      if (filters.available !== undefined) {
        whereClauses.push(`available = $${paramCount++}`);
        params.push(filters.available);
      }
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Build ORDER BY clause
    const sortBy = pagination?.sortBy || 'created_at';
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const orderClause = `ORDER BY ${sortBy} ${sortOrder}`;

    // Build LIMIT and OFFSET
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;
    const limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    // Count total records
    const countQuery = `SELECT COUNT(*) FROM workspaces ${whereClause}`;
    const countResult = await executeQuerySingle<{ count: string }>(
      countQuery,
      params.slice(0, params.length - 2) // Exclude LIMIT and OFFSET params
    );

    if (countResult.error) {
      return { data: null, error: countResult.error, count: 0 };
    }

    const count = parseInt(countResult.data?.count || '0');

    // Fetch data
    const dataQuery = `
      SELECT * FROM workspaces
      ${whereClause}
      ${orderClause}
      ${limitClause}
    `;

    const result = await executeQuery<Workspace>(dataQuery, params);

    if (result.error) {
      return { data: null, error: result.error, count: 0 };
    }

    return { data: result.data, error: null, count };
  } catch (error) {
    console.error('Error in getAllWorkspaces:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
      count: 0,
    };
  }
}

/**
 * Get workspace by ID
 */
export async function getWorkspaceById(id: string) {
  const query = 'SELECT * FROM workspaces WHERE id = $1';
  const result = await executeQuerySingle<Workspace>(query, [id]);

  if (result.error) {
    console.error('Error fetching workspace:', result.error);
    return { data: null, error: result.error };
  }

  if (!result.data) {
    return { data: null, error: 'Workspace not found' };
  }

  return { data: result.data, error: null };
}

/**
 * Get hot desks (workspaces with resource_category = 'desk')
 */
export async function getHotDesks(pagination?: PaginationParams) {
  return getAllWorkspaces(
    { resource_category: 'desk' },
    pagination
  );
}

/**
 * Get meeting rooms (workspaces with resource_category = 'meeting-room')
 */
export async function getMeetingRooms(pagination?: PaginationParams) {
  return getAllWorkspaces(
    { resource_category: 'meeting-room' },
    pagination
  );
}

/**
 * Get bookings for a workspace on a specific date
 */
export async function getWorkspaceBookings(
  workspaceId: string,
  date: string
) {
  const query = `
    SELECT * FROM bookings
    WHERE workspace_id = $1
    AND booking_date = $2
    AND status IN ('confirmed', 'pending')
    ORDER BY start_time ASC
  `;

  const result = await executeQuery<Booking>(query, [workspaceId, date]);

  if (result.error) {
    console.error('Error fetching bookings:', result.error);
    return { data: null, error: result.error };
  }

  return { data: result.data, error: null };
}

/**
 * Get all bookings for a specific date across all workspaces
 */
export async function getAllBookingsForDate(date: string) {
  const query = `
    SELECT b.*, w.*
    FROM bookings b
    LEFT JOIN workspaces w ON b.workspace_id = w.id
    WHERE b.booking_date = $1
    AND b.status IN ('confirmed', 'pending')
    ORDER BY b.start_time ASC
  `;

  const result = await executeQuery<Booking>(query, [date]);

  if (result.error) {
    console.error('Error fetching bookings:', result.error);
    return { data: null, error: result.error };
  }

  return { data: result.data, error: null };
}

/**
 * Check if a workspace is available for a specific time slot
 */
export function isTimeSlotAvailable(
  bookings: Booking[],
  startTime: string,
  endTime: string
): boolean {
  // Convert times to minutes for easier comparison
  const requestStart = timeToMinutes(startTime);
  const requestEnd = timeToMinutes(endTime);

  // Check if requested time overlaps with any existing booking
  for (const booking of bookings) {
    const bookingStart = timeToMinutes(booking.start_time);
    const bookingEnd = timeToMinutes(booking.end_time);

    // Check for overlap: (StartA < EndB) and (EndA > StartB)
    if (requestStart < bookingEnd && requestEnd > bookingStart) {
      return false; // Time slot conflicts with existing booking
    }
  }

  return true; // No conflicts found
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Generate available time slots for a workspace
 * Splits the day into available slots between bookings
 */
export function generateAvailableSlots(
  workspace: Workspace,
  bookings: Booking[],
  date: string,
  minDuration: number = 1
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];

  // Business hours: 7:00 AM to 10:00 PM (420 to 1320 minutes)
  const dayStart = 7 * 60; // 7:00 AM
  const dayEnd = 22 * 60; // 10:00 PM

  // Sort bookings by start time
  const sortedBookings = [...bookings].sort((a, b) =>
    timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  );

  let currentTime = dayStart;

  // Generate slots between bookings
  for (const booking of sortedBookings) {
    const bookingStart = timeToMinutes(booking.start_time);
    const bookingEnd = timeToMinutes(booking.end_time);

    // If there's a gap before this booking
    if (currentTime < bookingStart) {
      const gapDuration = (bookingStart - currentTime) / 60;
      if (gapDuration >= minDuration) {
        slots.push({
          start_time: minutesToTime(currentTime),
          end_time: minutesToTime(bookingStart),
          available: true,
          workspace_id: workspace.id,
          workspace_name: workspace.name,
        });
      }
    }

    // Mark booking time as unavailable
    slots.push({
      start_time: minutesToTime(bookingStart),
      end_time: minutesToTime(bookingEnd),
      available: false,
      workspace_id: workspace.id,
      workspace_name: workspace.name,
    });

    currentTime = Math.max(currentTime, bookingEnd);
  }

  // Add remaining time until end of day
  if (currentTime < dayEnd) {
    const remainingDuration = (dayEnd - currentTime) / 60;
    if (remainingDuration >= minDuration) {
      slots.push({
        start_time: minutesToTime(currentTime),
        end_time: minutesToTime(dayEnd),
        available: true,
        workspace_id: workspace.id,
        workspace_name: workspace.name,
      });
    }
  }

  return slots;
}

/**
 * Check availability for multiple workspaces
 * Returns workspaces with availability information
 */
export async function checkWorkspaceAvailability(
  query: AvailabilityQuery
) {
  try {
    // Build workspace query
    const whereClauses: string[] = ['available = true'];
    const params: any[] = [];
    let paramCount = 1;

    if (query.workspace_id) {
      whereClauses.push(`id = $${paramCount++}`);
      params.push(query.workspace_id);
    }

    if (query.resource_category) {
      whereClauses.push(`resource_category = $${paramCount++}`);
      params.push(query.resource_category);
    }

    const workspaceQuery = `
      SELECT * FROM workspaces
      WHERE ${whereClauses.join(' AND ')}
    `;

    const workspacesResult = await executeQuery<Workspace>(workspaceQuery, params);

    if (workspacesResult.error || !workspacesResult.data) {
      return { data: null, error: workspacesResult.error || 'Failed to fetch workspaces' };
    }

    const workspaces = workspacesResult.data;

    // Get all bookings for the specified date
    const { data: bookings, error: bookingError } = await getAllBookingsForDate(query.date);

    if (bookingError) {
      return { data: null, error: bookingError };
    }

    // Calculate availability for each workspace
    const availabilityResults = workspaces.map(workspace => {
      const workspaceBookings = bookings?.filter(b => b.workspace_id === workspace.id) || [];

      // If specific time slot is requested, check that slot
      if (query.start_time && query.end_time) {
        const available = isTimeSlotAvailable(workspaceBookings, query.start_time, query.end_time);
        return {
          workspace,
          is_available: available,
          slots: available ? [{
            start_time: query.start_time,
            end_time: query.end_time,
            available: true,
            workspace_id: workspace.id,
            workspace_name: workspace.name,
          }] : [],
        };
      }

      // Otherwise, generate all available slots for the day
      const minDuration = query.duration_hours || workspace.min_duration;
      const slots = generateAvailableSlots(workspace, workspaceBookings, query.date, minDuration);
      const availableSlots = slots.filter(slot => slot.available);

      return {
        workspace,
        is_available: availableSlots.length > 0,
        slots: availableSlots,
        total_available_hours: availableSlots.reduce((sum, slot) => {
          const duration = timeToMinutes(slot.end_time) - timeToMinutes(slot.start_time);
          return sum + (duration / 60);
        }, 0),
      };
    });

    return { data: availabilityResults, error: null };
  } catch (error) {
    console.error('Error in checkWorkspaceAvailability:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to check availability',
    };
  }
}