import type { Workspace } from '../db/types'
import { User, MembershipPlan } from '../db/types'

/**
 * Pricing calculation service for bookings
 * Implements all pricing logic from PRD.md including NFT discounts
 */

export const PROCESSING_FEE = 2.0
export const HOT_DESK_BASE_RATE = 2.5
export const NFT_DISCOUNT_RATE = 0.5 // 50% off

export interface PricingBreakdown {
  basePrice: number
  subtotal: number
  discountAmount: number
  nftDiscountApplied: boolean
  creditsUsed: number
  creditsOverageHours: number
  overageCharge: number
  processingFee: number
  totalPrice: number
  paymentMethod: 'card' | 'credits' | 'membership'
}

/**
 * Calculate pricing for hourly hot desk booking
 */
export function calculateHourlyDeskPricing(
  durationHours: number,
  user: {
    nft_holder: boolean
    membership_plan_id: string | null
    membership_plan?: {
      includes_hot_desk: boolean
      membership_status?: string
    } | null
  }
): PricingBreakdown {
  // Check if user has membership with hot desk included
  const hasMembershipHotDesk =
    user.membership_plan_id &&
    user.membership_plan?.includes_hot_desk &&
    user.membership_plan?.membership_status === 'active'

  // If user has active membership with hot desk, it's free
  if (hasMembershipHotDesk) {
    return {
      basePrice: HOT_DESK_BASE_RATE,
      subtotal: 0,
      discountAmount: 0,
      nftDiscountApplied: false,
      creditsUsed: 0,
      creditsOverageHours: 0,
      overageCharge: 0,
      processingFee: 0,
      totalPrice: 0,
      paymentMethod: 'membership',
    }
  }

  // Calculate base price
  const basePrice = HOT_DESK_BASE_RATE
  let subtotal = basePrice * durationHours
  let discountAmount = 0
  let nftDiscountApplied = false

  // Apply NFT holder discount (50% off)
  if (user.nft_holder) {
    discountAmount = subtotal * NFT_DISCOUNT_RATE
    subtotal = subtotal - discountAmount
    nftDiscountApplied = true
  }

  const totalPrice = subtotal + PROCESSING_FEE

  return {
    basePrice,
    subtotal,
    discountAmount,
    nftDiscountApplied,
    creditsUsed: 0,
    creditsOverageHours: 0,
    overageCharge: 0,
    processingFee: PROCESSING_FEE,
    totalPrice,
    paymentMethod: 'card',
  }
}

/**
 * Calculate pricing for meeting room booking with credits
 */
export function calculateMeetingRoomPricing(
  workspace: Workspace,
  durationHours: number,
  availableCredits: number,
  isNftHolder: boolean
): PricingBreakdown {
  const basePrice = workspace.base_price_hourly

  // Calculate how many credits can be used
  const creditsUsed = Math.min(durationHours, availableCredits)
  const creditsOverageHours = Math.max(0, durationHours - creditsUsed)

  // Calculate overage charge
  let overageCharge = creditsOverageHours * basePrice

  // Apply NFT discount to overage
  let discountAmount = 0
  let nftDiscountApplied = false
  if (isNftHolder && creditsOverageHours > 0) {
    discountAmount = overageCharge * NFT_DISCOUNT_RATE
    overageCharge = overageCharge - discountAmount
    nftDiscountApplied = true
  }

  // Processing fee only if there's an overage charge
  const processingFee = creditsOverageHours > 0 ? PROCESSING_FEE : 0
  const totalPrice = overageCharge + processingFee

  // Determine payment method
  let paymentMethod: 'card' | 'credits' | 'membership'
  if (creditsUsed === durationHours) {
    paymentMethod = 'credits'
  } else if (creditsUsed > 0 && creditsOverageHours > 0) {
    paymentMethod = 'card' // Mixed: credits + card
  } else {
    paymentMethod = 'card'
  }

  return {
    basePrice,
    subtotal: overageCharge,
    discountAmount,
    nftDiscountApplied,
    creditsUsed,
    creditsOverageHours,
    overageCharge,
    processingFee,
    totalPrice,
    paymentMethod,
  }
}

/**
 * Calculate final charge after actual usage (for hourly bookings)
 */
export function calculateFinalCharge(
  bookedHours: number,
  actualHours: number,
  subtotalPaid: number,
  processingFeePaid: number,
  isNftHolder: boolean
): {
  finalCharge: number
  refundAmount: number
  overageCharge: number
  description: string
} {
  // Calculate what should have been charged
  const baseRate = isNftHolder ? HOT_DESK_BASE_RATE * (1 - NFT_DISCOUNT_RATE) : HOT_DESK_BASE_RATE
  const shouldHaveBeenCharged = actualHours * baseRate

  const totalPaid = subtotalPaid + processingFeePaid

  // Scenario 1: Used less time than booked (refund)
  if (actualHours < bookedHours) {
    const finalCharge = shouldHaveBeenCharged + PROCESSING_FEE
    const refundAmount = totalPaid - finalCharge

    return {
      finalCharge,
      refundAmount: Math.max(0, refundAmount),
      overageCharge: 0,
      description: `Used ${actualHours} hours of ${bookedHours} hours booked. Refund issued.`,
    }
  }

  // Scenario 2: Used more time than booked (overage)
  if (actualHours > bookedHours) {
    const overageHours = actualHours - bookedHours
    const overageCharge = overageHours * baseRate
    const finalCharge = totalPaid + overageCharge

    return {
      finalCharge,
      refundAmount: 0,
      overageCharge,
      description: `Used ${actualHours} hours (${overageHours} hours overage). Additional charge applied.`,
    }
  }

  // Scenario 3: Used exactly as booked (no change)
  return {
    finalCharge: totalPaid,
    refundAmount: 0,
    overageCharge: 0,
    description: `Used exactly ${actualHours} hours as booked.`,
  }
}

/**
 * Calculate duration in hours between two times
 */
export function calculateDurationHours(startTime: string, endTime: string): number {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  // Handle crossing midnight (though unlikely for bookings)
  let durationMinutes = endMinutes - startMinutes
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60
  }

  return durationMinutes / 60
}

/**
 * Calculate actual duration from check-in and check-out times
 */
export function calculateActualDuration(checkInTime: string, checkOutTime: string): number {
  const checkIn = new Date(checkInTime)
  const checkOut = new Date(checkOutTime)

  const durationMs = checkOut.getTime() - checkIn.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)

  // Round to 2 decimal places
  return Math.round(durationHours * 100) / 100
}

/**
 * Validate booking duration against workspace constraints
 */
export function validateBookingDuration(
  workspace: Workspace,
  durationHours: number
): { valid: boolean; error?: string } {
  if (durationHours < workspace.min_duration) {
    return {
      valid: false,
      error: `Minimum booking duration is ${workspace.min_duration} hours`,
    }
  }

  if (durationHours > workspace.max_duration) {
    return {
      valid: false,
      error: `Maximum booking duration is ${workspace.max_duration} hours`,
    }
  }

  return { valid: true }
}

/**
 * Calculate pricing for day pass
 */
export function calculateDayPassPricing(isNftHolder: boolean): PricingBreakdown {
  const basePrice = 25.0
  let subtotal = basePrice
  let discountAmount = 0

  // Apply NFT discount (50% off)
  if (isNftHolder) {
    discountAmount = subtotal * NFT_DISCOUNT_RATE
    subtotal = subtotal - discountAmount
  }

  return {
    basePrice,
    subtotal,
    discountAmount,
    nftDiscountApplied: isNftHolder,
    creditsUsed: 0,
    creditsOverageHours: 0,
    overageCharge: 0,
    processingFee: PROCESSING_FEE,
    totalPrice: subtotal + PROCESSING_FEE,
    paymentMethod: 'card',
  }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`
}

/**
 * Calculate cost breakdown summary for display
 */
export function getPricingSummary(pricing: PricingBreakdown): string[] {
  const summary: string[] = []

  if (pricing.creditsUsed > 0) {
    summary.push(`Credits used: ${pricing.creditsUsed} hours`)
  }

  if (pricing.creditsOverageHours > 0) {
    summary.push(
      `Overage: ${pricing.creditsOverageHours} hours @ ${formatPrice(pricing.basePrice)}/hr = ${formatPrice(pricing.overageCharge)}`
    )
  }

  if (pricing.subtotal > 0 && pricing.creditsOverageHours === 0) {
    summary.push(`Subtotal: ${formatPrice(pricing.subtotal)}`)
  }

  if (pricing.nftDiscountApplied) {
    summary.push(`NFT Holder Discount (50%): -${formatPrice(pricing.discountAmount)}`)
  }

  if (pricing.processingFee > 0) {
    summary.push(`Processing Fee: ${formatPrice(pricing.processingFee)}`)
  }

  summary.push(`Total: ${formatPrice(pricing.totalPrice)}`)

  return summary
}
