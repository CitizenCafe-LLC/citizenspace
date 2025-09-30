/**
 * BookingWizard Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookingWizard } from '@/components/booking/BookingWizard'
import { useBookingStore } from '@/lib/stores/bookingStore'

// Mock the store
jest.mock('@/lib/stores/bookingStore')

// Mock child components
jest.mock('@/components/booking/WorkspaceSelector', () => ({
  WorkspaceSelector: () => <div data-testid="workspace-selector">WorkspaceSelector</div>,
}))

jest.mock('@/components/booking/DateTimePicker', () => ({
  DateTimePicker: () => <div data-testid="date-time-picker">DateTimePicker</div>,
}))

jest.mock('@/components/booking/PricingSummary', () => ({
  PricingSummary: () => <div data-testid="pricing-summary">PricingSummary</div>,
}))

// Mock fetch
global.fetch = jest.fn()

describe('BookingWizard', () => {
  const mockNextStep = jest.fn()
  const mockPreviousStep = jest.fn()
  const mockSetCurrentStep = jest.fn()
  const mockCanProceedToNextStep = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      currentStep: 1,
      setCurrentStep: mockSetCurrentStep,
      nextStep: mockNextStep,
      previousStep: mockPreviousStep,
      canProceedToNextStep: mockCanProceedToNextStep,
      selectedWorkspaceType: null,
      selectedWorkspace: null,
      bookingDate: null,
      startTime: null,
      endTime: null,
      duration: 2,
      attendees: 1,
      specialRequests: '',
      totalPrice: 0,
      resetBooking: jest.fn(),
    })

    mockCanProceedToNextStep.mockReturnValue(false)
  })

  it('should render progress bar', () => {
    render(<BookingWizard />)

    expect(screen.getByText('Workspace Type')).toBeInTheDocument()
    expect(screen.getByText('Date & Time')).toBeInTheDocument()
    expect(screen.getByText('Select Space')).toBeInTheDocument()
    expect(screen.getByText('Review & Pay')).toBeInTheDocument()
  })

  it('should show WorkspaceSelector on step 1', () => {
    render(<BookingWizard />)

    expect(screen.getByTestId('workspace-selector')).toBeInTheDocument()
  })

  it('should show DateTimePicker on step 2', () => {
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      ...useBookingStore(),
      currentStep: 2,
    })

    render(<BookingWizard />)

    expect(screen.getByTestId('date-time-picker')).toBeInTheDocument()
  })

  it('should disable Next button when cannot proceed', () => {
    mockCanProceedToNextStep.mockReturnValue(false)

    render(<BookingWizard />)

    const nextButton = screen.getByRole('button', { name: /Next Step/i })
    expect(nextButton).toBeDisabled()
  })

  it('should enable Next button when can proceed', () => {
    mockCanProceedToNextStep.mockReturnValue(true)

    render(<BookingWizard />)

    const nextButton = screen.getByRole('button', { name: /Next Step/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('should call nextStep when Next button is clicked', () => {
    mockCanProceedToNextStep.mockReturnValue(true)

    render(<BookingWizard />)

    const nextButton = screen.getByRole('button', { name: /Next Step/i })
    fireEvent.click(nextButton)

    expect(mockNextStep).toHaveBeenCalled()
  })

  it('should call previousStep when Back button is clicked', () => {
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      ...useBookingStore(),
      currentStep: 2,
    })

    render(<BookingWizard />)

    const backButton = screen.getByRole('button', { name: /Back/i })
    fireEvent.click(backButton)

    expect(mockPreviousStep).toHaveBeenCalled()
  })

  it('should disable Back button on step 1', () => {
    render(<BookingWizard />)

    const backButton = screen.getByRole('button', { name: /Back/i })
    expect(backButton).toBeDisabled()
  })

  it('should show pricing summary from step 2 onwards', () => {
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      ...useBookingStore(),
      currentStep: 2,
    })

    render(<BookingWizard />)

    expect(screen.getByTestId('pricing-summary')).toBeInTheDocument()
  })

  it('should fetch available workspaces on step 3', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workspaces: [
            {
              is_available: true,
              workspace: {
                id: 'test-id',
                name: 'Test Workspace',
              },
            },
          ],
        },
      }),
    })

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      ...useBookingStore(),
      currentStep: 3,
      selectedWorkspaceType: 'hot-desk',
      bookingDate: new Date('2025-10-01'),
      startTime: '09:00',
      endTime: '11:00',
    })

    render(<BookingWizard />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workspaces/availability')
      )
    })
  })

  it('should show loading state while fetching workspaces', () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      ...useBookingStore(),
      currentStep: 3,
      selectedWorkspaceType: 'hot-desk',
      bookingDate: new Date('2025-10-01'),
      startTime: '09:00',
      endTime: '11:00',
    })

    render(<BookingWizard />)

    expect(screen.getByText('Loading available workspaces...')).toBeInTheDocument()
  })

  it('should show error when workspace fetch fails', async () => {
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch' }),
    })

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      ...useBookingStore(),
      currentStep: 3,
      selectedWorkspaceType: 'hot-desk',
      bookingDate: new Date('2025-10-01'),
      startTime: '09:00',
      endTime: '11:00',
    })

    render(<BookingWizard />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument()
    })
  })

  it('should mark completed steps with checkmark', () => {
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      ...useBookingStore(),
      currentStep: 3,
    })

    render(<BookingWizard />)

    // Steps 1 and 2 should show checkmarks (completed)
    const stepIndicators = screen.getAllByRole('img', { hidden: true })
    expect(stepIndicators.length).toBeGreaterThan(0)
  })
})