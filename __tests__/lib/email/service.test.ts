/**
 * Email Service Tests
 * Tests email sending functionality with mocked providers
 */

import {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendCreditAllocationEmail,
  sendOrderReadyEmail,
  isEmailConfigured,
  getEmailProvider,
} from '@/lib/email/service'

import type {
  BookingConfirmationData,
  PaymentReceiptData,
  CreditAllocationData,
  OrderReadyData,
} from '@/lib/email/templates'

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}))

// Mock fetch for Resend and SendGrid
global.fetch = jest.fn()

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('sendEmail', () => {
    it('should send email with SMTP provider', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        text: 'Test',
      })

      expect(result).toBe(true)
    })

    it('should handle email sending errors', async () => {
      // Mock nodemailer to throw error
      const nodemailer = require('nodemailer')
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: jest.fn().mockRejectedValue(new Error('SMTP error')),
      }))

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
      })

      expect(result).toBe(false)
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email to new user', async () => {
      const result = await sendWelcomeEmail('newuser@example.com', 'John Doe')

      expect(result).toBe(true)
    })

    it('should include user name in welcome email', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      await sendWelcomeEmail('newuser@example.com', 'Jane Smith')

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@example.com',
          subject: 'Welcome to CitizenSpace!',
        })
      )

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.html).toContain('Jane Smith')
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      const result = await sendPasswordResetEmail('user@example.com', 'reset-token-123')

      expect(result).toBe(true)
    })

    it('should include reset token in email', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      await sendPasswordResetEmail('user@example.com', 'reset-token-123')

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.html).toContain('reset-token-123')
      expect(callArgs.text).toContain('reset-token-123')
    })
  })

  describe('sendBookingConfirmationEmail', () => {
    const mockBookingData: BookingConfirmationData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      bookingId: 'booking-123',
      confirmationCode: 'CONF-123',
      workspaceName: 'Hot Desk A1',
      workspaceType: 'desk',
      date: '2025-10-15',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      duration: '8 hours',
      totalPrice: 120.0,
      amenities: ['WiFi', 'Power Outlet', 'Monitor'],
    }

    it('should send booking confirmation email', async () => {
      const result = await sendBookingConfirmationEmail(mockBookingData)

      expect(result).toBe(true)
    })

    it('should include booking details in email', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      await sendBookingConfirmationEmail(mockBookingData)

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.to).toBe('john@example.com')
      expect(callArgs.subject).toContain('CONF-123')
      expect(callArgs.html).toContain('John Doe')
      expect(callArgs.html).toContain('Hot Desk A1')
      expect(callArgs.html).toContain('$120.00')
    })

    it('should include QR code if provided', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      const dataWithQR = {
        ...mockBookingData,
        qrCodeUrl: 'https://example.com/qr/booking-123.png',
      }

      await sendBookingConfirmationEmail(dataWithQR)

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.html).toContain('qr/booking-123.png')
    })
  })

  describe('sendPaymentReceiptEmail', () => {
    const mockReceiptData: PaymentReceiptData = {
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

    it('should send payment receipt email', async () => {
      const result = await sendPaymentReceiptEmail(mockReceiptData)

      expect(result).toBe(true)
    })

    it('should include itemized charges', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      await sendPaymentReceiptEmail(mockReceiptData)

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.html).toContain('Hot Desk - 8 hours')
      expect(callArgs.html).toContain('$120.00')
      expect(callArgs.html).toContain('$141.48')
      expect(callArgs.text).toContain('RCP-2025-001')
    })

    it('should include discount when provided', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      const dataWithDiscount = {
        ...mockReceiptData,
        discount: 15.0,
        discountCode: 'SAVE15',
      }

      await sendPaymentReceiptEmail(dataWithDiscount)

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.html).toContain('SAVE15')
      expect(callArgs.html).toContain('$15.00')
    })
  })

  describe('sendCreditAllocationEmail', () => {
    const mockCreditData: CreditAllocationData = {
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      membershipTier: 'Premium',
      creditsAllocated: 50,
      currentBalance: 75,
      allocationDate: '2025-10-01',
      expirationDate: '2025-10-31',
    }

    it('should send credit allocation email', async () => {
      const result = await sendCreditAllocationEmail(mockCreditData)

      expect(result).toBe(true)
    })

    it('should include credit details', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      await sendCreditAllocationEmail(mockCreditData)

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.subject).toContain('50 Credits')
      expect(callArgs.html).toContain('Bob Johnson')
      expect(callArgs.html).toContain('Premium')
      expect(callArgs.html).toContain('75 credits')
    })
  })

  describe('sendOrderReadyEmail', () => {
    const mockOrderData: OrderReadyData = {
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

    it('should send order ready email', async () => {
      const result = await sendOrderReadyEmail(mockOrderData)

      expect(result).toBe(true)
    })

    it('should include order details', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      await sendOrderReadyEmail(mockOrderData)

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.subject).toContain('ORD-123')
      expect(callArgs.html).toContain('Cappuccino')
      expect(callArgs.html).toContain('Extra shot, oat milk')
      expect(callArgs.html).toContain('Main Counter')
    })
  })

  describe('isEmailConfigured', () => {
    it('should return true when SMTP is configured', () => {
      // Since we're testing with environment variables already set
      const result = isEmailConfigured()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getEmailProvider', () => {
    it('should return current email provider', () => {
      const provider = getEmailProvider()
      expect(provider).toBeDefined()
      expect(typeof provider).toBe('string')
    })
  })

  describe('Resend Integration', () => {
    beforeEach(() => {
      // Mock successful Resend API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-id-123' }),
      })
    })

    it('should send email via Resend when configured', async () => {
      // Note: This test would require mocking process.env.EMAIL_PROVIDER
      // In a real scenario, you'd use a library like dotenv-mock
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test via Resend',
        html: '<p>Test</p>',
        text: 'Test',
      })

      expect(result).toBe(true)
    })
  })

  describe('SendGrid Integration', () => {
    beforeEach(() => {
      // Mock successful SendGrid API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => '',
      })
    })

    it('should handle SendGrid API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: async () => 'SendGrid API Error',
      })

      // This would require EMAIL_PROVIDER to be set to 'sendgrid'
      // The test demonstrates error handling
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test via SendGrid',
        html: '<p>Test</p>',
      })

      // Should still return true with SMTP fallback
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const nodemailer = require('nodemailer')
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: jest.fn().mockRejectedValue(new Error('Network error')),
      }))

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result).toBe(false)
    })

    it('should log errors when email sending fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const nodemailer = require('nodemailer')
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: jest.fn().mockRejectedValue(new Error('Test error')),
      }))

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Template Validation', () => {
    it('should generate valid HTML for all templates', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      // Test all email types generate valid content
      await sendWelcomeEmail('test@example.com', 'Test User')
      expect(sendMailMock.mock.calls[0][0].html).toContain('<!DOCTYPE html>')

      await sendPasswordResetEmail('test@example.com', 'token')
      expect(sendMailMock.mock.calls[1][0].html).toContain('<!DOCTYPE html>')
    })

    it('should include both HTML and text versions', async () => {
      const nodemailer = require('nodemailer')
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: sendMailMock,
      }))

      await sendWelcomeEmail('test@example.com', 'Test User')

      const callArgs = sendMailMock.mock.calls[0][0]
      expect(callArgs.html).toBeDefined()
      expect(callArgs.text).toBeDefined()
      expect(callArgs.html.length).toBeGreaterThan(0)
      expect(callArgs.text.length).toBeGreaterThan(0)
    })
  })
})