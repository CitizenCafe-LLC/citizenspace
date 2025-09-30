/**
 * Authentication Middleware
 * Protects API routes by verifying JWT tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, TokenPayload } from '../lib/auth/jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authMiddleware(request: NextRequest): Promise<{
  authenticated: boolean
  user?: TokenPayload
  error?: string
}> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return {
        authenticated: false,
        error: 'No authentication token provided',
      }
    }

    const user = await verifyToken(token)

    return {
      authenticated: true,
      user,
    }
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Invalid or expired token',
    }
  }
}

/**
 * Requires authentication - returns error response if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<{
  authorized: boolean
  user?: TokenPayload
  response?: NextResponse
}> {
  const auth = await authMiddleware(request)

  if (!auth.authenticated) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: 'Unauthorized',
          message: auth.error || 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      ),
    }
  }

  return {
    authorized: true,
    user: auth.user,
  }
}

/**
 * Requires specific role - returns error if user doesn't have required role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: Array<'user' | 'staff' | 'admin'>
): Promise<{
  authorized: boolean
  user?: TokenPayload
  response?: NextResponse
}> {
  const auth = await requireAuth(request)

  if (!auth.authorized) {
    return auth
  }

  if (!auth.user || !allowedRoles.includes(auth.user.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
    }
  }

  return {
    authorized: true,
    user: auth.user,
  }
}

/**
 * Optional authentication - doesn't fail if not authenticated
 */
export async function optionalAuth(request: NextRequest): Promise<TokenPayload | null> {
  const auth = await authMiddleware(request)
  return auth.authenticated ? auth.user! : null
}
