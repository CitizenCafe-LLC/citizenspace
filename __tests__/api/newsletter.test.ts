/**
 * Newsletter API Endpoint Tests
 * Tests for POST /api/newsletter/subscribe
 */

import { POST, GET } from '@/app/api/newsletter/subscribe/route'
import { NextRequest } from 'next/server'
import * as newsletterRepo from '@/lib/db/repositories/newsletter.repository'
import * as emailService from '@/lib/email/service'
import { clearAllRateLimits } from '@/lib/middleware/rate-limit'

// Mock dependencies
jest.mock('@/lib/db/repositories/newsletter.repository')
jest.mock('@/lib/email/service')

const mockCreateNewsletterSubscriber = newsletterRepo.createNewsletterSubscriber as jest.MockedFunction<
  typeof newsletterRepo.createNewsletterSubscriber
>
const mockSendEmail = emailService.sendEmail as jest.MockedFunction<typeof emailService.sendEmail>

describe('POST /api/newsletter/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearAllRateLimits()
  })

  const createMockRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
      },
      body: JSON.stringify(body),
    })
  }

  describe('Success Cases', () => {
    it('should subscribe new email successfully', async () => {
      const requestBody = {
        email: 'newuser@example.com',
        preferences: {
          topics: ['events', 'news'],
          frequency: 'weekly',
        },
      }

      const mockSubscriber = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: requestBody.email,
        status: 'active',
        preferences: requestBody.preferences,
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: mockSubscriber,
        error: null,
        already_subscribed: false,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest(requestBody)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.email).toBe(requestBody.email)
      expect(data.data.message).toContain('Thank you for subscribing')
      expect(mockCreateNewsletterSubscriber).toHaveBeenCalledWith({
        email: requestBody.email,
        preferences: requestBody.preferences,
      })
      expect(mockSendEmail).toHaveBeenCalled()
    })

    it('should subscribe with email only (no preferences)', async () => {
      const requestBody = {
        email: 'simple@example.com',
      }

      const mockSubscriber = {
        id: '123',
        email: requestBody.email,
        status: 'active',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: mockSubscriber,
        error: null,
        already_subscribed: false,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest(requestBody)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(mockCreateNewsletterSubscriber).toHaveBeenCalledWith({
        email: requestBody.email,
        preferences: undefined,
      })
    })

    it('should return success for already subscribed email', async () => {
      const requestBody = {
        email: 'existing@example.com',
      }

      const mockSubscriber = {
        id: '123',
        email: requestBody.email,
        status: 'active',
        preferences: {},
        subscribed_at: new Date(),
        unsubscribed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: mockSubscriber,
        error: null,
        already_subscribed: true,
      })

      const req = createMockRequest(requestBody)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.message).toContain('already subscribed')
      // Should NOT send welcome email for already subscribed
      expect(mockSendEmail).not.toHaveBeenCalled()
    })

    it('should succeed even if welcome email fails', async () => {
      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: {
          id: '123',
          email: 'test@example.com',
          status: 'active',
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
        already_subscribed: false,
      })

      // Email fails
      mockSendEmail.mockResolvedValue(false)

      const req = createMockRequest({
        email: 'test@example.com',
      })

      const response = await POST(req)
      const data = await response.json()

      // Should still succeed
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })
  })

  describe('Validation Errors', () => {
    it('should reject request with missing email', async () => {
      const req = createMockRequest({
        preferences: { topics: ['events'] },
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('email')
    })

    it('should reject request with invalid email format', async () => {
      const req = createMockRequest({
        email: 'not-an-email',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('email')
    })

    it('should reject email that is too long', async () => {
      const req = createMockRequest({
        email: 'a'.repeat(250) + '@example.com',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('255 characters')
    })

    it('should reject invalid JSON', async () => {
      const req = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('should accept valid preference options', async () => {
      const validPreferences = [
        { topics: ['events'], frequency: 'daily', format: 'html' },
        { topics: ['updates'], frequency: 'weekly', format: 'text' },
        { topics: ['news', 'events'], frequency: 'monthly', format: 'html' },
      ]

      for (const preferences of validPreferences) {
        mockCreateNewsletterSubscriber.mockResolvedValue({
          data: {
            id: '123',
            email: 'test@example.com',
            status: 'active',
            preferences,
            subscribed_at: new Date(),
            unsubscribed_at: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
          error: null,
          already_subscribed: false,
        })

        mockSendEmail.mockResolvedValue(true)

        const req = createMockRequest({
          email: 'test@example.com',
          preferences,
        })

        const response = await POST(req)
        expect(response.status).toBe(201)
      }
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limit after 10 requests', async () => {
      const requestBody = {
        email: 'test@example.com',
      }

      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: {
          id: '123',
          email: 'test@example.com',
          status: 'active',
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
        already_subscribed: false,
      })

      mockSendEmail.mockResolvedValue(true)

      // Make 10 successful requests
      for (let i = 0; i < 10; i++) {
        const req = createMockRequest({
          email: `test${i}@example.com`,
        })
        const response = await POST(req)
        expect(response.status).toBe(201)
      }

      // 11th request should be rate limited
      const req = createMockRequest(requestBody)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Too many')
      expect(response.headers.get('Retry-After')).toBeTruthy()
    })

    it('should include rate limit headers in response', async () => {
      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: {
          id: '123',
          email: 'test@example.com',
          status: 'active',
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
        already_subscribed: false,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest({
        email: 'test@example.com',
      })

      const response = await POST(req)

      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })
  })

  describe('Database Errors', () => {
    it('should handle database errors gracefully', async () => {
      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: null,
        error: 'Database connection failed',
        already_subscribed: false,
      })

      const req = createMockRequest({
        email: 'test@example.com',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Failed to subscribe')
    })
  })

  describe('Email Sanitization', () => {
    it('should trim whitespace from email', async () => {
      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: {
          id: '123',
          email: 'test@example.com',
          status: 'active' as const,
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
        already_subscribed: false,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest({
        email: '  test@example.com  ',
      })

      const response = await POST(req)
      expect(response.status).toBe(201)

      expect(mockCreateNewsletterSubscriber).toHaveBeenCalledWith({
        email: 'test@example.com',
        preferences: undefined,
      })
    })

    it('should lowercase email addresses', async () => {
      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: {
          id: '123',
          email: 'test@example.com',
          status: 'active',
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
        already_subscribed: false,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest({
        email: 'TEST@EXAMPLE.COM',
      })

      await POST(req)

      expect(mockCreateNewsletterSubscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        })
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in email', async () => {
      const specialEmail = 'user+newsletter@example.com'

      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: {
          id: '123',
          email: specialEmail,
          status: 'active',
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
        already_subscribed: false,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest({
        email: specialEmail,
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })

    it('should handle international domain names', async () => {
      // Using punycode/ASCII representation of international domain
      // Real international domains are converted to ASCII (punycode) in practice
      const internationalEmail = 'test@xn--mnchen-3ya.de'

      mockCreateNewsletterSubscriber.mockResolvedValue({
        data: {
          id: '123',
          email: internationalEmail,
          status: 'active' as const,
          preferences: {},
          subscribed_at: new Date(),
          unsubscribed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
        already_subscribed: false,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest({
        email: internationalEmail,
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })
  })
})

describe('GET /api/newsletter/subscribe', () => {
  it('should return method not allowed', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Method not allowed')
  })
})