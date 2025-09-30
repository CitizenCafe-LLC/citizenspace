/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { verifyToken, createAccessToken } from '@/lib/auth/jwt'
import { getUserById, AuthenticationError } from '@/lib/auth/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate refresh token
    if (!body.refreshToken) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Refresh token is required',
          code: 'MISSING_TOKEN',
        },
        { status: 400 }
      )
    }

    // Verify refresh token
    let payload
    try {
      payload = await verifyToken(body.refreshToken)
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Authentication Error',
          message: 'Invalid or expired refresh token',
          code: 'INVALID_TOKEN',
        },
        { status: 401 }
      )
    }

    // Fetch current user data (in case role or other info changed)
    const user = await getUserById(payload.userId)

    // Generate new access token
    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
        message: 'Token refreshed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          error: error.name,
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      )
    }

    console.error('Token refresh error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
    },
    { status: 405 }
  )
}
