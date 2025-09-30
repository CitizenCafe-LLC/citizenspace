/**
 * WorkspaceSelector Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { WorkspaceSelector } from '@/components/booking/WorkspaceSelector'
import { useBookingStore } from '@/lib/stores/bookingStore'

// Mock the store
jest.mock('@/lib/stores/bookingStore')

describe('WorkspaceSelector', () => {
  const mockSetWorkspaceType = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspaceType: null,
      setWorkspaceType: mockSetWorkspaceType,
      isNftHolder: false,
    })
  })

  it('should render workspace type options', () => {
    render(<WorkspaceSelector />)

    expect(screen.getByText('Hot Desk')).toBeInTheDocument()
    expect(screen.getByText('Meeting Room')).toBeInTheDocument()
  })

  it('should display hot desk pricing', () => {
    render(<WorkspaceSelector />)

    expect(screen.getByText('$2.50')).toBeInTheDocument()
  })

  it('should display meeting room pricing', () => {
    render(<WorkspaceSelector />)

    expect(screen.getByText('$25.00')).toBeInTheDocument()
  })

  it('should call setWorkspaceType when hot desk is selected', () => {
    render(<WorkspaceSelector />)

    const hotDeskCard = screen.getByText('Hot Desk').closest('div[class*="cursor-pointer"]')
    fireEvent.click(hotDeskCard!)

    expect(mockSetWorkspaceType).toHaveBeenCalledWith('hot-desk')
  })

  it('should call setWorkspaceType when meeting room is selected', () => {
    render(<WorkspaceSelector />)

    const meetingRoomCard = screen.getByText('Meeting Room').closest('div[class*="cursor-pointer"]')
    fireEvent.click(meetingRoomCard!)

    expect(mockSetWorkspaceType).toHaveBeenCalledWith('meeting-room')
  })

  it('should show selected state when workspace is selected', () => {
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspaceType: 'hot-desk',
      setWorkspaceType: mockSetWorkspaceType,
      isNftHolder: false,
    })

    render(<WorkspaceSelector />)

    expect(screen.getByText('Selected')).toBeInTheDocument()
  })

  it('should display NFT discount when user is NFT holder', () => {
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspaceType: null,
      setWorkspaceType: mockSetWorkspaceType,
      isNftHolder: true,
    })

    render(<WorkspaceSelector />)

    // Should show discounted prices
    expect(screen.getByText('$1.25')).toBeInTheDocument() // 50% off $2.50
    expect(screen.getByText('$12.50')).toBeInTheDocument() // 50% off $25.00
    expect(screen.getAllByText('50% NFT Discount').length).toBeGreaterThan(0)
  })

  it('should show NFT holder promotion when user is not NFT holder', () => {
    render(<WorkspaceSelector />)

    expect(screen.getByText('NFT Holder Benefits')).toBeInTheDocument()
    expect(screen.getByText(/Get 50% off all bookings/)).toBeInTheDocument()
  })

  it('should not show NFT holder promotion when user is NFT holder', () => {
    ;(useBookingStore as unknown as jest.Mock).mockReturnValue({
      selectedWorkspaceType: null,
      setWorkspaceType: mockSetWorkspaceType,
      isNftHolder: true,
    })

    render(<WorkspaceSelector />)

    expect(screen.queryByText('Connect your wallet to apply discount')).not.toBeInTheDocument()
  })

  it('should display workspace features', () => {
    render(<WorkspaceSelector />)

    expect(screen.getByText('Any available desk')).toBeInTheDocument()
    expect(screen.getByText('High-speed WiFi')).toBeInTheDocument()
    expect(screen.getByText('Privacy for meetings')).toBeInTheDocument()
    expect(screen.getByText('Use member credits')).toBeInTheDocument()
  })

  it('should mark meeting room as popular', () => {
    render(<WorkspaceSelector />)

    const popularBadges = screen.getAllByText('Popular')
    expect(popularBadges.length).toBe(1)
  })
})