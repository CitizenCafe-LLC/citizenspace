/**
 * Booking Store Tests
 * Tests for Zustand booking state management
 */

import { renderHook, act } from '@testing-library/react'
import { useBookingStore } from '@/lib/stores/bookingStore'

describe('useBookingStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useBookingStore())
    act(() => {
      result.current.resetBooking()
    })
  })

  describe('Workspace Selection', () => {
    it('should set workspace type', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setWorkspaceType('hot-desk')
      })

      expect(result.current.selectedWorkspaceType).toBe('hot-desk')
    })

    it('should set selected workspace', () => {
      const { result } = renderHook(() => useBookingStore())

      const mockWorkspace = {
        id: 'test-id',
        name: 'Test Workspace',
        type: 'hot-desk',
        resource_category: 'desk' as const,
        capacity: 1,
        base_price_hourly: 2.5,
        amenities: ['wifi'],
        images: [],
        min_duration: 1,
        max_duration: 8,
      }

      act(() => {
        result.current.setSelectedWorkspace(mockWorkspace)
      })

      expect(result.current.selectedWorkspace).toEqual(mockWorkspace)
    })
  })

  describe('Date and Time Selection', () => {
    it('should set booking date', () => {
      const { result } = renderHook(() => useBookingStore())
      const testDate = new Date('2025-10-01')

      act(() => {
        result.current.setBookingDate(testDate)
      })

      expect(result.current.bookingDate).toEqual(testDate)
    })

    it('should set start time', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setStartTime('09:00')
      })

      expect(result.current.startTime).toBe('09:00')
    })

    it('should calculate duration when end time is set', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setStartTime('09:00')
        result.current.setEndTime('11:30')
      })

      expect(result.current.duration).toBe(2.5)
    })

    it('should handle manual duration setting', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setDuration(4)
      })

      expect(result.current.duration).toBe(4)
    })
  })

  describe('Pricing', () => {
    it('should set pricing information', () => {
      const { result } = renderHook(() => useBookingStore())

      const pricing = {
        subtotal: 10,
        discountAmount: 5,
        nftDiscountApplied: true,
        processingFee: 0.59,
        totalPrice: 5.59,
        creditsUsed: 2,
        overageHours: 0,
      }

      act(() => {
        result.current.setPricing(pricing)
      })

      expect(result.current.subtotal).toBe(10)
      expect(result.current.discountAmount).toBe(5)
      expect(result.current.nftDiscountApplied).toBe(true)
      expect(result.current.processingFee).toBe(0.59)
      expect(result.current.totalPrice).toBe(5.59)
      expect(result.current.creditsUsed).toBe(2)
    })
  })

  describe('User Information', () => {
    it('should set user info', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setUserInfo({
          creditBalance: 5,
          isNftHolder: true,
          isMember: true,
        })
      })

      expect(result.current.creditBalance).toBe(5)
      expect(result.current.isNftHolder).toBe(true)
      expect(result.current.isMember).toBe(true)
    })
  })

  describe('Wizard Navigation', () => {
    it('should advance to next step when conditions are met', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setWorkspaceType('hot-desk')
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(2)
    })

    it('should not advance to next step when conditions are not met', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe(1)
    })

    it('should go back to previous step', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setCurrentStep(3)
        result.current.previousStep()
      })

      expect(result.current.currentStep).toBe(2)
    })

    it('should not go below step 1', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setCurrentStep(1)
        result.current.previousStep()
      })

      expect(result.current.currentStep).toBe(1)
    })
  })

  describe('Validation', () => {
    it('should validate step 1 - workspace type selected', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setCurrentStep(1)
      })

      expect(result.current.canProceedToNextStep()).toBe(false)

      act(() => {
        result.current.setWorkspaceType('hot-desk')
      })

      expect(result.current.canProceedToNextStep()).toBe(true)
    })

    it('should validate step 2 - date and time selected', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setCurrentStep(2)
      })

      expect(result.current.canProceedToNextStep()).toBe(false)

      act(() => {
        result.current.setBookingDate(new Date('2025-10-01'))
        result.current.setStartTime('09:00')
        result.current.setEndTime('11:00')
      })

      expect(result.current.canProceedToNextStep()).toBe(true)
    })
  })

  describe('Reset', () => {
    it('should reset all booking data', () => {
      const { result } = renderHook(() => useBookingStore())

      act(() => {
        result.current.setWorkspaceType('hot-desk')
        result.current.setBookingDate(new Date())
        result.current.setStartTime('09:00')
        result.current.setCurrentStep(3)
        result.current.resetBooking()
      })

      expect(result.current.selectedWorkspaceType).toBeNull()
      expect(result.current.bookingDate).toBeNull()
      expect(result.current.startTime).toBeNull()
      expect(result.current.currentStep).toBe(1)
    })
  })
})