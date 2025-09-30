/**
 * Email Templates Export
 * Central export point for all email templates
 */

// Base template utilities
export { generateEmailHTML, generateEmailText } from './base'
export type { EmailTemplateProps } from './base'

// Booking confirmation
export {
  generateBookingConfirmationHTML,
  generateBookingConfirmationText,
} from './booking-confirmation'
export type { BookingConfirmationData } from './booking-confirmation'

// Payment receipt
export {
  generatePaymentReceiptHTML,
  generatePaymentReceiptText,
} from './payment-receipt'
export type { PaymentReceiptData } from './payment-receipt'

// Credit allocation
export {
  generateCreditAllocationHTML,
  generateCreditAllocationText,
} from './credit-allocation'
export type { CreditAllocationData } from './credit-allocation'

// Order ready
export { generateOrderReadyHTML, generateOrderReadyText } from './order-ready'
export type { OrderReadyData } from './order-ready'