/**
 * AdminRoute Component
 * HOC for protecting admin routes with role-based access control
 */

'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'staff'
}

export function AdminRoute({ children, requiredRole = 'staff' }: AdminRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated || !user) {
        router.push('/login?redirect=/admin')
        return
      }

      // Check role-based access
      const hasAccess =
        user.role === 'admin' ||
        (requiredRole === 'staff' && user.role === 'staff')

      // User doesn't have required permissions
      if (!hasAccess) {
        router.push('/dashboard')
        return
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or no access
  if (!isAuthenticated || !user) {
    return null
  }

  const hasAccess =
    user.role === 'admin' ||
    (requiredRole === 'staff' && user.role === 'staff')

  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-destructive">403</h1>
          <p className="mt-2 text-lg font-semibold">Access Denied</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Hook to check if user has admin access
 */
export function useAdminAccess(requiredRole: 'admin' | 'staff' = 'staff') {
  const { user, isAuthenticated } = useAuth()

  const hasAccess =
    isAuthenticated &&
    user &&
    (user.role === 'admin' || (requiredRole === 'staff' && user.role === 'staff'))

  return {
    hasAccess,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    role: user?.role,
  }
}