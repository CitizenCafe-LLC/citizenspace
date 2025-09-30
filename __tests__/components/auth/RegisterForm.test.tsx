/**
 * RegisterForm Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '@/components/auth/RegisterForm'

// Mock the AuthContext
const mockRegister = jest.fn()

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    register: mockRegister,
    user: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all registration form fields', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('shows password strength indicator', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    await user.type(passwordInput, 'Weak1')

    await waitFor(() => {
      expect(screen.getByText(/password strength/i)).toBeInTheDocument()
    })
  })

  it('validates password requirements', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Test weak password
    await user.type(passwordInput, 'weak')
    await user.tab()

    await waitFor(() => {
      expect(
        screen.getByText(/password must contain at least one uppercase letter/i)
      ).toBeInTheDocument()
    })
  })

  it('validates password confirmation match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  it('requires terms acceptance', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/you must accept the terms/i)).toBeInTheDocument()
    })
  })

  it('calls register function with correct data on valid submit', async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()

    mockRegister.mockResolvedValue(undefined)

    render(<RegisterForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone/i), '+1234567890')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'john@example.com',
        'Password123',
        'John Doe',
        '+1234567890'
      )
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('displays error message on registration failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Email already exists'
    const onError = jest.fn()

    mockRegister.mockRejectedValue(new Error(errorMessage))

    render(<RegisterForm onError={onError} />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(onError).toHaveBeenCalled()
    })
  })

  it('disables form while submitting', async () => {
    const user = userEvent.setup()

    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})