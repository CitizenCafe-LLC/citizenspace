/**
 * POST /api/auth/reset-password
 * Reset password using token from email
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { resetPassword, AuthenticationError } from '@/lib/auth/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.token || !body.password) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Token and new password are required',
          code: 'MISSING_FIELDS',
        },
        { status: 400 }
      )
    }

    // Reset password
    const result = await resetPassword(body.token, body.password)

    return NextResponse.json(
      {
        success: true,
        message: result.message,
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

    console.error('Reset password error:', error)
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
