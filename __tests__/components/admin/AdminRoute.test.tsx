/**
 * Tests for AdminRoute component
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminRoute, useAdminAccess } from '@/components/admin/AdminRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
jest.mock('next/navigation')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AdminRoute', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any)
  })

  it('shows loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    } as any)

    render(
      <AdminRoute>
        <div>Protected Content</div>
      </AdminRoute>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    } as any)

    render(
      <AdminRoute>
        <div>Protected Content</div>
      </AdminRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?redirect=/admin')
    })
  })

  it('shows 403 error for non-admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'user' },
      isLoading: false,
      isAuthenticated: true,
    } as any)

    render(
      <AdminRoute requiredRole="admin">
        <div>Protected Content</div>
      </AdminRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument()
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
  })

  it('renders children for admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'admin' },
      isLoading: false,
      isAuthenticated: true,
    } as any)

    render(
      <AdminRoute requiredRole="admin">
        <div>Protected Content</div>
      </AdminRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('renders children for staff users when staff access is required', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'staff' },
      isLoading: false,
      isAuthenticated: true,
    } as any)

    render(
      <AdminRoute requiredRole="staff">
        <div>Protected Content</div>
      </AdminRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('denies access to staff users when admin is required', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'staff' },
      isLoading: false,
      isAuthenticated: true,
    } as any)

    render(
      <AdminRoute requiredRole="admin">
        <div>Protected Content</div>
      </AdminRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('403')).toBeInTheDocument()
    })
  })
})

describe('useAdminAccess', () => {
  it('returns correct access levels for admin', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'admin' },
      isAuthenticated: true,
    } as any)

    const TestComponent = () => {
      const { hasAccess, isAdmin, isStaff, role } = useAdminAccess()
      return (
        <div>
          <span>{hasAccess ? 'Has Access' : 'No Access'}</span>
          <span>{isAdmin ? 'Is Admin' : 'Not Admin'}</span>
          <span>{isStaff ? 'Is Staff' : 'Not Staff'}</span>
          <span>{role}</span>
        </div>
      )
    }

    render(<TestComponent />)
    expect(screen.getByText('Has Access')).toBeInTheDocument()
    expect(screen.getByText('Is Admin')).toBeInTheDocument()
    expect(screen.getByText('Is Staff')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('returns correct access levels for staff', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'staff' },
      isAuthenticated: true,
    } as any)

    const TestComponent = () => {
      const { hasAccess, isAdmin, isStaff } = useAdminAccess()
      return (
        <div>
          <span>{hasAccess ? 'Has Access' : 'No Access'}</span>
          <span>{isAdmin ? 'Is Admin' : 'Not Admin'}</span>
          <span>{isStaff ? 'Is Staff' : 'Not Staff'}</span>
        </div>
      )
    }

    render(<TestComponent />)
    expect(screen.getByText('Has Access')).toBeInTheDocument()
    expect(screen.getByText('Not Admin')).toBeInTheDocument()
    expect(screen.getByText('Is Staff')).toBeInTheDocument()
  })

  it('returns no access for regular users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'user' },
      isAuthenticated: true,
    } as any)

    const TestComponent = () => {
      const { hasAccess } = useAdminAccess()
      return <div>{hasAccess ? 'Has Access' : 'No Access'}</div>
    }

    render(<TestComponent />)
    expect(screen.getByText('No Access')).toBeInTheDocument()
  })
})