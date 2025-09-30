/**
 * PricingSummary Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react'
import { PricingSummary } from '@/components/booking/PricingSummary'
import { useBookingStore } from '@/lib/stores/bookingStore'

jest.mock('@/lib/stores/bookingStore')

describe('PricingSummary', () => {
  const mockSetPricing = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show placeholder when no workspace selected', () => {
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspace: null,
      duration: 2,
      isNftHolder: false,
      isMember: false,
      creditBalance: 0,
      setPricing: mockSetPricing,
    })

    render(<PricingSummary />)

    expect(screen.getByText('Select a workspace and date to see pricing')).toBeInTheDocument()
  })

  it('should calculate hot desk pricing without discounts', async () => {
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

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspace: mockWorkspace,
      duration: 4,
      isNftHolder: false,
      isMember: false,
      creditBalance: 0,
      setPricing: mockSetPricing,
    })

    render(<PricingSummary />)

    await waitFor(() => {
      expect(screen.getByText('Hot Desk 1')).toBeInTheDocument()
      expect(screen.getByText(/\$2\.50\/hour × 4 hours/)).toBeInTheDocument()
      expect(screen.getByText('$10.00')).toBeInTheDocument() // Base price
    })
  })

  it('should calculate pricing with NFT discount', async () => {
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

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspace: mockWorkspace,
      duration: 4,
      isNftHolder: true,
      isMember: false,
      creditBalance: 0,
      setPricing: mockSetPricing,
    })

    render(<PricingSummary />)

    await waitFor(() => {
      expect(screen.getByText(/NFT Holder Discount/)).toBeInTheDocument()
      expect(screen.getByText(/-\$5\.00/)).toBeInTheDocument() // 50% discount
    })
  })

  it('should calculate pricing with credits for meeting room', async () => {
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

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspace: mockWorkspace,
      duration: 3,
      isNftHolder: false,
      isMember: true,
      creditBalance: 5,
      setPricing: mockSetPricing,
    })

    render(<PricingSummary />)

    await waitFor(() => {
      expect(screen.getByText(/Credits Applied/)).toBeInTheDocument()
      expect(screen.getByText(/3 hours/)).toBeInTheDocument()
      expect(screen.getByText('Fully Covered by Credits')).toBeInTheDocument()
    })
  })

  it('should calculate overage when credits are insufficient', async () => {
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

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspace: mockWorkspace,
      duration: 5,
      isNftHolder: false,
      isMember: true,
      creditBalance: 2,
      setPricing: mockSetPricing,
    })

    render(<PricingSummary />)

    await waitFor(() => {
      expect(screen.getByText(/Credits Applied.*2 hours/)).toBeInTheDocument()
      expect(screen.getByText(/Overage.*3 hours/)).toBeInTheDocument()
      expect(screen.getByText('$75.00')).toBeInTheDocument() // 3 hours overage
    })
  })

  it('should combine credits and NFT discount', async () => {
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

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspace: mockWorkspace,
      duration: 4,
      isNftHolder: true,
      isMember: true,
      creditBalance: 2,
      setPricing: mockSetPricing,
    })

    render(<PricingSummary />)

    await waitFor(() => {
      // 2 hours covered by credits
      expect(screen.getByText(/Credits Applied.*2 hours/)).toBeInTheDocument()
      // 2 hours overage = $50, with 50% NFT discount = $25
      expect(screen.getByText(/NFT Holder Discount/)).toBeInTheDocument()
      expect(screen.getByText(/-\$25\.00/)).toBeInTheDocument()
    })
  })

  it('should include processing fee in total', async () => {
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

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspace: mockWorkspace,
      duration: 4,
      isNftHolder: false,
      isMember: false,
      creditBalance: 0,
      setPricing: mockSetPricing,
    })

    render(<PricingSummary />)

    await waitFor(() => {
      expect(screen.getByText('Processing Fee:')).toBeInTheDocument()
      // Processing fee should be calculated (2.9% + $0.30)
    })
  })

  it('should call setPricing with calculated values', async () => {
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

    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspace: mockWorkspace,
      duration: 4,
      isNftHolder: false,
      isMember: false,
      creditBalance: 0,
      setPricing: mockSetPricing,
    })

    render(<PricingSummary />)

    await waitFor(() => {
      expect(mockSetPricing).toHaveBeenCalled()
      const call = mockSetPricing.mock.calls[0][0]
      expect(call).toHaveProperty('subtotal')
      expect(call).toHaveProperty('totalPrice')
      expect(call).toHaveProperty('processingFee')
    })
  })
})