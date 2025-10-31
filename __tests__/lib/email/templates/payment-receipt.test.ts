/**
 * Payment Receipt Email Template Tests
 */

import {
  generatePaymentReceiptHTML,
  generatePaymentReceiptText,
} from '@/lib/email/templates/payment-receipt'
import type { PaymentReceiptData } from '@/lib/email/templates/payment-receipt'

describe('Payment Receipt Email Template', () => {
  const mockData: PaymentReceiptData = {
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    receiptNumber: 'RCP-2025-001',
    transactionId: 'txn_1234567890',
    paymentDate: '2025-09-29',
    paymentMethod: 'Visa ending in 4242',
    items: [
      {
        description: 'Hot Desk - 8 hours',
        quantity: 1,
        unitPrice: 120.0,
        total: 120.0,
      },
      {
        description: 'Coffee & Pastry',
        quantity: 2,
        unitPrice: 5.5,
        total: 11.0,
      },
    ],
    subtotal: 131.0,
    tax: 10.48,
    total: 141.48,
  }

  describe('generatePaymentReceiptHTML', () => {
    it('should generate valid HTML email', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Payment Receipt')
    })

    it('should include customer name', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('Jane Smith')
    })

    it('should include receipt summary', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('RCP-2025-001')
      expect(html).toContain('txn_1234567890')
      expect(html).toContain('2025-09-29')
      expect(html).toContain('Visa ending in 4242')
    })

    it('should include itemized charges table', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('Itemized Charges')
      expect(html).toContain('Hot Desk - 8 hours')
      expect(html).toContain('Coffee & Pastry')
      expect(html).toContain('$120.00')
      expect(html).toContain('$11.00')
    })

    it('should format currency values correctly', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('$5.50')
      expect(html).toContain('$131.00')
      expect(html).toContain('$10.48')
      expect(html).toContain('$141.48')
    })

    it('should include subtotal and total', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('Subtotal')
      expect(html).toContain('$131.00')
      expect(html).toContain('Total Paid')
      expect(html).toContain('$141.48')
    })

    it('should include tax when provided', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('Tax')
      expect(html).toContain('$10.48')
    })

    it('should not show tax row when not provided', () => {
      const dataWithoutTax = {
        ...mockData,
        tax: undefined,
      }

      const html = generatePaymentReceiptHTML(dataWithoutTax)

      expect(html.match(/Tax:/g)).toBeNull()
    })

    it('should include discount when provided', () => {
      const dataWithDiscount = {
        ...mockData,
        discount: 15.0,
        discountCode: 'SAVE15',
      }

      const html = generatePaymentReceiptHTML(dataWithDiscount)

      expect(html).toContain('Discount')
      expect(html).toContain('SAVE15')
      expect(html).toContain('-$15.00')
    })

    it('should show discount without code when code not provided', () => {
      const dataWithDiscount = {
        ...mockData,
        discount: 10.0,
      }

      const html = generatePaymentReceiptHTML(dataWithDiscount)

      expect(html).toContain('Discount')
      expect(html).toContain('-$10.00')
      expect(html).not.toContain('undefined')
    })

    it('should include billing address when provided', () => {
      const dataWithAddress = {
        ...mockData,
        billingAddress: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'Boston',
          state: 'MA',
          zip: '02101',
          country: 'USA',
        },
      }

      const html = generatePaymentReceiptHTML(dataWithAddress)

      expect(html).toContain('Billing Address')
      expect(html).toContain('123 Main St')
      expect(html).toContain('Apt 4B')
      expect(html).toContain('Boston, MA 02101')
      expect(html).toContain('USA')
    })

    it('should handle billing address without line2', () => {
      const dataWithAddress = {
        ...mockData,
        billingAddress: {
          line1: '456 Oak Ave',
          city: 'Seattle',
          state: 'WA',
          zip: '98101',
          country: 'USA',
        },
      }

      const html = generatePaymentReceiptHTML(dataWithAddress)

      expect(html).toContain('456 Oak Ave')
      expect(html).toContain('Seattle, WA 98101')
    })

    it('should not show billing address section when not provided', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).not.toContain('Billing Address')
    })

    it('should include payment confirmation message', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('Payment Status')
      expect(html).toContain('successfully processed')
    })

    it('should include CTA to download or view receipt', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('View Account')
      expect(html).toContain('/account/billing')
    })

    it('should use download receipt CTA when receiptUrl provided', () => {
      const dataWithReceiptUrl = {
        ...mockData,
        receiptUrl: 'https://example.com/receipts/RCP-2025-001.pdf',
      }

      const html = generatePaymentReceiptHTML(dataWithReceiptUrl)

      expect(html).toContain('Download Receipt')
      expect(html).toContain('https://example.com/receipts/RCP-2025-001.pdf')
    })

    it('should include billing support contact', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('billing@citizenspace.com')
      expect(html).toContain('(555) 123-4567')
    })

    it('should display items with alternating row colors', () => {
      const html = generatePaymentReceiptHTML(mockData)

      expect(html).toContain('#ffffff')
      expect(html).toContain('#f9f9f9')
    })
  })

  describe('generatePaymentReceiptText', () => {
    it('should generate plain text email', () => {
      const text = generatePaymentReceiptText(mockData)

      expect(text).toContain('Payment Receipt')
      expect(text).toContain('Jane Smith')
    })

    it('should include receipt summary', () => {
      const text = generatePaymentReceiptText(mockData)

      expect(text).toContain('RECEIPT SUMMARY')
      expect(text).toContain('RCP-2025-001')
      expect(text).toContain('txn_1234567890')
      expect(text).toContain('2025-09-29')
      expect(text).toContain('Visa ending in 4242')
    })

    it('should include itemized charges', () => {
      const text = generatePaymentReceiptText(mockData)

      expect(text).toContain('ITEMIZED CHARGES')
      expect(text).toContain('Hot Desk - 8 hours')
      expect(text).toContain('Qty: 1 x $120.00 = $120.00')
      expect(text).toContain('Coffee & Pastry')
      expect(text).toContain('Qty: 2 x $5.50 = $11.00')
    })

    it('should include totals', () => {
      const text = generatePaymentReceiptText(mockData)

      expect(text).toContain('Subtotal: $131.00')
      expect(text).toContain('Tax: $10.48')
      expect(text).toContain('TOTAL PAID: $141.48')
    })

    it('should include discount when provided', () => {
      const dataWithDiscount = {
        ...mockData,
        discount: 15.0,
        discountCode: 'SAVE15',
      }

      const text = generatePaymentReceiptText(dataWithDiscount)

      expect(text).toContain('Discount (SAVE15): -$15.00')
    })

    it('should include billing address when provided', () => {
      const dataWithAddress = {
        ...mockData,
        billingAddress: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'Boston',
          state: 'MA',
          zip: '02101',
          country: 'USA',
        },
      }

      const text = generatePaymentReceiptText(dataWithAddress)

      expect(text).toContain('BILLING ADDRESS')
      expect(text).toContain('123 Main St')
      expect(text).toContain('Apt 4B')
      expect(text).toContain('Boston, MA 02101')
      expect(text).toContain('USA')
    })

    it('should include payment confirmation', () => {
      const text = generatePaymentReceiptText(mockData)

      expect(text).toContain('successfully processed')
    })

    it('should include receipt URL or account link', () => {
      const text = generatePaymentReceiptText(mockData)

      expect(text).toContain('View Account')
      expect(text).toContain('/account/billing')
    })

    it('should include billing support contact', () => {
      const text = generatePaymentReceiptText(mockData)

      expect(text).toContain('billing@citizenspace.com')
    })
  })
})