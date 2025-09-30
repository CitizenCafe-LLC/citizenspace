/**
 * NFT Holder Discount Calculator
 *
 * Utility functions to calculate discounts for NFT holders on:
 * - Workspace bookings (50% discount)
 * - Cafe orders (10% discount)
 */

import { NFT_HOLDER_DISCOUNTS } from '@/lib/web3/contract'

export interface PricingCalculation {
  originalPrice: number
  discount: number
  discountAmount: number
  finalPrice: number
  isNftHolder: boolean
}

/**
 * Calculates workspace booking price with NFT holder discount
 *
 * @param basePrice - Base price of the workspace booking
 * @param isNftHolder - Whether the user is an NFT holder
 * @returns Pricing calculation breakdown
 */
export function calculateWorkspacePrice(
  basePrice: number,
  isNftHolder: boolean
): PricingCalculation {
  if (!isNftHolder) {
    return {
      originalPrice: basePrice,
      discount: 0,
      discountAmount: 0,
      finalPrice: basePrice,
      isNftHolder: false,
    }
  }

  const discount = NFT_HOLDER_DISCOUNTS.WORKSPACE // 50%
  const discountAmount = basePrice * discount
  const finalPrice = basePrice - discountAmount

  return {
    originalPrice: basePrice,
    discount,
    discountAmount,
    finalPrice,
    isNftHolder: true,
  }
}

/**
 * Calculates cafe order price with NFT holder discount
 *
 * @param basePrice - Base price of the cafe order
 * @param isNftHolder - Whether the user is an NFT holder
 * @returns Pricing calculation breakdown
 */
export function calculateCafePrice(basePrice: number, isNftHolder: boolean): PricingCalculation {
  if (!isNftHolder) {
    return {
      originalPrice: basePrice,
      discount: 0,
      discountAmount: 0,
      finalPrice: basePrice,
      isNftHolder: false,
    }
  }

  const discount = NFT_HOLDER_DISCOUNTS.CAFE // 10%
  const discountAmount = basePrice * discount
  const finalPrice = basePrice - discountAmount

  return {
    originalPrice: basePrice,
    discount,
    discountAmount,
    finalPrice,
    isNftHolder: true,
  }
}

/**
 * Formats a pricing calculation for display
 *
 * @param calculation - Pricing calculation to format
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted pricing string
 */
export function formatPricingDisplay(
  calculation: PricingCalculation,
  currency: string = '$'
): string {
  if (!calculation.isNftHolder) {
    return `${currency}${calculation.finalPrice.toFixed(2)}`
  }

  return `${currency}${calculation.finalPrice.toFixed(2)} (${(calculation.discount * 100).toFixed(0)}% NFT holder discount)`
}

/**
 * Gets the discount percentage for a specific category
 *
 * @param category - 'workspace' or 'cafe'
 * @returns Discount percentage (0-1)
 */
export function getDiscountRate(category: 'workspace' | 'cafe'): number {
  return category === 'workspace' ? NFT_HOLDER_DISCOUNTS.WORKSPACE : NFT_HOLDER_DISCOUNTS.CAFE
}

/**
 * Applies NFT holder discount to a price
 *
 * @param price - Original price
 * @param category - 'workspace' or 'cafe'
 * @param isNftHolder - Whether the user is an NFT holder
 * @returns Final price after discount
 */
export function applyNftDiscount(
  price: number,
  category: 'workspace' | 'cafe',
  isNftHolder: boolean
): number {
  if (!isNftHolder) {
    return price
  }

  const discountRate = getDiscountRate(category)
  return price * (1 - discountRate)
}

/**
 * Calculates bulk pricing for multiple items with NFT discount
 *
 * @param items - Array of items with prices
 * @param category - 'workspace' or 'cafe'
 * @param isNftHolder - Whether the user is an NFT holder
 * @returns Total pricing calculation
 */
export function calculateBulkPrice(
  items: Array<{ price: number; quantity?: number }>,
  category: 'workspace' | 'cafe',
  isNftHolder: boolean
): PricingCalculation {
  const originalPrice = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)

  const calculator = category === 'workspace' ? calculateWorkspacePrice : calculateCafePrice
  return calculator(originalPrice, isNftHolder)
}

/**
 * Validates that a price matches the expected NFT discount calculation
 * Useful for verifying prices sent from the client
 *
 * @param receivedPrice - Price received from client
 * @param basePrice - Expected base price
 * @param category - 'workspace' or 'cafe'
 * @param isNftHolder - Whether the user is an NFT holder
 * @param tolerance - Acceptable price difference (default: 0.01)
 * @returns Whether the price is valid
 */
export function validateDiscountedPrice(
  receivedPrice: number,
  basePrice: number,
  category: 'workspace' | 'cafe',
  isNftHolder: boolean,
  tolerance: number = 0.01
): boolean {
  const expectedPrice = applyNftDiscount(basePrice, category, isNftHolder)
  const difference = Math.abs(receivedPrice - expectedPrice)
  return difference <= tolerance
}

/**
 * Creates a pricing breakdown object for API responses
 *
 * @param basePrice - Base price
 * @param category - 'workspace' or 'cafe'
 * @param isNftHolder - Whether the user is an NFT holder
 * @returns Detailed pricing breakdown
 */
export function createPricingBreakdown(
  basePrice: number,
  category: 'workspace' | 'cafe',
  isNftHolder: boolean
) {
  const calculator = category === 'workspace' ? calculateWorkspacePrice : calculateCafePrice
  const calculation = calculator(basePrice, isNftHolder)

  return {
    base_price: calculation.originalPrice,
    discount_rate: calculation.discount,
    discount_amount: calculation.discountAmount,
    final_price: calculation.finalPrice,
    nft_holder: calculation.isNftHolder,
    category,
    savings: calculation.discountAmount,
  }
}
