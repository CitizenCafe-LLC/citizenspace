/**
 * Unit Tests for Password Utilities
 */

import {
  validatePassword,
  hashPassword,
  comparePassword,
  generateResetToken,
  PASSWORD_POLICY,
} from '@/lib/auth/password'

describe('Password Utilities', () => {
  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject password that is too short', () => {
      const result = validatePassword('Short1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_POLICY.minLength} characters long`
      )
    })

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('weakpass123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('WEAKPASS123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without number', () => {
      const result = validatePassword('WeakPassword!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special character', () => {
      const result = validatePassword('WeakPassword123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should reject password that is too long', () => {
      const longPassword = 'A1!' + 'a'.repeat(126)
      const result = validatePassword(longPassword)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        `Password must not exceed ${PASSWORD_POLICY.maxLength} characters`
      )
    })

    it('should reject null or undefined password', () => {
      const result = validatePassword(null as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password is required')
    })

    it('should return multiple errors for weak password', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!'
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2) // Different salts
    })
  })

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!'
      const hashed = await hashPassword(password)
      const result = await comparePassword(password, hashed)

      expect(result).toBe(true)
    })

    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!'
      const wrongPassword = 'WrongPassword123!'
      const hashed = await hashPassword(password)
      const result = await comparePassword(wrongPassword, hashed)

      expect(result).toBe(false)
    })

    it('should handle empty passwords', async () => {
      const hashed = await hashPassword('TestPassword123!')
      const result = await comparePassword('', hashed)

      expect(result).toBe(false)
    })
  })

  describe('generateResetToken', () => {
    it('should generate a token', () => {
      const token = generateResetToken()
      expect(token).toBeDefined()
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate unique tokens', () => {
      const token1 = generateResetToken()
      const token2 = generateResetToken()
      expect(token1).not.toBe(token2)
    })

    it('should generate alphanumeric tokens', () => {
      const token = generateResetToken()
      expect(token).toMatch(/^[A-Za-z0-9]+$/)
    })
  })
})
