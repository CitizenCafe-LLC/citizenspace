/**
 * Session Management Tests
 * Comprehensive tests for session creation, validation, and refresh
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import {
  createSession,
  refreshSession,
  validateSession,
  revokeSessions,
  getSessionFromRequest,
  updateNftHolderStatus,
} from '@/lib/auth/session'
import type { TokenPair } from '@/lib/auth/jwt'

// Create mocks that can be modified in tests
const mockFrom = jest.fn()
const mockSignOut = jest.fn()

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: {
    get from() {
      return mockFrom
    },
    auth: {
      admin: {
        get signOut() {
          return mockSignOut
        },
      },
    },
  },
}))

jest.mock('@/lib/auth/jwt', () => ({
  verifyToken: jest.fn(),
  createTokenPair: jest.fn(),
}))

jest.mock('@/lib/auth/service', () => ({
  AuthenticationError: class AuthenticationError extends Error {
    constructor(public code: string, message: string, public statusCode: number = 400) {
      super(message)
      this.name = 'AuthenticationError'
    }
  },
}))

import { supabaseAdmin } from '@/lib/supabase/client'
import * as jwtModule from '@/lib/auth/jwt'
import { AuthenticationError } from '@/lib/auth/service'

// Type-safe access to mocked functions
const jwt = {
  verifyToken: jwtModule.verifyToken as jest.Mock,
  createTokenPair: jwtModule.createTokenPair as jest.Mock,
}

describe('Session Management', () => {
  const mockTokens: TokenPair = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }

  const mockTokenPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user' as const,
    nftHolder: false,
    walletAddress: null,
  }

  const mockDbUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+1234567890',
    wallet_address: null,
    nft_holder: false,
    role: 'user' as const,
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFrom.mockClear()
    mockSignOut.mockClear()
  })

  describe('createSession', () => {
    test('should successfully create session with tokens', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockDbUser, error: null }),
          }),
        }),
      })

      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const session = await createSession('user-123', mockTokens)

      expect(session).toEqual({
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
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: expect.any(Number),
      })

      expect(jwt.verifyToken).toHaveBeenCalledWith('access-token')
    })

    test('should throw error when user not found', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' }),
          }),
        }),
      })

      await expect(createSession('non-existent', mockTokens)).rejects.toThrow(AuthenticationError)
      await expect(createSession('non-existent', mockTokens)).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        statusCode: 404,
      })
    })

    test('should handle database errors', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
          }),
        }),
      })

      await expect(createSession('user-123', mockTokens)).rejects.toThrow(AuthenticationError)
    })

    test('should set correct expiry time', async () => {
      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockDbUser, error: null }),
          }),
        }),
      })

      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const beforeTime = Date.now() + 15 * 60 * 1000
      const session = await createSession('user-123', mockTokens)
      const afterTime = Date.now() + 15 * 60 * 1000

      expect(session.expiresAt).toBeGreaterThanOrEqual(beforeTime - 1000)
      expect(session.expiresAt).toBeLessThanOrEqual(afterTime + 1000)
    })

    test('should include NFT holder status in session', async () => {
      const nftUser = { ...mockDbUser, nft_holder: true, wallet_address: '0x123' }

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: nftUser, error: null }),
          }),
        }),
      })

      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const session = await createSession('user-123', mockTokens)

      expect(session.user.nftHolder).toBe(true)
      expect(session.user.walletAddress).toBe('0x123')
    })
  })

  describe('refreshSession', () => {
    test('should successfully refresh session with valid refresh token', async () => {
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockDbUser, error: null }),
          }),
        }),
      })

      ;jwt.createTokenPair.mockResolvedValue(mockTokens)

      const result = await refreshSession('valid-refresh-token')

      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.session?.user.id).toBe('user-123')
      expect(jwt.verifyToken).toHaveBeenCalledWith('valid-refresh-token')
      expect(jwt.createTokenPair).toHaveBeenCalledWith({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        nftHolder: false,
        walletAddress: null,
      })
    })

    test('should fail with invalid refresh token', async () => {
      ;jwt.verifyToken.mockRejectedValue(new Error('Invalid token'))

      const result = await refreshSession('invalid-token')

      expect(result.success).toBe(false)
      expect(result.session).toBeUndefined()
      expect(result.error).toBe('Invalid token')
    })

    test('should fail when user not found during refresh', async () => {
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' }),
          }),
        }),
      })

      const result = await refreshSession('valid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    test('should fetch latest user data during refresh', async () => {
      const updatedUser = {
        ...mockDbUser,
        full_name: 'Updated Name',
        nft_holder: true,
        wallet_address: '0x123',
      }

      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: updatedUser, error: null }),
          }),
        }),
      })

      ;jwt.createTokenPair.mockResolvedValue(mockTokens)

      const result = await refreshSession('refresh-token')

      expect(result.success).toBe(true)
      expect(result.session?.user.fullName).toBe('Updated Name')
      expect(result.session?.user.nftHolder).toBe(true)
      expect(result.session?.user.walletAddress).toBe('0x123')
    })

    test('should handle non-Error exceptions', async () => {
      ;jwt.verifyToken.mockRejectedValue('String error')

      const result = await refreshSession('token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Token refresh failed')
    })
  })

  describe('validateSession', () => {
    test('should validate valid access token', async () => {
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const result = await validateSession('valid-access-token')

      expect(result.valid).toBe(true)
      expect(result.payload).toEqual(mockTokenPayload)
      expect(result.error).toBeUndefined()
    })

    test('should invalidate invalid access token', async () => {
      ;jwt.verifyToken.mockRejectedValue(new Error('Token expired'))

      const result = await validateSession('expired-token')

      expect(result.valid).toBe(false)
      expect(result.payload).toBeUndefined()
      expect(result.error).toBe('Token expired')
    })

    test('should handle non-Error exceptions during validation', async () => {
      ;jwt.verifyToken.mockRejectedValue('String error')

      const result = await validateSession('token')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid session')
    })

    test('should validate token with all user roles', async () => {
      const roles: Array<'user' | 'staff' | 'admin'> = ['user', 'staff', 'admin']

      for (const role of roles) {
        const payload = { ...mockTokenPayload, role }
        ;jwt.verifyToken.mockResolvedValue(payload)

        const result = await validateSession('token')

        expect(result.valid).toBe(true)
        expect(result.payload?.role).toBe(role)
      }
    })
  })

  describe('revokeSessions', () => {
    test('should successfully revoke user sessions', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({ error: null })

      ;(supabaseAdmin.auth as any) = {
        admin: {
          signOut: mockSignOut,
        },
      }

      const result = await revokeSessions('user-123')

      expect(result).toBe(true)
      expect(mockSignOut).toHaveBeenCalledWith('user-123')
    })

    test('should handle errors during session revocation', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({
        error: new Error('Revocation failed'),
      })

      ;(supabaseAdmin.auth as any) = {
        admin: {
          signOut: mockSignOut,
        },
      }

      const result = await revokeSessions('user-123')

      expect(result).toBe(false)
    })

    test('should handle unexpected errors during revocation', async () => {
      ;(supabaseAdmin.auth as any) = {
        admin: {
          signOut: jest.fn().mockRejectedValue(new Error('Unexpected error')),
        },
      }

      const result = await revokeSessions('user-123')

      expect(result).toBe(false)
    })
  })

  describe('getSessionFromRequest', () => {
    test('should get session from valid Authorization header', async () => {
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockDbUser, error: null }),
          }),
        }),
      })

      const result = await getSessionFromRequest('Bearer valid-token')

      expect(result.session).toBeDefined()
      expect(result.session?.user.id).toBe('user-123')
      expect(result.session?.accessToken).toBe('valid-token')
      expect(result.error).toBeUndefined()
    })

    test('should fail with missing Authorization header', async () => {
      const result = await getSessionFromRequest(null)

      expect(result.session).toBeNull()
      expect(result.error).toBe('No authorization header')
    })

    test('should fail with invalid Authorization header format', async () => {
      const result = await getSessionFromRequest('InvalidFormat token')

      expect(result.session).toBeNull()
      expect(result.error).toBe('No authorization header')
    })

    test('should fail with missing Bearer prefix', async () => {
      const result = await getSessionFromRequest('token-without-bearer')

      expect(result.session).toBeNull()
      expect(result.error).toBe('No authorization header')
    })

    test('should fail with invalid token', async () => {
      ;jwt.verifyToken.mockRejectedValue(new Error('Invalid token'))

      const result = await getSessionFromRequest('Bearer invalid-token')

      expect(result.session).toBeNull()
      expect(result.error).toBe('Invalid token')
    })

    test('should fail when user not found', async () => {
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' }),
          }),
        }),
      })

      const result = await getSessionFromRequest('Bearer valid-token')

      expect(result.session).toBeNull()
      expect(result.error).toBe('User not found')
    })

    test('should extract token correctly from Bearer format', async () => {
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockDbUser, error: null }),
          }),
        }),
      })

      await getSessionFromRequest('Bearer test-token-123')

      expect(jwt.verifyToken).toHaveBeenCalledWith('test-token-123')
    })

    test('should set empty refreshToken in session from request', async () => {
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      ;mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockDbUser, error: null }),
          }),
        }),
      })

      const result = await getSessionFromRequest('Bearer valid-token')

      expect(result.session?.refreshToken).toBe('')
    })
  })

  describe('updateNftHolderStatus', () => {
    test('should successfully update NFT holder status to true', async () => {
      const updatedUser = { ...mockDbUser, nft_holder: true, wallet_address: '0x123' }

      ;mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedUser, error: null }),
            }),
          }),
        }),
      })

      ;jwt.createTokenPair.mockResolvedValue(mockTokens)
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const result = await updateNftHolderStatus('user-123', true)

      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.session?.user.nftHolder).toBe(true)
    })

    test('should successfully update NFT holder status to false', async () => {
      const updatedUser = { ...mockDbUser, nft_holder: false, wallet_address: null }

      ;mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedUser, error: null }),
            }),
          }),
        }),
      })

      ;jwt.createTokenPair.mockResolvedValue(mockTokens)
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const result = await updateNftHolderStatus('user-123', false)

      expect(result.success).toBe(true)
      expect(result.session?.user.nftHolder).toBe(false)
    })

    test('should fail when user not found during update', async () => {
      ;mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' }),
            }),
          }),
        }),
      })

      const result = await updateNftHolderStatus('non-existent', true)

      expect(result.success).toBe(false)
      expect(result.session).toBeUndefined()
    })

    test('should handle database errors during update', async () => {
      ;mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
            }),
          }),
        }),
      })

      const result = await updateNftHolderStatus('user-123', true)

      expect(result.success).toBe(false)
    })

    test('should generate new tokens with updated NFT status', async () => {
      const updatedUser = { ...mockDbUser, nft_holder: true, wallet_address: '0x123' }

      ;mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedUser, error: null }),
            }),
          }),
        }),
      })

      ;jwt.createTokenPair.mockResolvedValue(mockTokens)
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      await updateNftHolderStatus('user-123', true)

      expect(jwt.createTokenPair).toHaveBeenCalledWith({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        nftHolder: true,
        walletAddress: '0x123',
      })
    })

    test('should handle unexpected errors during update', async () => {
      ;mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await updateNftHolderStatus('user-123', true)

      expect(result.success).toBe(false)
    })

    test('should update timestamp when changing NFT status', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockDbUser, error: null }),
          }),
        }),
      })

      ;mockFrom.mockReturnValue({
        update: mockUpdate,
      })

      ;jwt.createTokenPair.mockResolvedValue(mockTokens)
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      await updateNftHolderStatus('user-123', true)

      expect(mockUpdate).toHaveBeenCalledWith({
        nft_holder: true,
        updated_at: expect.any(String),
      })
    })
  })
})
