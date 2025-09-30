/**
 * POST /api/auth/login
 * User login endpoint
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { loginUser, AuthenticationError } from '@/lib/auth/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Email and password are required',
          code: 'MISSING_FIELDS',
        },
        { status: 400 }
      )
    }

    // Login user
    const result = await loginUser({
      email: body.email,
      password: body.password,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
        message: 'Login successful',
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

    console.error('Login error:', error)
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
