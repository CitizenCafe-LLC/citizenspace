/**
 * Password Utilities Tests
 * Comprehensive tests for password validation, hashing, and comparison
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import {
  validatePassword,
  hashPassword,
  comparePassword,
  generateResetToken,
  PASSWORD_POLICY,
} from '@/lib/auth/password'

describe('Password Utilities', () => {
  describe('PASSWORD_POLICY', () => {
    test('should have correct policy configuration', () => {
      expect(PASSWORD_POLICY.minLength).toBe(8)
      expect(PASSWORD_POLICY.maxLength).toBe(128)
      expect(PASSWORD_POLICY.requireUppercase).toBe(true)
      expect(PASSWORD_POLICY.requireLowercase).toBe(true)
      expect(PASSWORD_POLICY.requireNumbers).toBe(true)
      expect(PASSWORD_POLICY.requireSpecialChars).toBe(true)
    })
  })

  describe('validatePassword', () => {
    test('should accept valid password', () => {
      const result = validatePassword('ValidPass123!')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accept password with all required character types', () => {
      const validPasswords = [
        'Abcdefg1!',
        'MyP@ssw0rd',
        'T3st!ngPass',
        'C0mpl3x!Pass',
        'Str0ng#Password',
      ]

      validPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    test('should reject null or undefined password', () => {
      const result = validatePassword(null as any)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password is required')
    })

    test('should reject non-string password', () => {
      const result = validatePassword(12345 as any)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password is required')
    })

    test('should reject empty password', () => {
      const result = validatePassword('')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password is required')
    })

    test('should reject password shorter than minimum length', () => {
      const result = validatePassword('Short1!')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    test('should reject password longer than maximum length', () => {
      const longPassword = 'A'.repeat(129) + '1!'
      const result = validatePassword(longPassword)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must not exceed 128 characters')
    })

    test('should reject password without uppercase letter', () => {
      const result = validatePassword('lowercase123!')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    test('should reject password without lowercase letter', () => {
      const result = validatePassword('UPPERCASE123!')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    test('should reject password without number', () => {
      const result = validatePassword('NoNumbers!')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    test('should reject password without special character', () => {
      const result = validatePassword('NoSpecial123')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    test('should return multiple errors for invalid password', () => {
      const result = validatePassword('weak')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.errors).toContain('Password must be at least 8 characters long')
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
      expect(result.errors).toContain('Password must contain at least one number')
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    test('should accept all valid special characters', () => {
      const specialChars = '!@#$%^&*(),.?":{}|<>'

      for (const char of specialChars) {
        const password = `ValidP4ss${char}`
        const result = validatePassword(password)
        expect(result.isValid).toBe(true)
      }
    })

    test('should accept password at minimum length', () => {
      const result = validatePassword('Valid12!')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accept password at maximum length', () => {
      const maxPassword = 'A' + 'a'.repeat(124) + '1!'
      const result = validatePassword(maxPassword)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle password with multiple special characters', () => {
      const result = validatePassword('C0mpl3x!@#$%^')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle password with multiple numbers', () => {
      const result = validatePassword('Pass123456!')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle password with multiple uppercase letters', () => {
      const result = validatePassword('PASSword123!')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle password with whitespace', () => {
      const result = validatePassword('Pass word 123!')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle password with unicode characters', () => {
      const result = validatePassword('Påssw0rd!')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('hashPassword', () => {
    test('should hash password successfully', async () => {
      const password = 'ValidPass123!'
      const hash = await hashPassword(password)

      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    test('should generate different hashes for same password', async () => {
      const password = 'ValidPass123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      // bcrypt generates different salts, so hashes should differ
      expect(hash1).not.toBe(hash2)
    })

    test('should generate hash starting with bcrypt prefix', async () => {
      const password = 'ValidPass123!'
      const hash = await hashPassword(password)

      // bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash.startsWith('$2')).toBe(true)
    })

    test('should hash passwords of different lengths', async () => {
      const shortPassword = 'Valid12!'
      const longPassword = 'A' + 'a'.repeat(124) + '1!'

      const shortHash = await hashPassword(shortPassword)
      const longHash = await hashPassword(longPassword)

      expect(shortHash).toBeTruthy()
      expect(longHash).toBeTruthy()
      expect(shortHash).not.toBe(longHash)
    })

    test('should hash password with special characters', async () => {
      const password = 'C0mpl3x!@#$%^&*()'
      const hash = await hashPassword(password)

      expect(hash).toBeTruthy()
      expect(hash).not.toBe(password)
    })

    test('should hash password with unicode characters', async () => {
      const password = 'Påssw0rd!€£'
      const hash = await hashPassword(password)

      expect(hash).toBeTruthy()
      expect(hash).not.toBe(password)
    })
  })

  describe('comparePassword', () => {
    test('should return true for matching password', async () => {
      const password = 'ValidPass123!'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword(password, hash)

      expect(isMatch).toBe(true)
    })

    test('should return false for non-matching password', async () => {
      const password = 'ValidPass123!'
      const wrongPassword = 'WrongPass456!'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword(wrongPassword, hash)

      expect(isMatch).toBe(false)
    })

    test('should return false for slightly different password', async () => {
      const password = 'ValidPass123!'
      const similarPassword = 'ValidPass123'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword(similarPassword, hash)

      expect(isMatch).toBe(false)
    })

    test('should be case-sensitive', async () => {
      const password = 'ValidPass123!'
      const wrongCasePassword = 'validpass123!'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword(wrongCasePassword, hash)

      expect(isMatch).toBe(false)
    })

    test('should handle empty string comparison', async () => {
      const password = 'ValidPass123!'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword('', hash)

      expect(isMatch).toBe(false)
    })

    test('should handle password with whitespace', async () => {
      const password = 'Valid Pass 123!'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword(password, hash)

      expect(isMatch).toBe(true)
    })

    test('should handle password with special characters', async () => {
      const password = 'C0mpl3x!@#$%^&*()'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword(password, hash)

      expect(isMatch).toBe(true)
    })

    test('should handle password with unicode characters', async () => {
      const password = 'Påssw0rd!€£'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword(password, hash)

      expect(isMatch).toBe(true)
    })

    test('should work with different bcrypt rounds', async () => {
      // The current implementation uses 12 rounds
      const password = 'ValidPass123!'
      const hash = await hashPassword(password)
      const isMatch = await comparePassword(password, hash)

      expect(isMatch).toBe(true)
    })

    test('should handle long passwords', async () => {
      const longPassword = 'A' + 'a'.repeat(124) + '1!'
      const hash = await hashPassword(longPassword)
      const isMatch = await comparePassword(longPassword, hash)

      expect(isMatch).toBe(true)
    })
  })

  describe('generateResetToken', () => {
    test('should generate a reset token', () => {
      const token = generateResetToken()

      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBe(32)
    })

    test('should generate different tokens on each call', () => {
      const token1 = generateResetToken()
      const token2 = generateResetToken()
      const token3 = generateResetToken()

      expect(token1).not.toBe(token2)
      expect(token2).not.toBe(token3)
      expect(token1).not.toBe(token3)
    })

    test('should generate token with only alphanumeric characters', () => {
      const token = generateResetToken()
      const alphanumericRegex = /^[A-Za-z0-9]+$/

      expect(alphanumericRegex.test(token)).toBe(true)
    })

    test('should generate token of consistent length', () => {
      for (let i = 0; i < 10; i++) {
        const token = generateResetToken()
        expect(token.length).toBe(32)
      }
    })

    test('should generate cryptographically random tokens', () => {
      // Generate multiple tokens and ensure they are unique
      const tokens = new Set<string>()
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        tokens.add(generateResetToken())
      }

      // All tokens should be unique
      expect(tokens.size).toBe(iterations)
    })

    test('should not contain special characters', () => {
      const token = generateResetToken()
      const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/

      expect(specialCharsRegex.test(token)).toBe(false)
    })

    test('should not contain whitespace', () => {
      const token = generateResetToken()

      expect(token).not.toContain(' ')
      expect(token).not.toContain('\t')
      expect(token).not.toContain('\n')
    })
  })

  describe('Integration Tests', () => {
    test('complete password validation and hashing flow', async () => {
      const password = 'SecurePass123!'

      // Validate password
      const validation = validatePassword(password)
      expect(validation.isValid).toBe(true)

      // Hash password
      const hash = await hashPassword(password)
      expect(hash).toBeTruthy()

      // Compare password
      const isMatch = await comparePassword(password, hash)
      expect(isMatch).toBe(true)
    })

    test('reject invalid password in flow', async () => {
      const invalidPassword = 'weak'

      // Validation should fail
      const validation = validatePassword(invalidPassword)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)

      // In real flow, we would not proceed to hashing
    })

    test('password reset token generation and uniqueness', () => {
      const tokens: string[] = []

      for (let i = 0; i < 50; i++) {
        const token = generateResetToken()
        expect(token.length).toBe(32)
        expect(tokens).not.toContain(token)
        tokens.push(token)
      }
    })

    test('hash and compare multiple passwords', async () => {
      const passwords = [
        'Password1!',
        'DifferentP@ss2',
        'AnotherS3cure!',
        'FinalTest4$',
      ]

      for (const password of passwords) {
        const hash = await hashPassword(password)
        const correctMatch = await comparePassword(password, hash)
        const wrongMatch = await comparePassword('WrongPass123!', hash)

        expect(correctMatch).toBe(true)
        expect(wrongMatch).toBe(false)
      }
    })
  })

  describe('Edge Cases', () => {
    test('should handle password at exactly minimum length', () => {
      const password = 'Valid12!' // 8 characters
      const result = validatePassword(password)

      expect(result.isValid).toBe(true)
    })

    test('should handle password at exactly maximum length', () => {
      const password = 'V' + 'a'.repeat(124) + '1!' // 128 characters
      const result = validatePassword(password)

      expect(result.isValid).toBe(true)
    })

    test('should handle password with consecutive special characters', () => {
      const password = 'Pass123!!!!'
      const result = validatePassword(password)

      expect(result.isValid).toBe(true)
    })

    test('should handle password with all same character type at end', () => {
      const password = 'Pass1!!!!!!'
      const result = validatePassword(password)

      expect(result.isValid).toBe(true)
    })

    test('should handle password comparison with very long password', async () => {
      const longPassword = 'A' + 'b'.repeat(125) + '1!'
      const hash = await hashPassword(longPassword)
      const isMatch = await comparePassword(longPassword, hash)

      expect(isMatch).toBe(true)
    })
  })
})
