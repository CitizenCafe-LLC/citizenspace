/**
 * POST /api/auth/logout
 * User logout endpoint
 *
 * Note: Since we're using stateless JWT tokens, logout is primarily
 * handled client-side by removing tokens. This endpoint exists for
 * logging and potential token blacklisting in the future.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request);

    if (!auth.authorized) {
      return auth.response!;
    }

    // In a production system, you might want to:
    // 1. Add the token to a blacklist/revocation list
    // 2. Log the logout event
    // 3. Clear any server-side sessions

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
    },
    { status: 405 }
  );
}