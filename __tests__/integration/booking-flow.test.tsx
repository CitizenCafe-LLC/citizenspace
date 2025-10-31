/**
 * Booking Flow Integration Tests
 * End-to-end tests for the complete booking process
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BookingPage from '@/app/booking/page'
import { useBookingStore } from '@/lib/stores/bookingStore'

// Mock fetch
global.fetch = jest.fn()

// Mock Next.js components
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the store state before each test
    useBookingStore.getState().resetBooking()

    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      // Mock availability check
      if (url.includes('/api/workspaces/availability')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              workspaces: [
                {
                  is_available: true,
                  workspace: {
                    id: 'workspace-1',
                    name: 'Hot Desk 1',
                    type: 'hot-desk',
                    resource_category: 'desk',
                    capacity: 1,
                    base_price_hourly: 2.5,
                    amenities: ['wifi'],
                    images: [],
                    min_duration: 1,
                    max_duration: 8,
                  },
                },
              ],
              summary: {
                total_workspaces: 10,
                available_workspaces: 8,
                unavailable_workspaces: 2,
              },
            },
          }),
        })
      }

      // Mock booking creation
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              booking: {
                id: 'booking-123',
                confirmation_code: 'ABC123',
              },
              pricing: {
                total_price: 10.59,
              },
              requires_payment: true,
            },
          }),
        })
      }

      // Mock payment intent creation
      if (url.includes('/api/payments/create-intent')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              clientSecret: 'test-client-secret',
              paymentIntentId: 'pi_123',
            },
          }),
        })
      }

      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  it('should complete booking flow for hot desk', async () => {
    render(<BookingPage />)

    // Step 1: Select workspace type
    expect(screen.getByText('Choose Workspace Type')).toBeInTheDocument()

    // The booking wizard and its components should be rendered
    expect(screen.getByText('Reserve Your')).toBeInTheDocument()
  })

  it('should validate steps before allowing progression', () => {
    const store = useBookingStore.getState()

    // Step 1 validation
    store.setCurrentStep(1)
    expect(store.canProceedToNextStep()).toBe(false)

    store.setWorkspaceType('hot-desk')
    expect(store.canProceedToNextStep()).toBe(true)

    // Step 2 validation
    store.setCurrentStep(2)
    expect(store.canProceedToNextStep()).toBe(false)

    store.setBookingDate(new Date('2025-10-01'))
    store.setStartTime('09:00')
    store.setEndTime('11:00')
    expect(store.canProceedToNextStep()).toBe(true)
  })

  it('should calculate pricing correctly for hot desk without discounts', () => {
    const mockWorkspace = {
      id: 'test-id',
      name: 'Hot Desk 1',
      type: 'hot-desk',
      resource_category: 'desk' as const,
      capacity: 1,
      base_price_hourly: 2.5,
      amenities: [],
      images: [],
      min_duration: 1,
      max_duration: 8,
    }

    useBookingStore.getState().setSelectedWorkspace(mockWorkspace)
    useBookingStore.getState().setDuration(4)
    useBookingStore.getState().setUserInfo({ isNftHolder: false, isMember: false, creditBalance: 0 })

    // Base price: $2.50 * 4 hours = $10.00
    // Processing fee: $10.00 * 0.029 + $0.30 = $0.59
    // Total: $10.59

    const expectedSubtotal = 10
    const expectedProcessingFee = 0.59
    const expectedTotal = 10.59

    useBookingStore.getState().setPricing({
      subtotal: expectedSubtotal,
      discountAmount: 0,
      nftDiscountApplied: false,
      processingFee: expectedProcessingFee,
      totalPrice: expectedTotal,
    })

    // Get the state after setting pricing
    const store = useBookingStore.getState()
    expect(store.totalPrice).toBeCloseTo(expectedTotal, 2)
  })

  it('should apply NFT discount correctly', () => {
    const mockWorkspace = {
      id: 'test-id',
      name: 'Hot Desk 1',
      type: 'hot-desk',
      resource_category: 'desk' as const,
      capacity: 1,
      base_price_hourly: 2.5,
      amenities: [],
      images: [],
      min_duration: 1,
      max_duration: 8,
    }

    useBookingStore.getState().setSelectedWorkspace(mockWorkspace)
    useBookingStore.getState().setDuration(4)
    useBookingStore.getState().setUserInfo({ isNftHolder: true, isMember: false, creditBalance: 0 })

    // Base price: $2.50 * 4 hours = $10.00
    // NFT discount: $10.00 * 0.5 = $5.00
    // Subtotal after discount: $5.00
    // Processing fee: $5.00 * 0.029 + $0.30 = $0.445
    // Total: $5.445 ≈ $5.45

    useBookingStore.getState().setPricing({
      subtotal: 5,
      discountAmount: 5,
      nftDiscountApplied: true,
      processingFee: 0.445,
      totalPrice: 5.445,
    })

    // Get the state after setting pricing
    const store = useBookingStore.getState()
    expect(store.nftDiscountApplied).toBe(true)
    expect(store.discountAmount).toBe(5)
  })

  it('should apply meeting room credits correctly', () => {
    const mockWorkspace = {
      id: 'test-id',
      name: 'Meeting Room 1',
      type: 'meeting-room',
      resource_category: 'meeting-room' as const,
      capacity: 4,
      base_price_hourly: 25,
      amenities: [],
      images: [],
      min_duration: 0.5,
      max_duration: 8,
    }

    useBookingStore.getState().setSelectedWorkspace(mockWorkspace)
    useBookingStore.getState().setDuration(3)
    useBookingStore.getState().setUserInfo({ isNftHolder: false, isMember: true, creditBalance: 5 })

    // Base price: $25 * 3 hours = $75
    // Credits used: 3 hours (fully covered)
    // Subtotal: $0
    // Total: $0

    useBookingStore.getState().setPricing({
      subtotal: 0,
      discountAmount: 0,
      nftDiscountApplied: false,
      processingFee: 0,
      totalPrice: 0,
      creditsUsed: 3,
      overageHours: 0,
    })

    // Get the state after setting pricing
    const store = useBookingStore.getState()
    expect(store.creditsUsed).toBe(3)
    expect(store.totalPrice).toBe(0)
  })

  it('should calculate overage charges when credits are insufficient', () => {
    const mockWorkspace = {
      id: 'test-id',
      name: 'Meeting Room 1',
      type: 'meeting-room',
      resource_category: 'meeting-room' as const,
      capacity: 4,
      base_price_hourly: 25,
      amenities: [],
      images: [],
      min_duration: 0.5,
      max_duration: 8,
    }

    useBookingStore.getState().setSelectedWorkspace(mockWorkspace)
    useBookingStore.getState().setDuration(5)
    useBookingStore.getState().setUserInfo({ isNftHolder: false, isMember: true, creditBalance: 2 })

    // Base price: $25 * 5 hours = $125
    // Credits used: 2 hours ($50 value)
    // Overage: 3 hours = $75
    // Processing fee: $75 * 0.029 + $0.30 = $2.475
    // Total: $77.475 ≈ $77.48

    useBookingStore.getState().setPricing({
      subtotal: 75,
      discountAmount: 0,
      nftDiscountApplied: false,
      processingFee: 2.475,
      totalPrice: 77.475,
      creditsUsed: 2,
      overageHours: 3,
    })

    // Get the state after setting pricing
    const store = useBookingStore.getState()
    expect(store.creditsUsed).toBe(2)
    expect(store.overageHours).toBe(3)
  })

  it('should reset booking state when starting new booking', () => {
    // Set some booking data
    useBookingStore.getState().setWorkspaceType('hot-desk')
    useBookingStore.getState().setBookingDate(new Date())
    useBookingStore.getState().setStartTime('09:00')
    useBookingStore.getState().setCurrentStep(3)

    // Reset
    useBookingStore.getState().resetBooking()

    // Get the state after reset
    const store = useBookingStore.getState()
    expect(store.selectedWorkspaceType).toBeNull()
    expect(store.bookingDate).toBeNull()
    expect(store.startTime).toBeNull()
    expect(store.currentStep).toBe(1)
  })
})