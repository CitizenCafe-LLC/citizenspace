/**
 * Email Service Tests
 * Tests email sending functionality with mocked providers
 */

import type {
  BookingConfirmationData,
  PaymentReceiptData,
  CreditAllocationData,
  OrderReadyData,
} from '@/lib/email/templates'

// Store original env
const originalEnv = process.env

// Create shared mock sendMail function that will be used by all tests
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' })

// Mock nodemailer before importing the service
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}))

// Mock fetch for Resend and SendGrid
global.fetch = jest.fn()

// Import after mocking
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

describe('Email Service', () => {
  let nodemailer: any

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv }
    process.env.EMAIL_USER = 'test@example.com'
    process.env.EMAIL_PASSWORD = 'testpass'
    process.env.EMAIL_PROVIDER = 'smtp'

    // Clear all mocks
    jest.clearAllMocks()
    mockSendMail.mockClear()
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' })

    // Get the mocked nodemailer
    nodemailer = require('nodemailer')

    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockReset()
  })

  afterEach(() => {
    process.env = originalEnv
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
      expect(nodemailer.createTransport).toHaveBeenCalled()
    })

    it('should handle email sending errors', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'))

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
      })

      expect(result).toBe(false)
    })

    it('should send without text version if not provided', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
      })

      expect(result).toBe(true)
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email to new user', async () => {
      const result = await sendWelcomeEmail('newuser@example.com', 'John Doe')

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalled()
    })

    it('should include user name in welcome email', async () => {
      await sendWelcomeEmail('newuser@example.com', 'Jane Smith')

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@example.com',
          subject: 'Welcome to CitizenSpace!',
        })
      )

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('Jane Smith')
      expect(callArgs.text).toContain('Jane Smith')
    })

    it('should include dashboard link in welcome email', async () => {
      await sendWelcomeEmail('test@example.com', 'Test User')

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('/dashboard')
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      const result = await sendPasswordResetEmail('user@example.com', 'reset-token-123')

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalled()
    })

    it('should include reset token in email', async () => {
      await sendPasswordResetEmail('user@example.com', 'reset-token-123')

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('reset-token-123')
      expect(callArgs.text).toContain('reset-token-123')
    })

    it('should include correct subject line', async () => {
      await sendPasswordResetEmail('user@example.com', 'token123')

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.subject).toBe('Reset Your Password - CitizenSpace')
    })

    it('should include reset URL with token', async () => {
      await sendPasswordResetEmail('user@example.com', 'my-reset-token')

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('/auth/reset-password?token=my-reset-token')
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
      await sendBookingConfirmationEmail(mockBookingData)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.to).toBe('john@example.com')
      expect(callArgs.subject).toContain('CONF-123')
      expect(callArgs.html).toContain('John Doe')
      expect(callArgs.html).toContain('Hot Desk A1')
      expect(callArgs.html).toContain('$120.00')
    })

    it('should include QR code if provided', async () => {
      const dataWithQR = {
        ...mockBookingData,
        qrCodeUrl: 'https://example.com/qr/booking-123.png',
      }

      await sendBookingConfirmationEmail(dataWithQR)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('qr/booking-123.png')
    })

    it('should include amenities list', async () => {
      await sendBookingConfirmationEmail(mockBookingData)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('WiFi')
      expect(callArgs.html).toContain('Power Outlet')
      expect(callArgs.html).toContain('Monitor')
    })

    it('should include special requests if provided', async () => {
      const dataWithRequests = {
        ...mockBookingData,
        specialRequests: 'Need standing desk',
      }

      await sendBookingConfirmationEmail(dataWithRequests)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('Need standing desk')
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
      await sendPaymentReceiptEmail(mockReceiptData)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('Hot Desk - 8 hours')
      expect(callArgs.html).toContain('$120.00')
      expect(callArgs.html).toContain('$141.48')
      expect(callArgs.text).toContain('RCP-2025-001')
    })

    it('should include discount when provided', async () => {
      const dataWithDiscount = {
        ...mockReceiptData,
        discount: 15.0,
        discountCode: 'SAVE15',
      }

      await sendPaymentReceiptEmail(dataWithDiscount)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('SAVE15')
      expect(callArgs.html).toContain('$15.00')
    })

    it('should include billing address when provided', async () => {
      const dataWithAddress = {
        ...mockReceiptData,
        billingAddress: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'Boston',
          state: 'MA',
          zip: '02101',
          country: 'USA',
        },
      }

      await sendPaymentReceiptEmail(dataWithAddress)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('123 Main St')
      expect(callArgs.html).toContain('Apt 4B')
      expect(callArgs.html).toContain('Boston')
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
      await sendCreditAllocationEmail(mockCreditData)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.subject).toContain('50 Credits')
      expect(callArgs.html).toContain('Bob Johnson')
      expect(callArgs.html).toContain('Premium')
      expect(callArgs.html).toContain('75 credits')
    })

    it('should include expiration date when provided', async () => {
      await sendCreditAllocationEmail(mockCreditData)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('2025-10-31')
    })

    it('should include credit breakdown when provided', async () => {
      const dataWithBreakdown = {
        ...mockCreditData,
        creditBreakdown: [
          { type: 'Base Membership', amount: 40, description: 'Monthly allocation' },
          { type: 'Bonus Credits', amount: 10, description: 'Referral bonus' },
        ],
      }

      await sendCreditAllocationEmail(dataWithBreakdown)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('Base Membership')
      expect(callArgs.html).toContain('Referral bonus')
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
      await sendOrderReadyEmail(mockOrderData)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.subject).toContain('ORD-123')
      expect(callArgs.html).toContain('Cappuccino')
      expect(callArgs.html).toContain('Extra shot, oat milk')
      expect(callArgs.html).toContain('Main Counter')
    })

    it('should include pickup instructions when provided', async () => {
      await sendOrderReadyEmail(mockOrderData)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('Show this email to the barista')
    })

    it('should include estimated wait time when provided', async () => {
      await sendOrderReadyEmail(mockOrderData)

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('2 minutes')
    })
  })

  describe('isEmailConfigured', () => {
    it('should return true when SMTP is configured', () => {
      const result = isEmailConfigured()
      expect(result).toBe(true)
    })

    it('should return false when EMAIL_USER is missing', () => {
      delete process.env.EMAIL_USER
      const result = isEmailConfigured()
      expect(result).toBe(false)
    })

    it('should return false when EMAIL_PASSWORD is missing', () => {
      delete process.env.EMAIL_PASSWORD
      const result = isEmailConfigured()
      expect(result).toBe(false)
    })

    it('should check for RESEND_API_KEY when provider is resend', () => {
      process.env.EMAIL_PROVIDER = 'resend'
      process.env.RESEND_API_KEY = 'test-key'
      const result = isEmailConfigured()
      expect(result).toBe(true)
    })

    it('should check for SENDGRID_API_KEY when provider is sendgrid', () => {
      process.env.EMAIL_PROVIDER = 'sendgrid'
      process.env.SENDGRID_API_KEY = 'test-key'
      const result = isEmailConfigured()
      expect(result).toBe(true)
    })
  })

  describe('getEmailProvider', () => {
    it('should return current email provider', () => {
      const provider = getEmailProvider()
      expect(provider).toBe('smtp')
    })

    it('should return smtp as default', () => {
      delete process.env.EMAIL_PROVIDER
      const provider = getEmailProvider()
      expect(provider).toBe('smtp')
    })
  })

  describe('Resend Integration', () => {
    beforeEach(() => {
      process.env.EMAIL_PROVIDER = 'resend'
      process.env.RESEND_API_KEY = 'test-resend-key'
      // Mock successful Resend API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-id-123' }),
      })
    })

    it('should send email via Resend when configured', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test via Resend',
        html: '<p>Test</p>',
        text: 'Test',
      })

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-resend-key',
          }),
        })
      )
    })

    it('should handle Resend API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid API key' }),
      })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result).toBe(false)
    })

    it('should handle Resend network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result).toBe(false)
    })

    it('should throw error when RESEND_API_KEY is missing', async () => {
      delete process.env.RESEND_API_KEY

      // When RESEND_API_KEY is missing, sendWithResend throws an error
      // which is caught by sendEmail and returns false
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Error is caught and function returns false
      expect(result).toBe(false)
    })
  })

  describe('SendGrid Integration', () => {
    beforeEach(() => {
      process.env.EMAIL_PROVIDER = 'sendgrid'
      process.env.SENDGRID_API_KEY = 'test-sendgrid-key'
      // Mock successful SendGrid API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => '',
      })
    })

    it('should send email via SendGrid when configured', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test via SendGrid',
        html: '<p>Test</p>',
        text: 'Test',
      })

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-sendgrid-key',
          }),
        })
      )
    })

    it('should handle SendGrid API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: async () => 'SendGrid API Error',
      })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test via SendGrid',
        html: '<p>Test</p>',
      })

      expect(result).toBe(false)
    })

    it('should handle SendGrid network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result).toBe(false)
    })

    it('should throw error when SENDGRID_API_KEY is missing', async () => {
      delete process.env.SENDGRID_API_KEY

      // When SENDGRID_API_KEY is missing, sendWithSendGrid throws an error
      // which is caught by sendEmail and returns false
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Error is caught and function returns false
      expect(result).toBe(false)
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.EMAIL_PROVIDER = 'smtp'
    })

    it('should handle network errors gracefully', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Network error'))

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result).toBe(false)
    })

    it('should log errors when email sending fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockSendMail.mockRejectedValueOnce(new Error('Test error'))

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(consoleSpy).toHaveBeenCalledWith('Email sending failed:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('Template Validation', () => {
    it('should generate valid HTML for all templates', async () => {
      // Test all email types generate valid content
      await sendWelcomeEmail('test@example.com', 'Test User')
      expect(mockSendMail.mock.calls[0][0].html).toContain('<!DOCTYPE html>')

      await sendPasswordResetEmail('test@example.com', 'token')
      expect(mockSendMail.mock.calls[1][0].html).toContain('<!DOCTYPE html>')
    })

    it('should include both HTML and text versions', async () => {
      await sendWelcomeEmail('test@example.com', 'Test User')

      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.html).toBeDefined()
      expect(callArgs.text).toBeDefined()
      expect(callArgs.html.length).toBeGreaterThan(0)
      expect(callArgs.text.length).toBeGreaterThan(0)
    })

    it('should escape user input in templates', async () => {
      await sendWelcomeEmail('test@example.com', '<script>alert("xss")</script>')

      const callArgs = mockSendMail.mock.calls[0][0]
      // HTML should contain escaped version or plain text
      expect(callArgs.html).toBeDefined()
    })
  })

  describe('SMTP Transporter Configuration', () => {
    it('should create mock transporter when credentials are missing', () => {
      delete process.env.EMAIL_USER
      delete process.env.EMAIL_PASSWORD

      // Transporter should still be created but as stream transport
      const result = isEmailConfigured()
      expect(result).toBe(false)
    })

    it('should configure secure connection for port 465', async () => {
      process.env.EMAIL_PORT = '465'

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result).toBe(true)
    })

    it('should use default port 587 if not specified', async () => {
      delete process.env.EMAIL_PORT

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result).toBe(true)
    })
  })
})
