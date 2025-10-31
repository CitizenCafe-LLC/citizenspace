/**
 * @jest-environment node
 *
 * Comprehensive Tests for Rate Limiting Middleware
 *
 * Tests cover:
 * - Rate limiting logic (requests within limits, exceeding limits, different time windows)
 * - Rate limit headers (X-RateLimit-Limit, Remaining, Reset, Retry-After)
 * - Client identifier extraction from various headers
 * - Edge cases and error handling
 * - Custom key generators and skip functions
 * - Pre-configured rate limiters
 * - Helper functions
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  createRateLimiter,
  contactFormRateLimit,
  newsletterRateLimit,
  generalApiRateLimit,
  authRateLimit,
  applyRateLimit,
  addRateLimitHeaders,
  getRateLimitStatus,
  clearRateLimit,
  clearAllRateLimits,
  RateLimitConfig,
} from '@/lib/middleware/rate-limit'

// Mock NextRequest helper
function createMockRequest(
  pathname: string,
  headers: Record<string, string> = {}
): NextRequest {
  const url = `http://localhost:3000${pathname}`
  const request = new NextRequest(url)

  // Set custom headers
  Object.entries(headers).forEach(([key, value]) => {
    ;(request as any).headers.set(key, value)
  })

  return request
}

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits()
    jest.clearAllMocks()
  })

  describe('createRateLimiter', () => {
    describe('Basic Rate Limiting', () => {
      it('should allow requests within the limit', async () => {
        const limiter = createRateLimiter({
          maxRequests: 3,
          windowMs: 60000, // 1 minute
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        // Make 3 requests - all should pass
        const response1 = await limiter(request)
        const response2 = await limiter(request)
        const response3 = await limiter(request)

        expect(response1).toBeNull()
        expect(response2).toBeNull()
        expect(response3).toBeNull()

        // Verify rate limit info is attached to request
        expect((request as any).rateLimitInfo).toBeDefined()
        expect((request as any).rateLimitInfo.limit).toBe(3)
        expect((request as any).rateLimitInfo.remaining).toBe(0)
      })

      it('should block requests exceeding the limit', async () => {
        const limiter = createRateLimiter({
          maxRequests: 2,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        // First 2 requests should pass
        await limiter(request)
        await limiter(request)

        // Third request should be blocked
        const response = await limiter(request)

        expect(response).not.toBeNull()
        expect(response?.status).toBe(429)

        const data = await response?.json()
        expect(data.success).toBe(false)
        expect(data.error).toBe('Too many requests, please try again later')
      })

      it('should reset after time window expires', async () => {
        const windowMs = 100 // 100ms for fast test
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        // First request should pass
        const response1 = await limiter(request)
        expect(response1).toBeNull()

        // Second request should be blocked
        const response2 = await limiter(request)
        expect(response2?.status).toBe(429)

        // Wait for window to expire
        await new Promise(resolve => setTimeout(resolve, windowMs + 10))

        // Request should pass again
        const response3 = await limiter(request)
        expect(response3).toBeNull()
      })

      it('should track different paths separately', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const ip = '192.168.1.1'

        const request1 = createMockRequest('/api/test1', {
          'x-forwarded-for': ip,
        })
        const request2 = createMockRequest('/api/test2', {
          'x-forwarded-for': ip,
        })

        // Both requests should pass as they're to different paths
        const response1 = await limiter(request1)
        const response2 = await limiter(request2)

        expect(response1).toBeNull()
        expect(response2).toBeNull()
      })

      it('should track different IPs separately', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request1 = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })
        const request2 = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.2',
        })

        // Both requests should pass as they're from different IPs
        const response1 = await limiter(request1)
        const response2 = await limiter(request2)

        expect(response1).toBeNull()
        expect(response2).toBeNull()
      })
    })

    describe('Rate Limit Headers', () => {
      it('should include correct rate limit headers in 429 response', async () => {
        const maxRequests = 2
        const limiter = createRateLimiter({
          maxRequests,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        // Exhaust the limit
        await limiter(request)
        await limiter(request)

        // Get the blocked response
        const response = await limiter(request)

        expect(response).not.toBeNull()
        expect(response?.headers.get('X-RateLimit-Limit')).toBe(maxRequests.toString())
        expect(response?.headers.get('X-RateLimit-Remaining')).toBe('0')
        expect(response?.headers.get('X-RateLimit-Reset')).toBeDefined()
        expect(response?.headers.get('Retry-After')).toBeDefined()
      })

      it('should include Retry-After header with correct value', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000, // 1 minute
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        // Exhaust the limit
        await limiter(request)

        // Get the blocked response
        const response = await limiter(request)

        const retryAfter = response?.headers.get('Retry-After')
        expect(retryAfter).toBeDefined()

        const retrySeconds = parseInt(retryAfter || '0', 10)
        expect(retrySeconds).toBeGreaterThan(0)
        expect(retrySeconds).toBeLessThanOrEqual(60)
      })

      it('should attach rate limit info to request for successful requests', async () => {
        const maxRequests = 5
        const limiter = createRateLimiter({
          maxRequests,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        await limiter(request)
        await limiter(request)

        const rateLimitInfo = (request as any).rateLimitInfo
        expect(rateLimitInfo).toBeDefined()
        expect(rateLimitInfo.limit).toBe(maxRequests)
        expect(rateLimitInfo.remaining).toBe(maxRequests - 2)
        expect(rateLimitInfo.reset).toBeDefined()
        expect(typeof rateLimitInfo.reset).toBe('number')
      })
    })

    describe('Client Identifier Extraction', () => {
      it('should extract IP from x-forwarded-for header', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.100',
        })

        await limiter(request)
        const response = await limiter(request)

        expect(response?.status).toBe(429)
      })

      it('should extract first IP from comma-separated x-forwarded-for', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1, 172.16.0.1',
        })

        await limiter(request)

        // Create another request with same first IP
        const request2 = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.100, 10.0.0.2',
        })

        const response = await limiter(request2)
        expect(response?.status).toBe(429)
      })

      it('should extract IP from x-real-ip header when x-forwarded-for is absent', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-real-ip': '192.168.2.100',
        })

        await limiter(request)
        const response = await limiter(request)

        expect(response?.status).toBe(429)
      })

      it('should extract IP from cf-connecting-ip header (Cloudflare)', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'cf-connecting-ip': '192.168.3.100',
        })

        await limiter(request)
        const response = await limiter(request)

        expect(response?.status).toBe(429)
      })

      it('should prioritize x-forwarded-for over other headers', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request1 = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.2.1',
          'cf-connecting-ip': '192.168.3.1',
        })

        await limiter(request1)

        // Same x-forwarded-for should be blocked
        const request2 = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        const response = await limiter(request2)
        expect(response?.status).toBe(429)
      })

      it('should use "unknown" as fallback when no IP headers are present', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request1 = createMockRequest('/api/test')
        const request2 = createMockRequest('/api/test')

        await limiter(request1)
        const response = await limiter(request2)

        // Should be rate limited as both use "unknown"
        expect(response?.status).toBe(429)
      })
    })

    describe('Custom Configuration', () => {
      it('should use custom key generator', async () => {
        const customKeyGenerator = (req: NextRequest) => {
          return req.headers.get('x-custom-id') || 'default'
        }

        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
          keyGenerator: customKeyGenerator,
        })

        const request1 = createMockRequest('/api/test', {
          'x-custom-id': 'user-123',
        })
        const request2 = createMockRequest('/api/test', {
          'x-custom-id': 'user-456',
        })

        await limiter(request1)

        // Different custom ID should not be rate limited
        const response1 = await limiter(request2)
        expect(response1).toBeNull()

        // Same custom ID should be rate limited
        const request3 = createMockRequest('/api/test', {
          'x-custom-id': 'user-123',
        })
        const response2 = await limiter(request3)
        expect(response2?.status).toBe(429)
      })

      it('should use custom error message', async () => {
        const customMessage = 'Custom rate limit exceeded message'
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
          message: customMessage,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        await limiter(request)
        const response = await limiter(request)

        const data = await response?.json()
        expect(data.error).toBe(customMessage)
      })

      it('should skip rate limiting when skip function returns true', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
          skip: (req) => req.headers.get('x-skip-rate-limit') === 'true',
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
          'x-skip-rate-limit': 'true',
        })

        // Multiple requests should all pass
        const response1 = await limiter(request)
        const response2 = await limiter(request)
        const response3 = await limiter(request)

        expect(response1).toBeNull()
        expect(response2).toBeNull()
        expect(response3).toBeNull()
      })

      it('should not skip rate limiting when skip function returns false', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
          skip: (req) => req.headers.get('x-skip-rate-limit') === 'true',
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
          'x-skip-rate-limit': 'false',
        })

        await limiter(request)
        const response = await limiter(request)

        expect(response?.status).toBe(429)
      })
    })

    describe('Different Time Windows', () => {
      it('should handle short time windows correctly', async () => {
        const limiter = createRateLimiter({
          maxRequests: 2,
          windowMs: 50, // 50ms
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        await limiter(request)
        await limiter(request)

        // Should be blocked
        const response1 = await limiter(request)
        expect(response1?.status).toBe(429)

        // Wait for window to reset
        await new Promise(resolve => setTimeout(resolve, 60))

        // Should work again
        const response2 = await limiter(request)
        expect(response2).toBeNull()
      })

      it('should handle long time windows correctly', async () => {
        const limiter = createRateLimiter({
          maxRequests: 3,
          windowMs: 60 * 60 * 1000, // 1 hour
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        const response1 = await limiter(request)
        const response2 = await limiter(request)
        const response3 = await limiter(request)

        expect(response1).toBeNull()
        expect(response2).toBeNull()
        expect(response3).toBeNull()

        const response4 = await limiter(request)
        expect(response4?.status).toBe(429)

        // Verify reset time is approximately 1 hour from now
        const resetAt = (request as any).rateLimitInfo?.reset
        const now = Date.now()
        const timeUntilReset = resetAt - now

        expect(timeUntilReset).toBeGreaterThan(59 * 60 * 1000) // At least 59 minutes
        expect(timeUntilReset).toBeLessThanOrEqual(60 * 60 * 1000) // At most 60 minutes
      })
    })

    describe('Edge Cases', () => {
      it('should handle zero maxRequests', async () => {
        const limiter = createRateLimiter({
          maxRequests: 0,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        const response = await limiter(request)
        expect(response?.status).toBe(429)
      })

      it('should handle very high maxRequests', async () => {
        const limiter = createRateLimiter({
          maxRequests: 10000,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        // Make multiple requests
        for (let i = 0; i < 100; i++) {
          const response = await limiter(request)
          expect(response).toBeNull()
        }

        const rateLimitInfo = (request as any).rateLimitInfo
        expect(rateLimitInfo.remaining).toBe(10000 - 100)
      })

      it('should handle concurrent requests correctly', async () => {
        const limiter = createRateLimiter({
          maxRequests: 5,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        // Make 10 concurrent requests
        const promises = Array(10).fill(null).map(() => limiter(request))
        const responses = await Promise.all(promises)

        // 5 should pass, 5 should be blocked
        const blocked = responses.filter(r => r?.status === 429)
        const passed = responses.filter(r => r === null)

        expect(blocked.length).toBe(5)
        expect(passed.length).toBe(5)
      })

      it('should handle requests with special characters in pathname', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test?param=value&special=!@#$%', {
          'x-forwarded-for': '192.168.1.1',
        })

        await limiter(request)
        const response = await limiter(request)

        expect(response?.status).toBe(429)
      })
    })
  })

  describe('Pre-configured Rate Limiters', () => {
    it('contactFormRateLimit should have correct configuration', async () => {
      const request = createMockRequest('/api/contact', {
        'x-forwarded-for': '192.168.1.1',
      })

      // Should allow 5 requests
      for (let i = 0; i < 5; i++) {
        const response = await contactFormRateLimit(request)
        expect(response).toBeNull()
      }

      // 6th should be blocked
      const response = await contactFormRateLimit(request)
      expect(response?.status).toBe(429)

      const data = await response?.json()
      expect(data.error).toContain('contact form')
    })

    it('newsletterRateLimit should have correct configuration', async () => {
      const request = createMockRequest('/api/newsletter', {
        'x-forwarded-for': '192.168.1.1',
      })

      // Should allow 10 requests
      for (let i = 0; i < 10; i++) {
        const response = await newsletterRateLimit(request)
        expect(response).toBeNull()
      }

      // 11th should be blocked
      const response = await newsletterRateLimit(request)
      expect(response?.status).toBe(429)

      const data = await response?.json()
      expect(data.error).toContain('subscription')
    })

    it('generalApiRateLimit should have correct configuration', async () => {
      const request = createMockRequest('/api/general', {
        'x-forwarded-for': '192.168.1.1',
      })

      // Should allow 100 requests
      for (let i = 0; i < 100; i++) {
        const response = await generalApiRateLimit(request)
        expect(response).toBeNull()
      }

      // 101st should be blocked
      const response = await generalApiRateLimit(request)
      expect(response?.status).toBe(429)

      const data = await response?.json()
      expect(data.error).toContain('API')
    })

    it('authRateLimit should have correct configuration', async () => {
      const request = createMockRequest('/api/auth/login', {
        'x-forwarded-for': '192.168.1.1',
      })

      // Should allow 10 requests
      for (let i = 0; i < 10; i++) {
        const response = await authRateLimit(request)
        expect(response).toBeNull()
      }

      // 11th should be blocked
      const response = await authRateLimit(request)
      expect(response?.status).toBe(429)

      const data = await response?.json()
      expect(data.error).toContain('authentication')
    })
  })

  describe('Helper Functions', () => {
    describe('applyRateLimit', () => {
      it('should apply rate limiter and return null for allowed requests', async () => {
        const limiter = createRateLimiter({
          maxRequests: 3,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        const response = await applyRateLimit(request, limiter)
        expect(response).toBeNull()
      })

      it('should apply rate limiter and return response for blocked requests', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        await applyRateLimit(request, limiter)
        const response = await applyRateLimit(request, limiter)

        expect(response).not.toBeNull()
        expect(response?.status).toBe(429)
      })
    })

    describe('addRateLimitHeaders', () => {
      it('should add rate limit headers to response', async () => {
        const limiter = createRateLimiter({
          maxRequests: 5,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        await limiter(request)

        const response = NextResponse.json({ success: true })
        const responseWithHeaders = addRateLimitHeaders(response, request)

        expect(responseWithHeaders.headers.get('X-RateLimit-Limit')).toBe('5')
        expect(responseWithHeaders.headers.get('X-RateLimit-Remaining')).toBe('4')
        expect(responseWithHeaders.headers.get('X-RateLimit-Reset')).toBeDefined()
      })

      it('should not add headers if rate limit info is not present', () => {
        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        const response = NextResponse.json({ success: true })
        const responseWithHeaders = addRateLimitHeaders(response, request)

        expect(responseWithHeaders.headers.get('X-RateLimit-Limit')).toBeNull()
        expect(responseWithHeaders.headers.get('X-RateLimit-Remaining')).toBeNull()
        expect(responseWithHeaders.headers.get('X-RateLimit-Reset')).toBeNull()
      })
    })

    describe('getRateLimitStatus', () => {
      it('should return rate limit status for existing entry', async () => {
        const limiter = createRateLimiter({
          maxRequests: 5,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        await limiter(request)
        await limiter(request)

        const status = getRateLimitStatus('192.168.1.1', '/api/test')

        expect(status).not.toBeNull()
        expect(status?.count).toBe(2)
        expect(status?.resetAt).toBeDefined()
      })

      it('should return null for non-existent entry', () => {
        const status = getRateLimitStatus('192.168.1.1', '/api/nonexistent')
        expect(status).toBeNull()
      })
    })

    describe('clearRateLimit', () => {
      it('should clear specific rate limit entry', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request = createMockRequest('/api/test', {
          'x-forwarded-for': '192.168.1.1',
        })

        await limiter(request)

        // Should be blocked before clearing
        let response = await limiter(request)
        expect(response?.status).toBe(429)

        // Clear the rate limit
        clearRateLimit('192.168.1.1', '/api/test')

        // Should work again
        response = await limiter(request)
        expect(response).toBeNull()
      })

      it('should not affect other rate limit entries', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request1 = createMockRequest('/api/test1', {
          'x-forwarded-for': '192.168.1.1',
        })
        const request2 = createMockRequest('/api/test2', {
          'x-forwarded-for': '192.168.1.1',
        })

        await limiter(request1)
        await limiter(request2)

        // Clear only test1
        clearRateLimit('192.168.1.1', '/api/test1')

        // test1 should work
        const response1 = await limiter(request1)
        expect(response1).toBeNull()

        // test2 should still be blocked
        const response2 = await limiter(request2)
        expect(response2?.status).toBe(429)
      })
    })

    describe('clearAllRateLimits', () => {
      it('should clear all rate limit entries', async () => {
        const limiter = createRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
        })

        const request1 = createMockRequest('/api/test1', {
          'x-forwarded-for': '192.168.1.1',
        })
        const request2 = createMockRequest('/api/test2', {
          'x-forwarded-for': '192.168.1.2',
        })

        await limiter(request1)
        await limiter(request2)

        // Both should be blocked
        let response1 = await limiter(request1)
        let response2 = await limiter(request2)
        expect(response1?.status).toBe(429)
        expect(response2?.status).toBe(429)

        // Clear all
        clearAllRateLimits()

        // Both should work again
        response1 = await limiter(request1)
        response2 = await limiter(request2)
        expect(response1).toBeNull()
        expect(response2).toBeNull()
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complex multi-user scenario', async () => {
      const limiter = createRateLimiter({
        maxRequests: 3,
        windowMs: 60000,
      })

      const users = ['192.168.1.1', '192.168.1.2', '192.168.1.3']
      const paths = ['/api/test1', '/api/test2']

      // Each user should be able to make 3 requests per path
      for (const user of users) {
        for (const path of paths) {
          for (let i = 0; i < 3; i++) {
            const request = createMockRequest(path, {
              'x-forwarded-for': user,
            })
            const response = await limiter(request)
            expect(response).toBeNull()
          }

          // 4th request should be blocked
          const request = createMockRequest(path, {
            'x-forwarded-for': user,
          })
          const response = await limiter(request)
          expect(response?.status).toBe(429)
        }
      }
    })

    it('should properly handle rate limit with custom key and skip', async () => {
      const limiter = createRateLimiter({
        maxRequests: 2,
        windowMs: 60000,
        keyGenerator: (req) => req.headers.get('x-user-id') || 'anonymous',
        skip: (req) => req.headers.get('x-api-key') === 'admin-key',
      })

      // Admin requests should never be blocked
      for (let i = 0; i < 10; i++) {
        const request = createMockRequest('/api/test', {
          'x-api-key': 'admin-key',
          'x-user-id': 'admin',
        })
        const response = await limiter(request)
        expect(response).toBeNull()
      }

      // Regular user should be blocked after 2 requests
      const userRequest1 = createMockRequest('/api/test', {
        'x-user-id': 'user123',
      })
      await limiter(userRequest1)
      await limiter(userRequest1)

      const userRequest2 = createMockRequest('/api/test', {
        'x-user-id': 'user123',
      })
      const response = await limiter(userRequest2)
      expect(response?.status).toBe(429)
    })
  })
})