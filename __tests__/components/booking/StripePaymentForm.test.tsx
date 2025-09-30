/**
 * StripePaymentForm Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StripePaymentForm, FreeBookingConfirmation } from '@/components/booking/StripePaymentForm'
import { useRouter } from 'next/navigation'

// Mock Stripe
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  useStripe: () => ({
    confirmPayment: jest.fn(),
  }),
  useElements: () => ({
    submit: jest.fn(),
  }),
}))

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('StripePaymentForm', () => {
  const mockPush = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('should show loading state initially', () => {
    render(
      <StripePaymentForm
        bookingId="test-booking-id"
        clientSecret="test-secret"
        amount={10}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('Loading payment form...')).toBeInTheDocument()
  })

  it('should render payment form when loaded', async () => {
    render(
      <StripePaymentForm
        bookingId="test-booking-id"
        clientSecret="test-secret"
        amount={10}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument()
    })
  })

  it('should display payment amount', async () => {
    render(
      <StripePaymentForm
        bookingId="test-booking-id"
        clientSecret="test-secret"
        amount={25.50}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Pay $25.50')).toBeInTheDocument()
    })
  })

  it('should show secure payment message', async () => {
    render(
      <StripePaymentForm
        bookingId="test-booking-id"
        clientSecret="test-secret"
        amount={10}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Secure payment processed by Stripe/)).toBeInTheDocument()
    })
  })
})

describe('FreeBookingConfirmation', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('should render confirmation message', () => {
    render(<FreeBookingConfirmation bookingId="test-booking-id" />)

    expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument()
    expect(screen.getByText(/fully covered by credits/)).toBeInTheDocument()
  })

  it('should have view confirmation button', () => {
    render(<FreeBookingConfirmation bookingId="test-booking-id" />)

    const button = screen.getByRole('button', { name: /View Confirmation/i })
    expect(button).toBeInTheDocument()
  })

  it('should navigate to confirmation page when button is clicked', () => {
    render(<FreeBookingConfirmation bookingId="test-booking-id" />)

    const button = screen.getByRole('button', { name: /View Confirmation/i })
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/booking/confirmation/test-booking-id')
  })
})