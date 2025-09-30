/**
 * Booking Store
 * Zustand store for managing booking wizard state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Workspace {
  id: string
  name: string
  type: string
  resource_category: 'desk' | 'meeting-room'
  capacity: number
  base_price_hourly: number
  amenities: string[]
  images: string[]
  min_duration: number
  max_duration: number
  description?: string
}

export interface BookingState {
  // Step 1: Workspace selection
  selectedWorkspaceType: 'hot-desk' | 'meeting-room' | null
  selectedWorkspace: Workspace | null

  // Step 2: Date and time
  bookingDate: Date | null
  startTime: string | null
  endTime: string | null
  duration: number

  // Step 3: Additional details
  attendees: number
  specialRequests: string

  // Pricing
  subtotal: number
  discountAmount: number
  nftDiscountApplied: boolean
  processingFee: number
  totalPrice: number
  creditsUsed: number
  overageHours: number

  // User info
  creditBalance: number
  isNftHolder: boolean
  isMember: boolean

  // Wizard state
  currentStep: number

  // Actions
  setWorkspaceType: (type: 'hot-desk' | 'meeting-room') => void
  setSelectedWorkspace: (workspace: Workspace | null) => void
  setBookingDate: (date: Date | null) => void
  setStartTime: (time: string | null) => void
  setEndTime: (time: string | null) => void
  setDuration: (duration: number) => void
  setAttendees: (attendees: number) => void
  setSpecialRequests: (requests: string) => void
  setPricing: (pricing: {
    subtotal: number
    discountAmount: number
    nftDiscountApplied: boolean
    processingFee: number
    totalPrice: number
    creditsUsed?: number
    overageHours?: number
  }) => void
  setUserInfo: (info: {
    creditBalance?: number
    isNftHolder?: boolean
    isMember?: boolean
  }) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  resetBooking: () => void
  canProceedToNextStep: () => boolean
}

const initialState = {
  selectedWorkspaceType: null,
  selectedWorkspace: null,
  bookingDate: null,
  startTime: null,
  endTime: null,
  duration: 2,
  attendees: 1,
  specialRequests: '',
  subtotal: 0,
  discountAmount: 0,
  nftDiscountApplied: false,
  processingFee: 0,
  totalPrice: 0,
  creditsUsed: 0,
  overageHours: 0,
  creditBalance: 0,
  isNftHolder: false,
  isMember: false,
  currentStep: 1,
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setWorkspaceType: (type) => set({ selectedWorkspaceType: type }),

      setSelectedWorkspace: (workspace) => set({ selectedWorkspace: workspace }),

      setBookingDate: (date) => set({ bookingDate: date }),

      setStartTime: (time) => set({ startTime: time }),

      setEndTime: (time) => {
        set({ endTime: time })
        // Auto-calculate duration when both times are set
        const state = get()
        if (state.startTime && time) {
          const [startHour, startMin] = state.startTime.split(':').map(Number)
          const [endHour, endMin] = time.split(':').map(Number)
          const durationMinutes = endHour * 60 + endMin - (startHour * 60 + startMin)
          const durationHours = durationMinutes / 60
          set({ duration: durationHours })
        }
      },

      setDuration: (duration) => set({ duration }),

      setAttendees: (attendees) => set({ attendees }),

      setSpecialRequests: (requests) => set({ specialRequests: requests }),

      setPricing: (pricing) => set(pricing),

      setUserInfo: (info) => set(info),

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const state = get()
        if (state.canProceedToNextStep()) {
          set({ currentStep: state.currentStep + 1 })
        }
      },

      previousStep: () => {
        const state = get()
        if (state.currentStep > 1) {
          set({ currentStep: state.currentStep - 1 })
        }
      },

      resetBooking: () => set({ ...initialState }),

      canProceedToNextStep: () => {
        const state = get()

        switch (state.currentStep) {
          case 1: // Workspace selection
            return state.selectedWorkspaceType !== null
          case 2: // Date and time
            return (
              state.bookingDate !== null &&
              state.startTime !== null &&
              state.endTime !== null &&
              state.duration > 0
            )
          case 3: // Workspace card selection (if meeting room)
            if (state.selectedWorkspaceType === 'meeting-room') {
              return state.selectedWorkspace !== null
            }
            return true
          case 4: // Review and payment
            return true
          default:
            return false
        }
      },
    }),
    {
      name: 'citizenspace-booking',
      partialize: (state) => ({
        // Only persist essential booking data, not UI state
        selectedWorkspaceType: state.selectedWorkspaceType,
        selectedWorkspace: state.selectedWorkspace,
        bookingDate: state.bookingDate,
        startTime: state.startTime,
        endTime: state.endTime,
        duration: state.duration,
        attendees: state.attendees,
        specialRequests: state.specialRequests,
      }),
    }
  )
)