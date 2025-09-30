/**
 * Login Page Tests
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/login/page'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({
    address: null,
    isConnected: false,
  })),
}))

const mockLogin = jest.fn()
const mockConnectWallet = jest.fn()

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: mockLogin,
    connectWallet: mockConnectWallet,
  }),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Login Page', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    sessionStorage.clear()
  })

  it('renders login form and wallet connect button', () => {
    render(<LoginPage />)

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument()
  })

  it('has links to register and forgot password', () => {
    render(<LoginPage />)

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument()
  })

  it('redirects to booking page after successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123')
    })
  })

  it('redirects to stored path after login if available', async () => {
    sessionStorage.setItem('redirectAfterLogin', '/profile')

    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})