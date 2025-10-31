/**
 * Password Reset Service Tests
 * Comprehensive tests for password reset functionality
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import {
  initiatePasswordReset,
  resetPasswordWithToken,
  changePassword,
} from '@/lib/auth/password-reset'

// Create mocks that can be modified in tests
const mockFrom = jest.fn()
const mockGenerateLink = jest.fn()
const mockUpdateUserById = jest.fn()
const mockSignOut = jest.fn()
const mockUpdateUser = jest.fn()
const mockSignInWithPassword = jest.fn()

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: {
    get from() {
      return mockFrom
    },
    auth: {
      admin: {
        get generateLink() {
          return mockGenerateLink
        },
        get updateUserById() {
          return mockUpdateUserById
        },
        get signOut() {
          return mockSignOut
        },
      },
      get updateUser() {
        return mockUpdateUser
      },
      get signInWithPassword() {
        return mockSignInWithPassword
      },
    },
  },
}))

jest.mock('@/lib/email/service', () => ({
  sendPasswordResetEmail: jest.fn(),
}))

jest.mock('@/lib/auth/password', () => ({
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}))

import { supabaseAdmin } from '@/lib/supabase/client'
import { sendPasswordResetEmail } from '@/lib/email/service'
import * as passwordModule from '@/lib/auth/password'

const validatePassword = passwordModule.validatePassword as jest.Mock

describe('Password Reset Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initiatePasswordReset', () => {
    test('should successfully initiate password reset for existing user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockGenerateLink = jest.fn().mockResolvedValue({ data: null, error: null })

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      })

      ;(supabaseAdmin.auth as any) = {
        admin: {
          generateLink: mockGenerateLink,
        },
      }

      const result = await initiatePasswordReset('test@example.com')

      expect(result.success).toBe(true)
      expect(result.message).toBe('If an account exists, a password reset email will be sent')
      expect(mockGenerateLink).toHaveBeenCalledWith({
        type: 'recovery',
        email: 'test@example.com',
        options: {
          redirectTo: expect.stringContaining('/auth/reset-password'),
        },
      })
    })

    test('should not reveal if email does not exist', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' }),
          }),
        }),
      })

      const result = await initiatePasswordReset('nonexistent@example.com')

      expect(result.success).toBe(true)
      expect(result.message).toBe('If an account exists, a password reset email will be sent')
    })

    test('should not reveal if email format is invalid', async () => {
      const result = await initiatePasswordReset('invalid-email')

      expect(result.success).toBe(true)
      expect(result.message).toBe('If an account exists, a password reset email will be sent')
    })

    test('should normalize email to lowercase', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
        }),
      })

      ;mockFrom.mockReturnValue({
        select: mockSelect,
      })

      ;(supabaseAdmin.auth as any) = {
        admin: {
          generateLink: jest.fn().mockResolvedValue({ data: null, error: null }),
        },
      }

      await initiatePasswordReset('Test@EXAMPLE.COM')

      const eqCall = mockSelect().eq
      expect(eqCall).toHaveBeenCalledWith('email', 'test@example.com')
    })

    test('should handle database errors gracefully', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
          }),
        }),
      })

      ;(supabaseAdmin.auth as any) = {
        admin: {
          generateLink: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        },
      }

      const result = await initiatePasswordReset('test@example.com')

      expect(result.success).toBe(true)
      expect(result.message).toBe('If an account exists, a password reset email will be sent')
    })

    test('should handle unexpected errors gracefully', async () => {
      ;mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await initiatePasswordReset('test@example.com')

      expect(result.success).toBe(true)
      expect(result.message).toBe('If an account exists, a password reset email will be sent')
    })

    test('should validate email with correct regex', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
      ]

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test@.com',
        'test @example.com',
      ]

      for (const email of validEmails) {
        ;mockFrom.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        })

        const result = await initiatePasswordReset(email)
        expect(result.success).toBe(true)
      }

      for (const email of invalidEmails) {
        const result = await initiatePasswordReset(email)
        expect(result.success).toBe(true)
        expect(result.message).toBe('If an account exists, a password reset email will be sent')
      }
    })
  })

  describe('resetPasswordWithToken', () => {
    beforeEach(() => {
      ;validatePassword.mockReturnValue({ isValid: true, errors: [] })
    })

    test('should successfully reset password with valid token', async () => {
      const mockUpdateUser = jest.fn().mockResolvedValue({ data: null, error: null })

      ;(supabaseAdmin.auth as any) = {
        updateUser: mockUpdateUser,
      }

      const result = await resetPasswordWithToken('valid-token', 'NewPassword123!')

      expect(result.success).toBe(true)
      expect(result.message).toBe('Password reset successfully')
      expect(validatePassword).toHaveBeenCalledWith('NewPassword123!')
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewPassword123!' })
    })

    test('should reject invalid password', async () => {
      ;validatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password too short', 'Password must contain uppercase'],
      })

      const result = await resetPasswordWithToken('token', 'weak')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid password')
      expect(result.error).toBe('Password too short, Password must contain uppercase')
    })

    test('should handle Supabase errors during password update', async () => {
      const mockUpdateUser = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' },
      })

      ;(supabaseAdmin.auth as any) = {
        updateUser: mockUpdateUser,
      }

      const result = await resetPasswordWithToken('invalid-token', 'NewPassword123!')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to reset password')
      expect(result.error).toBe('Invalid token')
    })

    test('should handle unexpected errors during reset', async () => {
      ;(supabaseAdmin.auth as any) = {
        updateUser: jest.fn().mockRejectedValue(new Error('Unexpected error')),
      }

      const result = await resetPasswordWithToken('token', 'NewPassword123!')

      expect(result.success).toBe(false)
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.error).toBe('Unexpected error')
    })

    test('should handle non-Error exceptions', async () => {
      ;(supabaseAdmin.auth as any) = {
        updateUser: jest.fn().mockRejectedValue('String error'),
      }

      const result = await resetPasswordWithToken('token', 'NewPassword123!')

      expect(result.success).toBe(false)
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.error).toBe('Unknown error')
    })

    test('should validate password before attempting update', async () => {
      ;validatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password validation failed'],
      })

      const mockUpdateUser = jest.fn()

      ;(supabaseAdmin.auth as any) = {
        updateUser: mockUpdateUser,
      }

      await resetPasswordWithToken('token', 'invalid')

      expect(validatePassword).toHaveBeenCalledWith('invalid')
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })
  })

  describe('changePassword', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }

    beforeEach(() => {
      ;validatePassword.mockReturnValue({ isValid: true, errors: [] })
    })

    test('should successfully change password with valid credentials', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      })

      const mockSignIn = jest.fn().mockResolvedValue({ data: {}, error: null })
      const mockUpdateUserById = jest.fn().mockResolvedValue({ data: null, error: null })

      ;(supabaseAdmin.auth as any) = {
        signInWithPassword: mockSignIn,
        admin: {
          updateUserById: mockUpdateUserById,
        },
      }

      const result = await changePassword('user-123', 'OldPassword123!', 'NewPassword123!')

      expect(result.success).toBe(true)
      expect(result.message).toBe('Password changed successfully')
      expect(validatePassword).toHaveBeenCalledWith('NewPassword123!')
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'OldPassword123!',
      })
      expect(mockUpdateUserById).toHaveBeenCalledWith('user-123', {
        password: 'NewPassword123!',
      })
    })

    test('should reject invalid new password', async () => {
      ;validatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password too weak'],
      })

      const result = await changePassword('user-123', 'OldPassword123!', 'weak')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid password')
      expect(result.error).toBe('Password too weak')
    })

    test('should reject when user not found', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' }),
          }),
        }),
      })

      const result = await changePassword('non-existent', 'OldPassword123!', 'NewPassword123!')

      expect(result.success).toBe(false)
      expect(result.message).toBe('User not found')
    })

    test('should reject incorrect current password', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      })

      const mockSignIn = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      ;(supabaseAdmin.auth as any) = {
        signInWithPassword: mockSignIn,
      }

      const result = await changePassword('user-123', 'WrongPassword!', 'NewPassword123!')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Current password is incorrect')
    })

    test('should handle errors during password update', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      })

      const mockSignIn = jest.fn().mockResolvedValue({ data: {}, error: null })
      const mockUpdateUserById = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      })

      ;(supabaseAdmin.auth as any) = {
        signInWithPassword: mockSignIn,
        admin: {
          updateUserById: mockUpdateUserById,
        },
      }

      const result = await changePassword('user-123', 'OldPassword123!', 'NewPassword123!')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to change password')
      expect(result.error).toBe('Update failed')
    })

    test('should handle unexpected errors during change', async () => {
      ;mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await changePassword('user-123', 'OldPassword123!', 'NewPassword123!')

      expect(result.success).toBe(false)
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.error).toBe('Unexpected error')
    })

    test('should handle non-Error exceptions', async () => {
      ;mockFrom.mockImplementation(() => {
        throw 'String error'
      })

      const result = await changePassword('user-123', 'OldPassword123!', 'NewPassword123!')

      expect(result.success).toBe(false)
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.error).toBe('Unknown error')
    })

    test('should validate new password before verifying current password', async () => {
      ;validatePassword.mockReturnValue({
        isValid: false,
        errors: ['Invalid password'],
      })

      const mockSignIn = jest.fn()

      ;(supabaseAdmin.auth as any) = {
        signInWithPassword: mockSignIn,
      }

      await changePassword('user-123', 'OldPassword123!', 'weak')

      expect(validatePassword).toHaveBeenCalledWith('weak')
      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })
})
