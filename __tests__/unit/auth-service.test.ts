/**
 * Unit Tests for Authentication Service
 */

import { registerUser, loginUser, AuthenticationError } from '@/lib/auth/service'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
    auth: {
      admin: {
        createUser: jest.fn(),
        deleteUser: jest.fn(),
      },
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}))

describe('Authentication Service', () => {
  describe('registerUser', () => {
    it('should reject invalid email format', async () => {
      await expect(
        registerUser({
          email: 'invalid-email',
          password: 'StrongPass123!',
        })
      ).rejects.toThrow(AuthenticationError)
    })

    it('should reject weak password', async () => {
      await expect(
        registerUser({
          email: 'test@example.com',
          password: 'weak',
        })
      ).rejects.toThrow(AuthenticationError)
    })

    it('should validate email format', async () => {
      const validEmails = ['test@example.com', 'user.name@example.co.uk', 'user+tag@example.com']

      for (const email of validEmails) {
        try {
          await registerUser({
            email,
            password: 'StrongPass123!',
          })
        } catch (error) {
          if (error instanceof AuthenticationError && error.code === 'INVALID_EMAIL') {
            fail(`Email ${email} should be valid`)
          }
        }
      }
    })

    it('should validate password requirements', async () => {
      const weakPasswords = [
        'short',
        'nouppercase123!',
        'NOLOWERCASE123!',
        'NoNumbers!',
        'NoSpecialChars123',
      ]

      for (const password of weakPasswords) {
        await expect(
          registerUser({
            email: 'test@example.com',
            password,
          })
        ).rejects.toThrow(AuthenticationError)
      }
    })
  })

  describe('loginUser', () => {
    it('should reject invalid email format', async () => {
      await expect(
        loginUser({
          email: 'invalid-email',
          password: 'anypassword',
        })
      ).rejects.toThrow(AuthenticationError)
    })
  })

  describe('AuthenticationError', () => {
    it('should create error with correct properties', () => {
      const error = new AuthenticationError('TEST_CODE', 'Test message', 400)

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AuthenticationError)
      expect(error.code).toBe('TEST_CODE')
      expect(error.message).toBe('Test message')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('AuthenticationError')
    })

    it('should use default status code 400', () => {
      const error = new AuthenticationError('TEST_CODE', 'Test message')
      expect(error.statusCode).toBe(400)
    })
  })
})
