/**
 * Authentication Service Tests
 * Comprehensive tests for authentication service with mocked dependencies
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import {
  AuthenticationError,
  registerUser,
  loginUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  initiatePasswordReset,
  resetPassword,
} from '@/lib/auth/service'

// Mock dependencies
const mockExecuteQuery = jest.fn()
const mockExecuteQuerySingle = jest.fn()
const mockValidatePassword = jest.fn()
const mockHashPassword = jest.fn()
const mockComparePassword = jest.fn()
const mockGenerateResetToken = jest.fn()
const mockCreateTokenPair = jest.fn()
const mockVerifyToken = jest.fn()

jest.mock('@/lib/db/postgres', () => ({
  executeQuery: mockExecuteQuery,
  executeQuerySingle: mockExecuteQuerySingle,
}))

jest.mock('@/lib/auth/password', () => ({
  validatePassword: mockValidatePassword,
  hashPassword: mockHashPassword,
  comparePassword: mockComparePassword,
  generateResetToken: mockGenerateResetToken,
}))

jest.mock('@/lib/auth/jwt', () => ({
  createTokenPair: mockCreateTokenPair,
  verifyToken: mockVerifyToken,
}))

describe('Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AuthenticationError', () => {
    test('should create error with correct properties', () => {
      const error = new AuthenticationError('TEST_CODE', 'Test message', 400)

      expect(error.code).toBe('TEST_CODE')
      expect(error.message).toBe('Test message')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('AuthenticationError')
    })

    test('should default statusCode to 400', () => {
      const error = new AuthenticationError('TEST_CODE', 'Test message')
      expect(error.statusCode).toBe(400)
    })

    test('should inherit from Error', () => {
      const error = new AuthenticationError('TEST_CODE', 'Test message')
      expect(error instanceof Error).toBe(true)
    })

    test('should have correct name', () => {
      const error = new AuthenticationError('CODE', 'Message')
      expect(error.name).toBe('AuthenticationError')
    })

    test('should handle different status codes', () => {
      const codes = [400, 401, 403, 404, 409, 500]
      codes.forEach(code => {
        const error = new AuthenticationError('TEST', 'message', code)
        expect(error.statusCode).toBe(code)
      })
    })
  })

  describe('registerUser', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'ValidPass123!',
      fullName: 'Test User',
      phone: '+1234567890',
    }

    const mockDbUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      full_name: 'Test User',
      phone: '+1234567890',
      wallet_address: null,
      nft_holder: false,
      role: 'user' as const,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }

    beforeEach(() => {
      mockValidatePassword.mockReturnValue({ isValid: true, errors: [] })
      mockHashPassword.mockResolvedValue('hashed-password')
      mockCreateTokenPair.mockResolvedValue(mockTokens)
    })

    test('should successfully register a new user', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({ data: null, error: null }) // No existing user
        .mockResolvedValueOnce({ data: mockDbUser, error: null }) // Insert user

      const result = await registerUser(validInput)

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
          phone: '+1234567890',
          walletAddress: null,
          nftHolder: false,
          role: 'user',
          avatarUrl: null,
          createdAt: '2024-01-01T00:00:00Z',
        },
        tokens: mockTokens,
      })

      expect(mockHashPassword).toHaveBeenCalledWith('ValidPass123!')
      expect(mockCreateTokenPair).toHaveBeenCalledWith({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        nftHolder: false,
        walletAddress: null,
      })
    })

    test('should reject invalid email format', async () => {
      await expect(
        registerUser({ ...validInput, email: 'invalid-email' })
      ).rejects.toThrow(AuthenticationError)

      await expect(
        registerUser({ ...validInput, email: 'invalid-email' })
      ).rejects.toMatchObject({
        code: 'INVALID_EMAIL',
        statusCode: 400,
      })
    })

    test('should reject invalid password', async () => {
      mockValidatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password too short'],
      })

      await expect(registerUser(validInput)).rejects.toThrow(AuthenticationError)
      await expect(registerUser(validInput)).rejects.toMatchObject({
        code: 'INVALID_PASSWORD',
        message: 'Password too short',
        statusCode: 400,
      })
    })

    test('should reject duplicate email', async () => {
      mockExecuteQuerySingle.mockResolvedValueOnce({
        data: { id: 'existing-user' },
        error: null,
      })

      await expect(registerUser(validInput)).rejects.toThrow(AuthenticationError)
      await expect(registerUser(validInput)).rejects.toMatchObject({
        code: 'EMAIL_EXISTS',
        statusCode: 409,
      })
    })

    test('should handle database errors during registration', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({ data: null, error: null }) // No existing user
        .mockResolvedValueOnce({ data: null, error: 'Database error' }) // Insert fails

      await expect(registerUser(validInput)).rejects.toThrow(AuthenticationError)
      await expect(registerUser(validInput)).rejects.toMatchObject({
        code: 'REGISTRATION_FAILED',
        statusCode: 500,
      })
    })

    test('should normalize email to lowercase', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: mockDbUser, error: null })

      await registerUser({ ...validInput, email: 'Test@EXAMPLE.COM' })

      const checkCall = mockExecuteQuerySingle.mock.calls[0]
      expect(checkCall[1][0]).toBe('test@example.com')
    })

    test('should handle registration without optional fields', async () => {
      mockExecuteQuerySingle
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: { ...mockDbUser, full_name: null, phone: null }, error: null })

      const result = await registerUser({
        email: 'test@example.com',
        password: 'ValidPass123!',
      })

      expect(result.user.fullName).toBeNull()
      expect(result.user.phone).toBeNull()
    })

    test('should handle unexpected errors during registration', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Unexpected error'))

      await expect(registerUser(validInput)).rejects.toThrow(AuthenticationError)
      await expect(registerUser(validInput)).rejects.toMatchObject({
        code: 'REGISTRATION_FAILED',
        message: 'An unexpected error occurred during registration',
        statusCode: 500,
      })
    })
  })

  describe('loginUser', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'ValidPass123!',
    }

    const mockDbUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      full_name: 'Test User',
      phone: '+1234567890',
      wallet_address: null,
      nft_holder: false,
      role: 'user' as const,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }

    beforeEach(() => {
      mockCreateTokenPair.mockResolvedValue(mockTokens)
    })

    test('should successfully login user with valid credentials', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })
      mockComparePassword.mockResolvedValue(true)

      const result = await loginUser(validInput)

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
          phone: '+1234567890',
          walletAddress: null,
          nftHolder: false,
          role: 'user',
          avatarUrl: null,
          createdAt: '2024-01-01T00:00:00Z',
        },
        tokens: mockTokens,
      })

      expect(mockComparePassword).toHaveBeenCalledWith('ValidPass123!', 'hashed-password')
    })

    test('should reject invalid email format', async () => {
      await expect(
        loginUser({ email: 'invalid-email', password: 'password' })
      ).rejects.toThrow(AuthenticationError)

      await expect(
        loginUser({ email: 'invalid-email', password: 'password' })
      ).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      })
    })

    test('should reject non-existent user', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })

      await expect(loginUser(validInput)).rejects.toThrow(AuthenticationError)
      await expect(loginUser(validInput)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      })
    })

    test('should reject incorrect password', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })
      mockComparePassword.mockResolvedValue(false)

      await expect(loginUser(validInput)).rejects.toThrow(AuthenticationError)
      await expect(loginUser(validInput)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      })
    })

    test('should handle database errors during login', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: 'Database error' })

      await expect(loginUser(validInput)).rejects.toThrow(AuthenticationError)
      await expect(loginUser(validInput)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      })
    })

    test('should normalize email to lowercase', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })
      mockComparePassword.mockResolvedValue(true)

      await loginUser({ email: 'Test@EXAMPLE.COM', password: 'ValidPass123!' })

      const call = mockExecuteQuerySingle.mock.calls[0]
      expect(call[1][0]).toBe('test@example.com')
    })

    test('should handle unexpected errors during login', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Unexpected error'))

      await expect(loginUser(validInput)).rejects.toThrow(AuthenticationError)
      await expect(loginUser(validInput)).rejects.toMatchObject({
        code: 'LOGIN_FAILED',
        statusCode: 500,
      })
    })

    test('should include NFT holder status in tokens', async () => {
      const nftUser = { ...mockDbUser, nft_holder: true, wallet_address: '0x123' }
      mockExecuteQuerySingle.mockResolvedValue({ data: nftUser, error: null })
      mockComparePassword.mockResolvedValue(true)

      await loginUser(validInput)

      expect(mockCreateTokenPair).toHaveBeenCalledWith({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        nftHolder: true,
        walletAddress: '0x123',
      })
    })
  })

  describe('getUserById', () => {
    const mockDbUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      full_name: 'Test User',
      phone: '+1234567890',
      wallet_address: null,
      nft_holder: false,
      role: 'user' as const,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    test('should successfully get user by ID', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })

      const result = await getUserById('user-123')

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+1234567890',
        walletAddress: null,
        nftHolder: false,
        role: 'user',
        avatarUrl: null,
        createdAt: '2024-01-01T00:00:00Z',
      })
    })

    test('should throw error when user not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })

      await expect(getUserById('non-existent')).rejects.toThrow(AuthenticationError)
      await expect(getUserById('non-existent')).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        statusCode: 404,
      })
    })

    test('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: 'Database error' })

      await expect(getUserById('user-123')).rejects.toThrow(AuthenticationError)
    })
  })

  describe('getUserByEmail', () => {
    const mockDbUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      full_name: 'Test User',
      phone: '+1234567890',
      wallet_address: null,
      nft_holder: false,
      role: 'user' as const,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    test('should successfully get user by email', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })

      const result = await getUserByEmail('test@example.com')

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+1234567890',
        walletAddress: null,
        nftHolder: false,
        role: 'user',
        avatarUrl: null,
        createdAt: '2024-01-01T00:00:00Z',
      })
    })

    test('should return null when user not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })

      const result = await getUserByEmail('nonexistent@example.com')
      expect(result).toBeNull()
    })

    test('should normalize email to lowercase', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })

      await getUserByEmail('Test@EXAMPLE.COM')

      const call = mockExecuteQuerySingle.mock.calls[0]
      expect(call[1][0]).toBe('test@example.com')
    })

    test('should return null on database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: 'Database error' })

      const result = await getUserByEmail('test@example.com')
      expect(result).toBeNull()
    })
  })

  describe('updateUserProfile', () => {
    const mockDbUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      full_name: 'Updated Name',
      phone: '+9876543210',
      wallet_address: null,
      nft_holder: false,
      role: 'user' as const,
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    test('should successfully update user profile with all fields', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })

      const result = await updateUserProfile('user-123', {
        fullName: 'Updated Name',
        phone: '+9876543210',
        avatarUrl: 'https://example.com/avatar.jpg',
      })

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Updated Name',
        phone: '+9876543210',
        walletAddress: null,
        nftHolder: false,
        role: 'user',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: '2024-01-01T00:00:00Z',
      })
    })

    test('should update only fullName', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })

      await updateUserProfile('user-123', { fullName: 'Updated Name' })

      const call = mockExecuteQuerySingle.mock.calls[0]
      const query = call[0]
      expect(query).toContain('full_name = $1')
      expect(query).toContain('updated_at = NOW()')
    })

    test('should update only phone', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })

      await updateUserProfile('user-123', { phone: '+9876543210' })

      const call = mockExecuteQuerySingle.mock.calls[0]
      const query = call[0]
      expect(query).toContain('phone = $1')
    })

    test('should update only avatarUrl', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: mockDbUser, error: null })

      await updateUserProfile('user-123', { avatarUrl: 'https://example.com/avatar.jpg' })

      const call = mockExecuteQuerySingle.mock.calls[0]
      const query = call[0]
      expect(query).toContain('avatar_url = $1')
    })

    test('should throw error when no fields to update', async () => {
      await expect(updateUserProfile('user-123', {})).rejects.toThrow(AuthenticationError)
      await expect(updateUserProfile('user-123', {})).rejects.toMatchObject({
        code: 'NO_UPDATES',
        statusCode: 400,
      })
    })

    test('should handle database errors during update', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: 'Database error' })

      await expect(
        updateUserProfile('user-123', { fullName: 'Updated Name' })
      ).rejects.toThrow(AuthenticationError)
      await expect(
        updateUserProfile('user-123', { fullName: 'Updated Name' })
      ).rejects.toMatchObject({
        code: 'UPDATE_FAILED',
        statusCode: 500,
      })
    })
  })

  describe('initiatePasswordReset', () => {
    beforeEach(() => {
      mockGenerateResetToken.mockReturnValue('reset-token-123')
      mockExecuteQuery.mockResolvedValue({ data: null, error: null })
    })

    test('should successfully initiate password reset for existing user', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: { id: 'user-123' }, error: null })

      const result = await initiatePasswordReset('test@example.com')

      expect(result.message).toBe('If an account exists, a password reset email will be sent')
      expect(result.token).toBe('reset-token-123')
      expect(result.userId).toBe('user-123')
      expect(mockGenerateResetToken).toHaveBeenCalled()
    })

    test('should not reveal if email does not exist', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })

      const result = await initiatePasswordReset('nonexistent@example.com')

      expect(result.message).toBe('If an account exists, a password reset email will be sent')
      expect(result.token).toBeUndefined()
      expect(result.userId).toBeUndefined()
    })

    test('should not reveal if email format is invalid', async () => {
      const result = await initiatePasswordReset('invalid-email')

      expect(result.message).toBe('If an account exists, a password reset email will be sent')
      expect(result.token).toBeUndefined()
      expect(mockExecuteQuerySingle).not.toHaveBeenCalled()
    })

    test('should delete existing reset tokens before creating new one', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: { id: 'user-123' }, error: null })

      await initiatePasswordReset('test@example.com')

      const calls = mockExecuteQuery.mock.calls
      expect(calls[0][0]).toContain('DELETE FROM password_reset_tokens')
    })

    test('should handle database errors gracefully', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: { id: 'user-123' }, error: null })
      mockExecuteQuery
        .mockResolvedValueOnce({ data: null, error: null }) // Delete succeeds
        .mockResolvedValueOnce({ data: null, error: 'Database error' }) // Insert fails

      const result = await initiatePasswordReset('test@example.com')

      expect(result.message).toBe('If an account exists, a password reset email will be sent')
      expect(result.token).toBeUndefined()
    })

    test('should normalize email to lowercase', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: { id: 'user-123' }, error: null })

      await initiatePasswordReset('Test@EXAMPLE.COM')

      const call = mockExecuteQuerySingle.mock.calls[0]
      expect(call[1][0]).toBe('test@example.com')
    })

    test('should handle unexpected errors gracefully', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Unexpected error'))

      const result = await initiatePasswordReset('test@example.com')

      expect(result.message).toBe('If an account exists, a password reset email will be sent')
      expect(result.token).toBeUndefined()
    })
  })

  describe('resetPassword', () => {
    beforeEach(() => {
      mockValidatePassword.mockReturnValue({ isValid: true, errors: [] })
      mockHashPassword.mockResolvedValue('new-hashed-password')
      mockExecuteQuery.mockResolvedValue({ data: null, error: null })
    })

    test('should successfully reset password with valid token', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      mockExecuteQuerySingle.mockResolvedValue({
        data: { user_id: 'user-123', expires_at: futureDate },
        error: null,
      })

      const result = await resetPassword('valid-token', 'NewPassword123!')

      expect(result.message).toBe('Password reset successfully')
      expect(mockHashPassword).toHaveBeenCalledWith('NewPassword123!')

      const calls = mockExecuteQuery.mock.calls
      expect(calls[0][0]).toContain('UPDATE users')
      expect(calls[1][0]).toContain('DELETE FROM password_reset_tokens')
    })

    test('should reject invalid password', async () => {
      mockValidatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password too weak'],
      })

      await expect(resetPassword('token', 'weak')).rejects.toThrow(AuthenticationError)
      await expect(resetPassword('token', 'weak')).rejects.toMatchObject({
        code: 'INVALID_PASSWORD',
        statusCode: 400,
      })
    })

    test('should reject invalid token', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })

      await expect(resetPassword('invalid-token', 'NewPassword123!')).rejects.toThrow(AuthenticationError)
      await expect(resetPassword('invalid-token', 'NewPassword123!')).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        statusCode: 400,
      })
    })

    test('should reject expired token', async () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString()
      mockExecuteQuerySingle.mockResolvedValue({
        data: { user_id: 'user-123', expires_at: pastDate },
        error: null,
      })

      await expect(resetPassword('expired-token', 'NewPassword123!')).rejects.toThrow(AuthenticationError)
      await expect(resetPassword('expired-token', 'NewPassword123!')).rejects.toMatchObject({
        code: 'EXPIRED_TOKEN',
        statusCode: 400,
      })

      // Should delete expired token
      const deleteCall = mockExecuteQuery.mock.calls[0]
      expect(deleteCall[0]).toContain('DELETE FROM password_reset_tokens')
    })

    test('should handle database errors during password update', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      mockExecuteQuerySingle.mockResolvedValue({
        data: { user_id: 'user-123', expires_at: futureDate },
        error: null,
      })
      mockExecuteQuery.mockResolvedValueOnce({ data: null, error: 'Database error' })

      await expect(resetPassword('valid-token', 'NewPassword123!')).rejects.toThrow(AuthenticationError)
      await expect(resetPassword('valid-token', 'NewPassword123!')).rejects.toMatchObject({
        code: 'RESET_FAILED',
        statusCode: 500,
      })
    })

    test('should delete token after successful password reset', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString()
      mockExecuteQuerySingle.mockResolvedValue({
        data: { user_id: 'user-123', expires_at: futureDate },
        error: null,
      })

      await resetPassword('valid-token', 'NewPassword123!')

      const calls = mockExecuteQuery.mock.calls
      const deleteCall = calls.find(call => call[0].includes('DELETE FROM password_reset_tokens'))
      expect(deleteCall).toBeDefined()
      expect(deleteCall[1][0]).toBe('valid-token')
    })

    test('should handle unexpected errors during reset', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Unexpected error'))

      await expect(resetPassword('token', 'NewPassword123!')).rejects.toThrow(AuthenticationError)
      await expect(resetPassword('token', 'NewPassword123!')).rejects.toMatchObject({
        code: 'RESET_FAILED',
        statusCode: 500,
      })
    })
  })
})
