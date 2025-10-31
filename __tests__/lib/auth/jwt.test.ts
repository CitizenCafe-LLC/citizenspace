/**
 * JWT Token Management Tests
 * Tests for JWT token utility functions
 */

import { describe, test, expect } from '@jest/globals'
import { extractTokenFromHeader } from '@/lib/auth/jwt'

describe('JWT Token Management', () => {
  describe('extractTokenFromHeader', () => {
    test('should extract token from valid Authorization header', () => {
      const token = 'valid.jwt.token'
      const header = `Bearer ${token}`

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBe(token)
    })

    test('should return null for null header', () => {
      const extracted = extractTokenFromHeader(null)

      expect(extracted).toBeNull()
    })

    test('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('')

      expect(extracted).toBeNull()
    })

    test('should return null for header without Bearer prefix', () => {
      const token = 'valid.jwt.token'
      const header = token

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBeNull()
    })

    test('should return null for header with wrong prefix', () => {
      const token = 'valid.jwt.token'
      const header = `Basic ${token}`

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBeNull()
    })

    test('should return null for header with extra parts', () => {
      const header = 'Bearer token extra'

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBeNull()
    })

    test('should handle case-sensitive Bearer prefix', () => {
      const token = 'valid.jwt.token'
      const header = `bearer ${token}` // lowercase

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBeNull() // Should fail with lowercase
    })

    test('should extract long token', () => {
      const longToken = 'a'.repeat(500)
      const header = `Bearer ${longToken}`

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBe(longToken)
    })

    test('should handle token with special characters', () => {
      const token = 'token.with-special_chars123'
      const header = `Bearer ${token}`

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBe(token)
    })

    test('should handle token with dots (JWT format)', () => {
      const token = 'eyJhbGci.eyJzdWIi.SflKxwRJ'
      const header = `Bearer ${token}`

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBe(token)
    })

    test('should return null for undefined header', () => {
      const extracted = extractTokenFromHeader(undefined as any)

      expect(extracted).toBeNull()
    })

    test('should trim whitespace correctly', () => {
      const token = 'valid.jwt.token'
      const header = `Bearer ${token}`

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBe(token)
      expect(extracted).not.toContain(' ')
    })

    test('should handle header with only Bearer', () => {
      const header = 'Bearer'

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBeNull()
    })

    test('should handle header with Bearer and empty token', () => {
      const header = 'Bearer '

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBe('')
    })

    test('should handle very long JWT tokens', () => {
      const longToken = 'eyJ' + 'a'.repeat(1000) + '.eyJ' + 'b'.repeat(1000) + '.' + 'c'.repeat(1000)
      const header = `Bearer ${longToken}`

      const extracted = extractTokenFromHeader(header)

      expect(extracted).toBe(longToken)
    })
  })
})
