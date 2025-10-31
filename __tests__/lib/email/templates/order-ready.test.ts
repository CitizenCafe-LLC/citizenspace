/**
 * Order Ready Email Template Tests
 */

import {
  generateOrderReadyHTML,
  generateOrderReadyText,
} from '@/lib/email/templates/order-ready'
import type { OrderReadyData } from '@/lib/email/templates/order-ready'

describe('Order Ready Email Template', () => {
  const mockData: OrderReadyData = {
    customerName: 'Alice Williams',
    customerEmail: 'alice@example.com',
    orderNumber: 'ORD-123',
    orderDate: '2025-09-29',
    items: [
      {
        name: 'Cappuccino',
        quantity: 2,
        customizations: 'Extra shot, oat milk',
      },
      {
        name: 'Croissant',
        quantity: 1,
      },
    ],
    pickupLocation: 'Main Counter',
    pickupInstructions: 'Show this email to the barista',
    estimatedWaitTime: '2 minutes',
  }

  describe('generateOrderReadyHTML', () => {
    it('should generate valid HTML email', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Your Order is Ready')
    })

    it('should include customer name', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Alice Williams')
    })

    it('should display order number prominently', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Order #ORD-123')
      expect(html).toContain('Ready for Pickup')
    })

    it('should include pickup location', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Pickup Location')
      expect(html).toContain('Main Counter')
    })

    it('should include pickup instructions when provided', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Show this email to the barista')
    })

    it('should not show pickup instructions section when not provided', () => {
      const dataWithoutInstructions = {
        ...mockData,
        pickupInstructions: undefined,
      }

      const html = generateOrderReadyHTML(dataWithoutInstructions)

      expect(html).not.toContain('Show this email')
    })

    it('should include order items list', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Your Order')
      expect(html).toContain('Cappuccino')
      expect(html).toContain('x2')
      expect(html).toContain('Croissant')
      expect(html).toContain('x1')
    })

    it('should include item customizations when provided', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Extra shot, oat milk')
    })

    it('should not show customizations when not provided', () => {
      const html = generateOrderReadyHTML(mockData)

      // Croissant should not have customizations
      const croissantSection = html.substring(html.indexOf('Croissant'))
      expect(croissantSection).not.toContain('Extra shot')
    })

    it('should include estimated wait time when provided', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Estimated wait time')
      expect(html).toContain('2 minutes')
    })

    it('should not show wait time section when not provided', () => {
      const dataWithoutWaitTime = {
        ...mockData,
        estimatedWaitTime: undefined,
      }

      const html = generateOrderReadyHTML(dataWithoutWaitTime)

      expect(html).not.toContain('Estimated wait time')
    })

    it('should include pickup urgency message', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('pick up your order within 15 minutes')
      expect(html).toContain('optimal freshness')
    })

    it('should include CTA to view order details', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('View Order Details')
      expect(html).toContain('/orders/ORD-123')
    })

    it('should include footer message', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Enjoy your order')
      expect(html).toContain('Thank you for supporting our cafe')
    })

    it('should handle single item orders', () => {
      const singleItemData: OrderReadyData = {
        ...mockData,
        items: [{ name: 'Latte', quantity: 1 }],
      }

      const html = generateOrderReadyHTML(singleItemData)

      expect(html).toContain('Latte')
      expect(html).toContain('x1')
    })

    it('should handle large quantity orders', () => {
      const largeOrderData: OrderReadyData = {
        ...mockData,
        items: [{ name: 'Coffee', quantity: 10 }],
      }

      const html = generateOrderReadyHTML(largeOrderData)

      expect(html).toContain('x10')
    })

    it('should format items list correctly', () => {
      const html = generateOrderReadyHTML(mockData)

      expect(html).toContain('Your Order')
      // Should have proper styling divs
      expect(html).toMatch(/border-bottom.*1px solid/)
    })
  })

  describe('generateOrderReadyText', () => {
    it('should generate plain text email', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('Your Order is Ready')
      expect(text).toContain('Alice Williams')
    })

    it('should include order number', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('ORDER #ORD-123')
      expect(text).toContain('Status: Ready for Pickup')
    })

    it('should include pickup location', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('PICKUP LOCATION')
      expect(text).toContain('Main Counter')
    })

    it('should include pickup instructions when provided', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('Show this email to the barista')
    })

    it('should include order items', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('YOUR ORDER')
      expect(text).toContain('Cappuccino x2')
      expect(text).toContain('Extra shot, oat milk')
      expect(text).toContain('Croissant x1')
    })

    it('should format items with indented customizations', () => {
      const text = generateOrderReadyText(mockData)

      // Customizations should be indented
      expect(text).toContain('  Extra shot, oat milk')
    })

    it('should include estimated wait time when provided', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('Estimated wait time: 2 minutes')
    })

    it('should include pickup urgency message', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('pick up your order within 15 minutes')
      expect(text).toContain('optimal freshness')
    })

    it('should include order details URL', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('View Order Details')
      expect(text).toContain('/orders/ORD-123')
    })

    it('should include footer message', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('Enjoy your order')
      expect(text).toContain('Thank you for supporting our cafe')
    })

    it('should format sections with proper headers', () => {
      const text = generateOrderReadyText(mockData)

      expect(text).toContain('PICKUP LOCATION')
      expect(text).toContain('---------------')
      expect(text).toContain('YOUR ORDER')
      expect(text).toContain('----------')
    })
  })
})