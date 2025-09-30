import { NextRequest } from 'next/server';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { safeValidateParams, uuidSchema } from '@/lib/api/validation';
import { getWorkspaceById } from '@/lib/db/repositories/workspace.repository';

/**
 * GET /api/workspaces/:id
 * Get detailed information about a specific workspace
 *
 * Path Parameters:
 * - id: workspace UUID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate workspace ID
    const validation = safeValidateParams(uuidSchema, params.id);
    if (!validation.success) {
      return badRequestResponse(validation.error);
    }

    const workspaceId = validation.data;

    // Fetch workspace from database
    const { data, error } = await getWorkspaceById(workspaceId);

    if (error) {
      console.error('Error fetching workspace:', error);

      // Check if it's a "not found" error
      if (error.includes('not found') || error.includes('No rows')) {
        return notFoundResponse('Workspace not found');
      }

      return serverErrorResponse('Failed to fetch workspace');
    }

    if (!data) {
      return notFoundResponse('Workspace not found');
    }

    return successResponse(data, 'Workspace retrieved successfully');
  } catch (error) {
    console.error('Unexpected error in GET /api/workspaces/:id:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}