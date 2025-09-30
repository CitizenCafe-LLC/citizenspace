import { NextRequest } from 'next/server';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import {
  safeValidateParams,
  workspaceFiltersSchema,
  paginationSchema,
} from '@/lib/api/validation';
import { getAllWorkspaces } from '@/lib/db/repositories/workspace.repository';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/workspaces
 * List all workspaces with optional filtering and pagination
 *
 * Query Parameters:
 * - type: workspace type (hot-desk, focus-room, etc.)
 * - resource_category: desk or meeting-room
 * - min_capacity: minimum capacity
 * - max_capacity: maximum capacity
 * - min_price: minimum hourly price
 * - max_price: maximum hourly price
 * - amenities: comma-separated list of amenities
 * - available: boolean filter for availability
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 * - sortBy: field to sort by (default: created_at)
 * - sortOrder: asc or desc (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Validate filters
    const filtersValidation = safeValidateParams(workspaceFiltersSchema, params);
    if (!filtersValidation.success) {
      return badRequestResponse(`Invalid filters: ${filtersValidation.error}`);
    }

    // Validate pagination
    const paginationValidation = safeValidateParams(paginationSchema, params);
    if (!paginationValidation.success) {
      return badRequestResponse(`Invalid pagination: ${paginationValidation.error}`);
    }

    const filters = filtersValidation.data;
    const pagination = paginationValidation.data;

    // Fetch workspaces from database
    const { data, error, count } = await getAllWorkspaces(filters, pagination);

    if (error) {
      console.error('Error fetching workspaces:', error);
      return serverErrorResponse('Failed to fetch workspaces');
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / pagination.limit);

    return successResponse(
      data,
      'Workspaces retrieved successfully',
      {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        totalPages,
      }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/workspaces:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}