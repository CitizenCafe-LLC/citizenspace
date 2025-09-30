/**
 * ProtectedRoute Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute, usePermissions } from '@/components/auth/ProtectedRoute'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock AuthContext
const mockUseAuth = jest.fn()

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('ProtectedRoute', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('shows loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
  })

  it('redirects to login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'user', nftHolder: false },
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
  })

  it('redirects to custom path when specified', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    })

    render(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login')
    })
  })

  it('blocks non-admin users when requireAdmin is true', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'user', nftHolder: false },
    })

    render(
      <ProtectedRoute requireAdmin={true}>
        <div>Admin Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/403')
      expect(screen.queryByText(/admin content/i)).not.toBeInTheDocument()
    })
  })

  it('allows admin users when requireAdmin is true', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'admin', nftHolder: false },
    })

    render(
      <ProtectedRoute requireAdmin={true}>
        <div>Admin Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(/admin content/i)).toBeInTheDocument()
  })

  it('allows staff and admin when requireStaff is true', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'staff', nftHolder: false },
    })

    render(
      <ProtectedRoute requireStaff={true}>
        <div>Staff Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(/staff content/i)).toBeInTheDocument()
  })

  it('blocks regular users when requireStaff is true', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'user', nftHolder: false },
    })

    render(
      <ProtectedRoute requireStaff={true}>
        <div>Staff Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/403')
      expect(screen.queryByText(/staff content/i)).not.toBeInTheDocument()
    })
  })
})

describe('usePermissions', () => {
  it('returns correct permissions for admin user', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'admin', nftHolder: true },
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isStaff).toBe(true)
    expect(result.current.isNFTHolder).toBe(true)
    expect(result.current.canAccessAdmin).toBe(true)
    expect(result.current.canAccessStaffFeatures).toBe(true)
  })

  it('returns correct permissions for staff user', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'staff', nftHolder: false },
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isStaff).toBe(true)
    expect(result.current.isNFTHolder).toBe(false)
    expect(result.current.canAccessAdmin).toBe(false)
    expect(result.current.canAccessStaffFeatures).toBe(true)
  })

  it('returns correct permissions for regular user', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'user', nftHolder: false },
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isStaff).toBe(false)
    expect(result.current.isNFTHolder).toBe(false)
    expect(result.current.canAccessAdmin).toBe(false)
    expect(result.current.canAccessStaffFeatures).toBe(false)
  })
})

// Helper function to render hooks
function renderHook(hook: () => any) {
  let result: any = null
  function TestComponent() {
    result = hook()
    return null
  }
  render(<TestComponent />)
  return { result }
}