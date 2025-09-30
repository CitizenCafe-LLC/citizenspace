/**
 * ProtectedRoute Component
 * HOC to protect routes requiring authentication
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireAdmin?: boolean
  requireStaff?: boolean
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireAdmin = false,
  requireStaff = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store the current path to redirect back after login
        const currentPath = window.location.pathname + window.location.search
        sessionStorage.setItem('redirectAfterLogin', currentPath)
        router.push(redirectTo)
        return
      }

      // Check role-based access
      if (requireAdmin && user?.role !== 'admin') {
        router.push('/403') // Forbidden
        return
      }

      if (requireStaff && user?.role !== 'staff' && user?.role !== 'admin') {
        router.push('/403') // Forbidden
        return
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, requireAdmin, requireStaff])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Check role-based access
  if (requireAdmin && user?.role !== 'admin') {
    return null
  }

  if (requireStaff && user?.role !== 'staff' && user?.role !== 'admin') {
    return null
  }

  return <>{children}</>
}

/**
 * Hook to check if user has specific permissions
 */
export function usePermissions() {
  const { user } = useAuth()

  return {
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    isNFTHolder: user?.nftHolder || false,
    canAccessAdmin: user?.role === 'admin',
    canAccessStaffFeatures: user?.role === 'staff' || user?.role === 'admin',
  }
}