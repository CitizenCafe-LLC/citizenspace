/**
 * POST /api/auth/register
 * User registration endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerUser, AuthenticationError } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Email and password are required',
          code: 'MISSING_FIELDS',
        },
        { status: 400 }
      );
    }

    // Register user
    const result = await registerUser({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      phone: body.phone,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
        message: 'User registered successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        {
          error: error.name,
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    console.error('Registration error:', error);
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