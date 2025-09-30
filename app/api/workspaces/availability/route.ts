import { NextRequest } from 'next/server';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import {
  safeValidateParams,
  availabilityQuerySchema,
  validateFutureDate,
  validateTimeRange,
} from '@/lib/api/validation';
import { checkWorkspaceAvailability } from '@/lib/db/repositories/workspace.repository';

/**
 * GET /api/workspaces/availability
 * Check workspace availability for a specific date and time
 *
 * This endpoint implements sophisticated availability checking logic:
 * - Queries existing bookings for specified date
 * - Prevents double-booking by checking time conflicts
 * - Returns available time slots for all matching workspaces
 * - Can filter by specific workspace, resource category, or duration
 *
 * Query Parameters:
 * - date: date in YYYY-MM-DD format (required)
 * - workspace_id: specific workspace UUID (optional)
 * - start_time: start time in HH:MM format (optional)
 * - end_time: end time in HH:MM format (optional)
 * - duration_hours: minimum duration in hours (optional)
 * - resource_category: desk or meeting-room (optional)
 *
 * Response includes:
 * - List of workspaces with availability status
 * - Available time slots for each workspace
 * - Total available hours per workspace
 *
 * Examples:
 * 1. Check if specific workspace is available for time slot:
 *    /api/workspaces/availability?date=2025-10-01&workspace_id=xxx&start_time=09:00&end_time=12:00
 *
 * 2. Get all available meeting rooms for a date:
 *    /api/workspaces/availability?date=2025-10-01&resource_category=meeting-room
 *
 * 3. Find desks available for at least 4 hours:
 *    /api/workspaces/availability?date=2025-10-01&resource_category=desk&duration_hours=4
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validation = safeValidateParams(availabilityQuerySchema, params);
    if (!validation.success) {
      return badRequestResponse(`Invalid parameters: ${validation.error}`);
    }

    const query = validation.data;

    // Additional business rule validations

    // 1. Validate date is not in the past
    if (!validateFutureDate(query.date)) {
      return badRequestResponse('Date must be today or in the future');
    }

    // 2. If both start_time and end_time provided, validate range
    if (query.start_time && query.end_time) {
      if (!validateTimeRange(query.start_time, query.end_time)) {
        return badRequestResponse('End time must be after start time');
      }
    }

    // 3. Both start_time and end_time must be provided together
    if ((query.start_time && !query.end_time) || (!query.start_time && query.end_time)) {
      return badRequestResponse('Both start_time and end_time must be provided together');
    }

    // 4. Validate business hours (7 AM - 10 PM)
    if (query.start_time) {
      const [startHour] = query.start_time.split(':').map(Number);
      if (startHour < 7 || startHour >= 22) {
        return badRequestResponse('Start time must be between 7:00 AM and 10:00 PM');
      }
    }

    if (query.end_time) {
      const [endHour, endMinute] = query.end_time.split(':').map(Number);
      const endTimeInMinutes = endHour * 60 + endMinute;
      if (endTimeInMinutes > 22 * 60) {
        return badRequestResponse('End time must be no later than 10:00 PM');
      }
    }

    // Check availability
    const { data, error } = await checkWorkspaceAvailability(query);

    if (error) {
      console.error('Error checking availability:', error);
      return serverErrorResponse('Failed to check workspace availability');
    }

    // Transform response to include useful information
    const response = data?.map(result => ({
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
        type: result.workspace.type,
        resource_category: result.workspace.resource_category,
        capacity: result.workspace.capacity,
        base_price_hourly: result.workspace.base_price_hourly,
        amenities: result.workspace.amenities,
        images: result.workspace.images,
        min_duration: result.workspace.min_duration,
        max_duration: result.workspace.max_duration,
      },
      is_available: result.is_available,
      available_slots: result.slots,
      total_available_hours: result.total_available_hours || 0,
    }));

    // Count available vs unavailable workspaces
    const availableCount = response?.filter(r => r.is_available).length || 0;
    const totalCount = response?.length || 0;

    return successResponse(
      {
        date: query.date,
        workspaces: response,
        summary: {
          total_workspaces: totalCount,
          available_workspaces: availableCount,
          unavailable_workspaces: totalCount - availableCount,
        },
      },
      'Availability check completed successfully'
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/workspaces/availability:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}