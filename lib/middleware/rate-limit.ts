/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiter to prevent spam and abuse
 * For production, consider using Redis for distributed rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api/response'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store for rate limiting
// In production, use Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
// Use unref() to prevent keeping the process alive during tests
const cleanupInterval = setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Prevent the interval from keeping the process alive
if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref()
}

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number

  /**
   * Time window in milliseconds
   */
  windowMs: number

  /**
   * Custom identifier key (default: IP address)
   */
  keyGenerator?: (req: NextRequest) => string

  /**
   * Message to return when rate limit is exceeded
   */
  message?: string

  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (req: NextRequest) => boolean
}

/**
 * Default key generator: extracts IP address from request
 */
function getClientIp(req: NextRequest): string {
  // Try to get IP from various headers (considering proxies)
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip') // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to a default value if IP cannot be determined
  return 'unknown'
}

/**
 * Create a rate limiter middleware
 * @param config Rate limit configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    keyGenerator = getClientIp,
    message = 'Too many requests, please try again later',
    skip,
  } = config

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Skip rate limiting if condition is met
    if (skip && skip(req)) {
      return null // Continue to next handler
    }

    // Generate identifier key
    const identifier = keyGenerator(req)
    const now = Date.now()
    const key = `${identifier}:${req.nextUrl.pathname}`

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key)

    // Initialize or reset if window has passed
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + windowMs,
      }
      rateLimitStore.set(key, entry)
    }

    // Increment request count
    entry.count++

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)

      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetAt.toString(),
          },
        }
      )
    }

    // Add rate limit headers to response (will be added by the endpoint handler)
    // Store in a way that can be accessed by the endpoint
    ;(req as any).rateLimitInfo = {
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      reset: entry.resetAt,
    }

    return null // Continue to next handler
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */

/**
 * Strict rate limiter for contact forms (5 requests per hour)
 */
export const contactFormRateLimit = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many contact form submissions. Please try again in an hour.',
})

/**
 * Moderate rate limiter for newsletter subscriptions (10 requests per hour)
 */
export const newsletterRateLimit = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many subscription attempts. Please try again later.',
})

/**
 * General API rate limiter (100 requests per 15 minutes)
 */
export const generalApiRateLimit = createRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many API requests. Please slow down.',
})

/**
 * Auth rate limiter (10 requests per 15 minutes)
 */
export const authRateLimit = createRateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
})

/**
 * Helper to apply rate limiting to an API route handler
 */
export async function applyRateLimit(
  req: NextRequest,
  limiter: (req: NextRequest) => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  return await limiter(req)
}

/**
 * Helper to add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  req: NextRequest
): NextResponse {
  const rateLimitInfo = (req as any).rateLimitInfo

  if (rateLimitInfo) {
    response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString())
  }

  return response
}

/**
 * Get current rate limit status for testing
 */
export function getRateLimitStatus(identifier: string, pathname: string): RateLimitEntry | null {
  const key = `${identifier}:${pathname}`
  return rateLimitStore.get(key) || null
}

/**
 * Clear rate limit for testing
 */
export function clearRateLimit(identifier: string, pathname: string): void {
  const key = `${identifier}:${pathname}`
  rateLimitStore.delete(key)
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear()
}