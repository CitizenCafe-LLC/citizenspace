/**
 * GET /api/auth/me - Get current user profile
 * PUT /api/auth/me - Update current user profile
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/auth'
import { getUserById, updateUserProfile, AuthenticationError } from '@/lib/auth/service'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request)

    if (!auth.authorized) {
      return auth.response!
    }

    // Fetch user data
    const user = await getUserById(auth.user!.userId)

    return NextResponse.json(
      {
        success: true,
        data: { user },
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

    console.error('Get user error:', error)
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

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await requireAuth(request)

    if (!auth.authorized) {
      return auth.response!
    }

    const body = await request.json()

    // Update user profile
    const user = await updateUserProfile(auth.user!.userId, {
      fullName: body.fullName,
      phone: body.phone,
      avatarUrl: body.avatarUrl,
    })

    return NextResponse.json(
      {
        success: true,
        data: { user },
        message: 'Profile updated successfully',
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

    console.error('Update user error:', error)
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

export async function POST() {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'This endpoint accepts GET and PUT requests only',
    },
    { status: 405 }
  )
}
