/**
 * Register Page Tests
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import RegisterPage from '@/app/register/page'

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

const mockRegister = jest.fn()
const mockConnectWallet = jest.fn()

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    register: mockRegister,
    connectWallet: mockConnectWallet,
  }),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Register Page', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it('renders registration form', () => {
    render(<RegisterPage />)

    expect(screen.getByText(/create an account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('has link to login page', () => {
    render(<RegisterPage />)

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
  })

  it('redirects to booking page after successful registration', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValueOnce(undefined)

    render(<RegisterPage />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'john@example.com',
        'Password123',
        'John Doe',
        undefined
      )
    })
  })

  it('displays error message on registration failure', async () => {
    const user = userEvent.setup()
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'))

    render(<RegisterPage />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })
})