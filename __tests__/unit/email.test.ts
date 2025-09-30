/**
 * Unit Tests for Email Service
 * Tests email sending functionality and template rendering
 */

import {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  isEmailConfigured,
} from '@/lib/email/service'

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}))

describe('Email Service', () => {
  describe('isEmailConfigured', () => {
    it('should return true if email credentials are configured', () => {
      const originalEmailUser = process.env.EMAIL_USER
      const originalEmailPassword = process.env.EMAIL_PASSWORD

      process.env.EMAIL_USER = 'test@example.com'
      process.env.EMAIL_PASSWORD = 'password'

      const result = isEmailConfigured()

      expect(result).toBe(true)

      process.env.EMAIL_USER = originalEmailUser
      process.env.EMAIL_PASSWORD = originalEmailPassword
    })

    it('should return false if email credentials are missing', () => {
      const originalEmailUser = process.env.EMAIL_USER
      const originalEmailPassword = process.env.EMAIL_PASSWORD

      delete process.env.EMAIL_USER
      delete process.env.EMAIL_PASSWORD

      const result = isEmailConfigured()

      expect(result).toBe(false)

      process.env.EMAIL_USER = originalEmailUser
      process.env.EMAIL_PASSWORD = originalEmailPassword
    })
  })

  describe('sendEmail', () => {
    it('should send email with correct parameters', async () => {
      const nodemailer = require('nodemailer')
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' })

      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
      })

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<p>Test content</p>',
          text: 'Test content',
        })
      )
    })

    it('should handle send failures gracefully', async () => {
      const nodemailer = require('nodemailer')
      const mockSendMail = jest.fn().mockRejectedValue(new Error('SMTP error'))

      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result).toBe(false)
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with reset link', async () => {
      const nodemailer = require('nodemailer')
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' })

      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      })

      const result = await sendPasswordResetEmail('test@example.com', 'test-reset-token')

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Reset Your Password'),
        })
      )

      const emailHtml = mockSendMail.mock.calls[0][0].html
      expect(emailHtml).toContain('test-reset-token')
      expect(emailHtml).toContain('reset-password')
    })

    it('should include expiration notice in email', async () => {
      const nodemailer = require('nodemailer')
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' })

      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      })

      await sendPasswordResetEmail('test@example.com', 'test-token')

      const emailHtml = mockSendMail.mock.calls[0][0].html
      expect(emailHtml).toContain('1 hour')
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with user name', async () => {
      const nodemailer = require('nodemailer')
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' })

      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      })

      const result = await sendWelcomeEmail('test@example.com', 'John Doe')

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Welcome'),
        })
      )

      const emailHtml = mockSendMail.mock.calls[0][0].html
      expect(emailHtml).toContain('John Doe')
    })

    it('should include getting started link', async () => {
      const nodemailer = require('nodemailer')
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' })

      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      })

      await sendWelcomeEmail('test@example.com', 'Test User')

      const emailHtml = mockSendMail.mock.calls[0][0].html
      expect(emailHtml).toContain('dashboard')
      expect(emailHtml).toContain('Get Started')
    })
  })
})
