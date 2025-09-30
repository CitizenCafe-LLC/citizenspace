/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides authorization functions for protecting admin and staff routes
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { TokenPayload } from './jwt'
import { authenticateRequest } from './middleware'
import { forbiddenResponse, unauthorizedResponse } from '../api/response'

/**
 * User roles in the system
 */
export type UserRole = 'user' | 'staff' | 'admin'

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin'
}

/**
 * Check if user is staff or admin
 */
export function isStaffOrAdmin(userRole: UserRole): boolean {
  return userRole === 'staff' || userRole === 'admin'
}

/**
 * Middleware to require admin role
 * Returns 403 if user is not an admin
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ authorized: boolean; user?: TokenPayload; error?: NextResponse }> {
  const authResult = await authenticateRequest(request)

  if (!authResult.authenticated || !authResult.user) {
    return {
      authorized: false,
      error: unauthorizedResponse(authResult.error || 'Authentication required'),
    }
  }

  if (!isAdmin(authResult.user.role)) {
    return {
      authorized: false,
      error: forbiddenResponse('Admin access required'),
    }
  }

  return {
    authorized: true,
    user: authResult.user,
  }
}

/**
 * Middleware to require staff or admin role
 * Returns 403 if user is not staff or admin
 */
export async function requireStaffOrAdmin(
  request: NextRequest
): Promise<{ authorized: boolean; user?: TokenPayload; error?: NextResponse }> {
  const authResult = await authenticateRequest(request)

  if (!authResult.authenticated || !authResult.user) {
    return {
      authorized: false,
      error: unauthorizedResponse(authResult.error || 'Authentication required'),
    }
  }

  if (!isStaffOrAdmin(authResult.user.role)) {
    return {
      authorized: false,
      error: forbiddenResponse('Staff or admin access required'),
    }
  }

  return {
    authorized: true,
    user: authResult.user,
  }
}

/**
 * Middleware to require specific role(s)
 * Generic function that checks if user has any of the required roles
 */
export async function requireRole(
  request: NextRequest,
  requiredRoles: UserRole[]
): Promise<{ authorized: boolean; user?: TokenPayload; error?: NextResponse }> {
  const authResult = await authenticateRequest(request)

  if (!authResult.authenticated || !authResult.user) {
    return {
      authorized: false,
      error: unauthorizedResponse(authResult.error || 'Authentication required'),
    }
  }

  if (!hasRole(authResult.user.role, requiredRoles)) {
    return {
      authorized: false,
      error: forbiddenResponse(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`
      ),
    }
  }

  return {
    authorized: true,
    user: authResult.user,
  }
}

/**
 * Higher-order function to wrap route handlers with admin authorization
 */
export function withAdminAuth(
  handler: (
    request: NextRequest,
    context: { user: TokenPayload; params?: any }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const authCheck = await requireAdmin(request)

    if (!authCheck.authorized || !authCheck.user) {
      return authCheck.error!
    }

    return handler(request, { user: authCheck.user, params: context?.params })
  }
}

/**
 * Higher-order function to wrap route handlers with staff/admin authorization
 */
export function withStaffOrAdminAuth(
  handler: (
    request: NextRequest,
    context: { user: TokenPayload; params?: any }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const authCheck = await requireStaffOrAdmin(request)

    if (!authCheck.authorized || !authCheck.user) {
      return authCheck.error!
    }

    return handler(request, { user: authCheck.user, params: context?.params })
  }
}

/**
 * Higher-order function to wrap route handlers with custom role authorization
 */
export function withRoleAuth(
  requiredRoles: UserRole[],
  handler: (
    request: NextRequest,
    context: { user: TokenPayload; params?: any }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const authCheck = await requireRole(request, requiredRoles)

    if (!authCheck.authorized || !authCheck.user) {
      return authCheck.error!
    }

    return handler(request, { user: authCheck.user, params: context?.params })
  }
}

/**
 * Check if user can manage resource (resource ownership or admin)
 * Useful for endpoints where users can manage their own resources or admins can manage all
 */
export function canManageResource(
  user: TokenPayload,
  resourceOwnerId: string
): boolean {
  return user.userId === resourceOwnerId || isAdmin(user.role)
}

/**
 * Extract IP address from request
 */
export function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    null
  )
}

/**
 * Extract User-Agent from request
 */
export function getUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent') || null
}