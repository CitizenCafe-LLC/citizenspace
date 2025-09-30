/**
 * Authentication Middleware
 * Protects routes and validates JWT tokens
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { TokenPayload } from './jwt'
import { verifyToken, extractTokenFromHeader } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload
}

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ authenticated: boolean; user?: TokenPayload; error?: string }> {
  try {
    const authHeader = request.headers.get('Authorization')
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
      error: error instanceof Error ? error.message : 'Invalid authentication token',
    }
  }
}

/**
 * Higher-order function to protect API routes
 * @param handler - The route handler function
 * @param options - Optional configuration
 */
export function withAuth(
  handler: (request: NextRequest, context: { user: TokenPayload }) => Promise<NextResponse>,
  options: {
    roles?: Array<'user' | 'staff' | 'admin'>
    requireNftHolder?: boolean
  } = {}
) {
  return async (request: NextRequest, ...args: any[]) => {
    const authResult = await authenticateRequest(request)

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: authResult.error || 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }

    // Check role-based access
    if (options.roles && !options.roles.includes(authResult.user.role)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      )
    }

    // Check NFT holder requirement
    if (options.requireNftHolder && !authResult.user.nftHolder) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'NFT holder status required',
          code: 'NFT_REQUIRED',
        },
        { status: 403 }
      )
    }

    // Call the actual handler with authenticated user
    return handler(request, { user: authResult.user })
  }
}

/**
 * Middleware for staff-only routes
 */
export function withStaffAuth(
  handler: (request: NextRequest, context: { user: TokenPayload }) => Promise<NextResponse>
) {
  return withAuth(handler, { roles: ['staff', 'admin'] })
}

/**
 * Middleware for admin-only routes
 */
export function withAdminAuth(
  handler: (request: NextRequest, context: { user: TokenPayload }) => Promise<NextResponse>
) {
  return withAuth(handler, { roles: ['admin'] })
}

/**
 * Middleware for NFT holder routes
 */
export function withNftHolderAuth(
  handler: (request: NextRequest, context: { user: TokenPayload }) => Promise<NextResponse>
) {
  return withAuth(handler, { requireNftHolder: true })
}

/**
 * Extract user from authenticated request (for use in route handlers)
 */
export async function getCurrentUser(request: NextRequest): Promise<TokenPayload | null> {
  const authResult = await authenticateRequest(request)
  return authResult.user || null
}

/**
 * Check if user has specific role
 */
export function hasRole(user: TokenPayload, roles: Array<'user' | 'staff' | 'admin'>): boolean {
  return roles.includes(user.role)
}

/**
 * Check if user is NFT holder
 */
export function isNftHolder(user: TokenPayload): boolean {
  return user.nftHolder === true
}
