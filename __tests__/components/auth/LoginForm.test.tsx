/**
 * LoginForm Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the AuthContext
const mockLogin = jest.fn()

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form with email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, 'short')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('calls login function with correct data on submit', async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()

    mockLogin.mockResolvedValue(undefined)

    render(<LoginForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123')
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    const onError = jest.fn()

    mockLogin.mockRejectedValue(new Error(errorMessage))

    render(<LoginForm onError={onError} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(onError).toHaveBeenCalled()
    })
  })

  it('disables form fields and button while loading', async () => {
    const user = userEvent.setup()

    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})