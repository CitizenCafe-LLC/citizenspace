/**
 * Unit Tests for Session Management
 * Tests session creation, validation, refresh, and revocation
 */

import {
  createSession,
  refreshSession,
  validateSession,
  updateNftHolderStatus,
} from '@/lib/auth/session'
import { createTokenPair, TokenPayload } from '@/lib/auth/jwt'
import { supabaseAdmin } from '@/lib/supabase/client'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    auth: {
      admin: {
        signOut: jest.fn(),
      },
    },
  },
}))

describe('Session Management', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+1234567890',
    wallet_address: '0x1234567890123456789012345678901234567890',
    nft_holder: false,
    role: 'user' as const,
    avatar_url: null,
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createSession', () => {
    it('should create session from valid tokens', async () => {
      const mockPayload: TokenPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        nftHolder: mockUser.nft_holder,
      }

      const tokens = await createTokenPair(mockPayload)

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      })

      const session = await createSession(mockUser.id, tokens)

      expect(session).toBeDefined()
      expect(session.user.id).toBe(mockUser.id)
      expect(session.user.email).toBe(mockUser.email)
      expect(session.user.nftHolder).toBe(mockUser.nft_holder)
      expect(session.accessToken).toBe(tokens.accessToken)
      expect(session.refreshToken).toBe(tokens.refreshToken)
      expect(session.expiresAt).toBeGreaterThan(Date.now())
    })

    it('should include NFT holder status in session', async () => {
      const nftUser = { ...mockUser, nft_holder: true }
      const mockPayload: TokenPayload = {
        userId: nftUser.id,
        email: nftUser.email,
        role: nftUser.role,
        nftHolder: true,
      }

      const tokens = await createTokenPair(mockPayload)

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: nftUser,
              error: null,
            }),
          }),
        }),
      })

      const session = await createSession(nftUser.id, tokens)

      expect(session.user.nftHolder).toBe(true)
    })

    it('should throw error for non-existent user', async () => {
      const mockPayload: TokenPayload = {
        userId: 'non-existent',
        email: 'test@example.com',
        role: 'user',
      }

      const tokens = await createTokenPair(mockPayload)

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' },
            }),
          }),
        }),
      })

      await expect(createSession('non-existent', tokens)).rejects.toThrow()
    })
  })

  describe('validateSession', () => {
    it('should validate valid access token', async () => {
      const mockPayload: TokenPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      }

      const tokens = await createTokenPair(mockPayload)
      const result = await validateSession(tokens.accessToken)

      expect(result.valid).toBe(true)
      expect(result.payload).toBeDefined()
      expect(result.payload?.userId).toBe(mockUser.id)
    })

    it('should reject invalid token', async () => {
      const result = await validateSession('invalid-token')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('refreshSession', () => {
    it('should refresh session with valid refresh token', async () => {
      const mockPayload: TokenPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        nftHolder: mockUser.nft_holder,
      }

      const tokens = await createTokenPair(mockPayload)

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      })

      const result = await refreshSession(tokens.refreshToken)

      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.session?.user.id).toBe(mockUser.id)
      expect(result.session?.accessToken).not.toBe(tokens.accessToken) // New token generated
    })

    it('should fail with invalid refresh token', async () => {
      const result = await refreshSession('invalid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should update NFT holder status on refresh', async () => {
      const updatedUser = { ...mockUser, nft_holder: true }
      const mockPayload: TokenPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        nftHolder: false,
      }

      const tokens = await createTokenPair(mockPayload)

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: updatedUser,
              error: null,
            }),
          }),
        }),
      })

      const result = await refreshSession(tokens.refreshToken)

      expect(result.success).toBe(true)
      expect(result.session?.user.nftHolder).toBe(true)
    })
  })

  describe('updateNftHolderStatus', () => {
    it('should update NFT holder status and generate new tokens', async () => {
      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...mockUser, nft_holder: true },
                error: null,
              }),
            }),
          }),
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockUser, nft_holder: true },
              error: null,
            }),
          }),
        }),
      })

      const result = await updateNftHolderStatus(mockUser.id, true)

      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.session?.user.nftHolder).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      })

      const result = await updateNftHolderStatus(mockUser.id, true)

      expect(result.success).toBe(false)
    })
  })
})
