/**
 * POST /api/auth/forgot-password
 * Initiate password reset process
 */

import { NextRequest, NextResponse } from 'next/server';
import { initiatePasswordReset } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate email
    if (!body.email) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Email is required',
          code: 'MISSING_EMAIL',
        },
        { status: 400 }
      );
    }

    // Initiate password reset
    const result = await initiatePasswordReset(body.email);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists, a password reset email will be sent',
      },
      { status: 200 }
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