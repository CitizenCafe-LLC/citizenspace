/**
 * AuthContext Tests
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Mock fetch
global.fetch = jest.fn()

// Helper component to test the context
function TestComponent() {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="loading">{auth.isLoading ? 'true' : 'false'}</div>
      <div data-testid="user">{auth.user?.email || 'null'}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('provides initial unauthenticated state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })
  })

  it('handles successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: null,
      walletAddress: null,
      nftHolder: false,
      role: 'user' as const,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: mockUser,
        },
      }),
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Verify localStorage was updated
    expect(localStorage.getItem('citizenspace_access_token')).toBe('access-token')
    expect(localStorage.getItem('citizenspace_refresh_token')).toBe('refresh-token')
  })

  it('handles login failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials',
      }),
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      try {
        screen.getByText('Login').click()
      } catch (error) {
        // Expected to throw
      }
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })
  })

  it('handles logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: null,
      walletAddress: null,
      nftHolder: false,
      role: 'user' as const,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    }

    // Mock successful login
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: mockUser,
        },
      }),
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Login first
    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    // Mock logout
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    // Logout
    await act(async () => {
      screen.getByText('Logout').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(localStorage.getItem('citizenspace_access_token')).toBeNull()
    })
  })

  it('loads auth data from localStorage on mount', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: null,
      walletAddress: null,
      nftHolder: false,
      role: 'user' as const,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    }

    // Pre-populate localStorage
    localStorage.setItem('citizenspace_access_token', 'stored-token')
    localStorage.setItem('citizenspace_refresh_token', 'stored-refresh')
    localStorage.setItem('citizenspace_user', JSON.stringify(mockUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })

  it('handles register successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'newuser@example.com',
      fullName: 'New User',
      phone: null,
      walletAddress: null,
      nftHolder: false,
      role: 'user' as const,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: mockUser,
        },
      }),
    })

    function RegisterTestComponent() {
      const auth = useAuth()
      return (
        <div>
          <div data-testid="user">{auth.user?.email || 'null'}</div>
          <button
            onClick={() =>
              auth.register('newuser@example.com', 'Password123', 'New User', '+1234567890')
            }
          >
            Register
          </button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <RegisterTestComponent />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Register').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('newuser@example.com')
    })
  })
})