/**
 * Contact API Endpoint Tests
 * Tests for POST /api/contact
 */

import { POST, GET } from '@/app/api/contact/route'
import { NextRequest } from 'next/server'
import * as contactRepo from '@/lib/db/repositories/contact.repository'
import * as emailService from '@/lib/email/service'
import { clearAllRateLimits } from '@/lib/middleware/rate-limit'

// Mock dependencies
jest.mock('@/lib/db/repositories/contact.repository')
jest.mock('@/lib/email/service')

const mockCreateContactSubmission = contactRepo.createContactSubmission as jest.MockedFunction<
  typeof contactRepo.createContactSubmission
>
const mockSendEmail = emailService.sendEmail as jest.MockedFunction<typeof emailService.sendEmail>

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearAllRateLimits()
  })

  const createMockRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
      },
      body: JSON.stringify(body),
    })
  }

  describe('Success Cases', () => {
    it('should create contact submission successfully', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'general',
        message: 'This is a test message with at least 10 characters',
      }

      const mockSubmission = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...requestBody,
        status: 'new',
        admin_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockCreateContactSubmission.mockResolvedValue({
        data: mockSubmission,
        error: null,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest(requestBody)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe(mockSubmission.id)
      expect(data.message).toContain('successfully')
      expect(mockCreateContactSubmission).toHaveBeenCalledWith({
        name: requestBody.name,
        email: requestBody.email,
        topic: requestBody.topic,
        message: requestBody.message,
      })
      expect(mockSendEmail).toHaveBeenCalled()
    })

    it('should accept all valid topic types', async () => {
      const topics = ['general', 'booking', 'partnership', 'press']

      for (const topic of topics) {
        mockCreateContactSubmission.mockResolvedValue({
          data: {
            id: '123',
            name: 'Test',
            email: 'test@example.com',
            topic: topic as any,
            message: 'Test message',
            status: 'new',
            admin_notes: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
          error: null,
        })

        mockSendEmail.mockResolvedValue(true)

        const req = createMockRequest({
          name: 'Test User',
          email: 'test@example.com',
          topic,
          message: 'This is a test message',
        })

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.success).toBe(true)
      }
    })

    it('should succeed even if email sending fails', async () => {
      mockCreateContactSubmission.mockResolvedValue({
        data: {
          id: '123',
          name: 'Test',
          email: 'test@example.com',
          topic: 'general',
          message: 'Test',
          status: 'new',
          admin_notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
      })

      // Email fails
      mockSendEmail.mockResolvedValue(false)

      const req = createMockRequest({
        name: 'Test User',
        email: 'test@example.com',
        topic: 'general',
        message: 'This is a test message',
      })

      const response = await POST(req)
      const data = await response.json()

      // Should still succeed
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })
  })

  describe('Validation Errors', () => {
    it('should reject request with missing name', async () => {
      const req = createMockRequest({
        email: 'test@example.com',
        topic: 'general',
        message: 'This is a test message',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('name')
    })

    it('should reject request with invalid email', async () => {
      const req = createMockRequest({
        name: 'John Doe',
        email: 'invalid-email',
        topic: 'general',
        message: 'This is a test message',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('email')
    })

    it('should reject request with invalid topic', async () => {
      const req = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        topic: 'invalid-topic',
        message: 'This is a test message',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('topic')
    })

    it('should reject message that is too short', async () => {
      const req = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        topic: 'general',
        message: 'short',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('10 characters')
    })

    it('should reject message that is too long', async () => {
      const req = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        topic: 'general',
        message: 'x'.repeat(5001),
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('5000 characters')
    })

    it('should reject name that is too short', async () => {
      const req = createMockRequest({
        name: 'J',
        email: 'test@example.com',
        topic: 'general',
        message: 'This is a valid message',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('2 characters')
    })

    it('should reject invalid JSON', async () => {
      const req = new NextRequest('http://localhost:3000/api/contact', {
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
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limit after 5 requests', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'test@example.com',
        topic: 'general',
        message: 'This is a test message',
      }

      mockCreateContactSubmission.mockResolvedValue({
        data: {
          id: '123',
          name: 'Test',
          email: 'test@example.com',
          topic: 'general',
          message: 'Test',
          status: 'new',
          admin_notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
      })

      mockSendEmail.mockResolvedValue(true)

      // Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        const req = createMockRequest(requestBody)
        const response = await POST(req)
        expect(response.status).toBe(201)
      }

      // 6th request should be rate limited
      const req = createMockRequest(requestBody)
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Too many')
      expect(response.headers.get('Retry-After')).toBeTruthy()
    })

    it('should include rate limit headers in response', async () => {
      mockCreateContactSubmission.mockResolvedValue({
        data: {
          id: '123',
          name: 'Test',
          email: 'test@example.com',
          topic: 'general',
          message: 'Test',
          status: 'new',
          admin_notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest({
        name: 'Test User',
        email: 'test@example.com',
        topic: 'general',
        message: 'This is a test message',
      })

      const response = await POST(req)

      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })
  })

  describe('Database Errors', () => {
    it('should handle database errors gracefully', async () => {
      mockCreateContactSubmission.mockResolvedValue({
        data: null,
        error: 'Database connection failed',
      })

      const req = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        topic: 'general',
        message: 'This is a test message',
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Failed to submit')
    })
  })

  describe('Trimming and Sanitization', () => {
    it('should trim whitespace from inputs', async () => {
      mockCreateContactSubmission.mockResolvedValue({
        data: {
          id: '123',
          name: 'John Doe',
          email: 'test@example.com',
          topic: 'general',
          message: 'This is a test message with enough characters',
          status: 'new',
          admin_notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest({
        name: '  John Doe  ',
        email: '  test@example.com  ',
        topic: 'general',
        message: '  This is a test message with enough characters  ',
      })

      const response = await POST(req)
      expect(response.status).toBe(201)

      expect(mockCreateContactSubmission).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        topic: 'general',
        message: 'This is a test message with enough characters',
      })
    })

    it('should lowercase email addresses', async () => {
      mockCreateContactSubmission.mockResolvedValue({
        data: {
          id: '123',
          name: 'Test',
          email: 'test@example.com',
          topic: 'general',
          message: 'Test',
          status: 'new',
          admin_notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
      })

      mockSendEmail.mockResolvedValue(true)

      const req = createMockRequest({
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        topic: 'general',
        message: 'This is a test message',
      })

      await POST(req)

      expect(mockCreateContactSubmission).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        })
      )
    })
  })
})

describe('GET /api/contact', () => {
  it('should return method not allowed', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Method not allowed')
  })
})