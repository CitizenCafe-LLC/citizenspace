/**
 * @jest-environment node
 *
 * Comprehensive Tests for NFT Holder Middleware
 *
 * Tests cover:
 * - NFT holder verification middleware
 * - Authenticated vs unauthenticated users
 * - NFT holders vs non-holders
 * - Optional vs required NFT checks
 * - Cache validation
 * - Higher-order function wrappers
 * - Edge cases and error handling
 * - Integration scenarios
 */

import {
  checkNftHolderStatus,
  requireNftHolder,
  checkNftHolderOptional,
  isNftVerificationCacheValid,
  withNftHolderCheck,
  withOptionalNftCheck,
  NftHolderCheckResult,
} from '@/lib/middleware/nft-holder'
import { NextRequest, NextResponse } from 'next/server'

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createRouteHandlerClient: jest.fn(),
}))

// Helper function to create mock request
function createMockRequest(
  url: string = 'http://localhost:3000/api/test',
  method: string = 'GET'
): NextRequest {
  return new NextRequest(url, { method })
}

describe('NFT Holder Middleware', () => {
  const mockUserId = 'user-123-456'
  const mockWalletAddress = '0x1234567890123456789012345678901234567890'
  const mockUserId2 = 'user-789-012'
  const mockWalletAddress2 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'

  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    const { createRouteHandlerClient } = require('@supabase/supabase-js')
    createRouteHandlerClient.mockReturnValue(mockSupabase)
  })

  describe('checkNftHolderStatus', () => {
    describe('Authenticated NFT Holder', () => {
      it('should return true for authenticated NFT holder with wallet', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result).toEqual({
          isNftHolder: true,
          userId: mockUserId,
          walletAddress: mockWalletAddress,
        })
      })

      it('should return true for NFT holder even without wallet address', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: null,
          },
          error: null,
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(true)
        expect(result.userId).toBe(mockUserId)
        expect(result.walletAddress).toBeNull()
      })
    })

    describe('Authenticated Non-NFT Holder', () => {
      it('should return false for authenticated non-NFT holder', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: false,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.userId).toBe(mockUserId)
        expect(result.walletAddress).toBe(mockWalletAddress)
      })

      it('should return false when nft_holder is null', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: null,
            wallet_address: null,
          },
          error: null,
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.userId).toBe(mockUserId)
      })

      it('should return false when nft_holder is undefined', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
      })
    })

    describe('Unauthenticated Users', () => {
      it('should return false for unauthenticated user with error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result).toEqual({
          isNftHolder: false,
          error: 'User not authenticated',
        })
      })

      it('should return false when user is null without error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBe('User not authenticated')
      })

      it('should return false when auth returns undefined user', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: undefined },
          error: null,
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBe('User not authenticated')
      })
    })

    describe('Database Errors', () => {
      it('should handle missing user data', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { message: 'User not found' },
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.userId).toBe(mockUserId)
        expect(result.error).toBe('User data not found')
      })

      it('should handle database query error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { message: 'Database connection error' },
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should handle exception during database query', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockRejectedValue(new Error('Database error'))

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBe('Failed to check NFT holder status')
      })

      it('should handle exception during auth check', async () => {
        mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth service error'))

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should handle malformed auth response', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: null,
          error: null,
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should handle malformed user data response', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          error: { message: 'No data returned' },
        })

        const result = await checkNftHolderStatus(mockSupabase)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBe('User data not found')
      })
    })

    describe('Supabase Client Creation', () => {
      it('should create Supabase client if not provided', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const result = await checkNftHolderStatus()

        expect(result.isNftHolder).toBe(true)
        expect(result.userId).toBe(mockUserId)
      })

      it('should use provided Supabase client', async () => {
        const customSupabase = {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: mockUserId2 } },
              error: null,
            }),
          },
          from: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              nft_holder: true,
              wallet_address: mockWalletAddress2,
            },
            error: null,
          }),
        }

        const result = await checkNftHolderStatus(customSupabase)

        expect(result.isNftHolder).toBe(true)
        expect(result.userId).toBe(mockUserId2)
        expect(result.walletAddress).toBe(mockWalletAddress2)
        expect(customSupabase.auth.getUser).toHaveBeenCalled()
      })
    })
  })

  describe('requireNftHolder', () => {
    let mockRequest: NextRequest

    beforeEach(() => {
      mockRequest = createMockRequest()
    })

    describe('Access Control', () => {
      it('should allow access for NFT holders', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const result = await requireNftHolder(mockRequest)

        expect('result' in result).toBe(true)
        if ('result' in result) {
          expect(result.result.isNftHolder).toBe(true)
          expect(result.result.userId).toBe(mockUserId)
          expect(result.result.walletAddress).toBe(mockWalletAddress)
        }
      })

      it('should block non-NFT holders', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: false,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const result = await requireNftHolder(mockRequest)

        expect('error' in result).toBe(true)
        if ('error' in result) {
          expect(result.error.status).toBe(403)
          const data = await result.error.json()
          expect(data.nft_holder_required).toBe(true)
          expect(data.message).toBeDefined()
        }
      })

      it('should block unauthenticated users', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })

        const result = await requireNftHolder(mockRequest)

        expect('error' in result).toBe(true)
        if ('error' in result) {
          expect(result.error.status).toBe(403)
        }
      })

      it('should block users with database errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        })

        const result = await requireNftHolder(mockRequest)

        expect('error' in result).toBe(true)
        if ('error' in result) {
          expect(result.error.status).toBe(403)
        }
      })
    })

    describe('Response Format', () => {
      it('should include error message in response for unauthenticated user', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })

        const result = await requireNftHolder(mockRequest)

        if ('error' in result) {
          const data = await result.error.json()
          expect(data.message).toContain('User not authenticated')
          expect(data.nft_holder_required).toBe(true)
        }
      })

      it('should include generic message for non-NFT holders without error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: false,
            wallet_address: null,
          },
          error: null,
        })

        const result = await requireNftHolder(mockRequest)

        if ('error' in result) {
          const data = await result.error.json()
          expect(data.message).toBe('NFT holder access required')
          expect(data.nft_holder_required).toBe(true)
        }
      })

      it('should return proper status code 403', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const result = await requireNftHolder(mockRequest)

        if ('error' in result) {
          expect(result.error.status).toBe(403)
        }
      })
    })

    describe('Different Request Types', () => {
      it('should work with POST requests', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const postRequest = createMockRequest('http://localhost:3000/api/test', 'POST')
        const result = await requireNftHolder(postRequest)

        expect('result' in result).toBe(true)
      })

      it('should work with different URL paths', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const request = createMockRequest('http://localhost:3000/api/nft-exclusive/feature')
        const result = await requireNftHolder(request)

        expect('result' in result).toBe(true)
      })
    })
  })

  describe('checkNftHolderOptional', () => {
    let mockRequest: NextRequest

    beforeEach(() => {
      mockRequest = createMockRequest()
    })

    describe('NFT Holder Status', () => {
      it('should return NFT holder status without blocking', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const result = await checkNftHolderOptional(mockRequest)

        expect(result.isNftHolder).toBe(true)
        expect(result.userId).toBe(mockUserId)
        expect(result.walletAddress).toBe(mockWalletAddress)
      })

      it('should return false for non-NFT holders without blocking', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: false,
            wallet_address: null,
          },
          error: null,
        })

        const result = await checkNftHolderOptional(mockRequest)

        expect(result.isNftHolder).toBe(false)
        expect(result.userId).toBe(mockUserId)
      })

      it('should return false for unauthenticated without blocking', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })

        const result = await checkNftHolderOptional(mockRequest)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should return error info for database errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockRejectedValue(new Error('Database error'))

        const result = await checkNftHolderOptional(mockRequest)

        expect(result.isNftHolder).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    describe('Always Returns Result', () => {
      it('should never throw exception', async () => {
        mockSupabase.auth.getUser.mockRejectedValue(new Error('Critical error'))

        const result = await checkNftHolderOptional(mockRequest)

        expect(result).toBeDefined()
        expect(result.isNftHolder).toBe(false)
      })

      it('should handle all error cases gracefully', async () => {
        const errorCases = [
          { user: null, error: { message: 'Auth error' } },
          { user: undefined, error: null },
          null,
          undefined,
        ]

        for (const errorCase of errorCases) {
          mockSupabase.auth.getUser.mockResolvedValue({
            data: errorCase as any,
            error: null,
          })

          const result = await checkNftHolderOptional(mockRequest)
          expect(result.isNftHolder).toBe(false)
        }
      })
    })
  })

  describe('isNftVerificationCacheValid', () => {
    describe('Valid Cache', () => {
      it('should return true for valid cache in the future', async () => {
        const futureDate = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

        mockSupabase.single.mockResolvedValue({
          data: {
            expires_at: futureDate.toISOString(),
          },
          error: null,
        })

        const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId)

        expect(isValid).toBe(true)
      })

      it('should return true for cache expiring soon', async () => {
        const soonDate = new Date(Date.now() + 1000) // 1 second

        mockSupabase.single.mockResolvedValue({
          data: {
            expires_at: soonDate.toISOString(),
          },
          error: null,
        })

        const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId)

        expect(isValid).toBe(true)
      })
    })

    describe('Invalid Cache', () => {
      it('should return false for expired cache', async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        })

        const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId)

        expect(isValid).toBe(false)
      })

      it('should return false when no cache exists', async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: null,
        })

        const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId)

        expect(isValid).toBe(false)
      })

      it('should return false when data is undefined', async () => {
        mockSupabase.single.mockResolvedValue({
          data: undefined,
          error: null,
        })

        const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId)

        expect(isValid).toBe(false)
      })
    })

    describe('Error Handling', () => {
      it('should return false on database errors', async () => {
        mockSupabase.single.mockRejectedValue(new Error('Database error'))

        const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId)

        expect(isValid).toBe(false)
      })

      it('should return false on network errors', async () => {
        mockSupabase.single.mockRejectedValue(new Error('Network timeout'))

        const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId)

        expect(isValid).toBe(false)
      })

      it('should return false when error is present', async () => {
        mockSupabase.single.mockResolvedValue({
          data: {
            expires_at: new Date(Date.now() + 10000).toISOString(),
          },
          error: { message: 'Query error' },
        })

        const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId)

        expect(isValid).toBe(false)
      })
    })

    describe('Different User IDs', () => {
      it('should work with different user ID formats', async () => {
        const userIds = [
          'uuid-format-123-456',
          '12345',
          'user_with_underscore',
          'user-with-dash',
        ]

        for (const userId of userIds) {
          mockSupabase.single.mockResolvedValue({
            data: {
              expires_at: new Date(Date.now() + 10000).toISOString(),
            },
            error: null,
          })

          const isValid = await isNftVerificationCacheValid(mockSupabase, userId)
          expect(isValid).toBe(true)
        }
      })
    })
  })

  describe('withNftHolderCheck', () => {
    let mockRequest: NextRequest
    let mockHandler: jest.Mock

    beforeEach(() => {
      mockRequest = createMockRequest()
      mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
    })

    describe('Handler Invocation', () => {
      it('should call handler for NFT holders', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const wrappedHandler = withNftHolderCheck(mockHandler)
        const response = await wrappedHandler(mockRequest)

        expect(mockHandler).toHaveBeenCalledWith(
          mockRequest,
          expect.objectContaining({
            isNftHolder: true,
            userId: mockUserId,
            walletAddress: mockWalletAddress,
          })
        )

        const data = await response.json()
        expect(data.success).toBe(true)
      })

      it('should block non-NFT holders without calling handler', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: false,
            wallet_address: null,
          },
          error: null,
        })

        const wrappedHandler = withNftHolderCheck(mockHandler)
        const response = await wrappedHandler(mockRequest)

        expect(mockHandler).not.toHaveBeenCalled()
        expect(response.status).toBe(403)

        const data = await response.json()
        expect(data.nft_holder_required).toBe(true)
      })

      it('should block unauthenticated users without calling handler', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })

        const wrappedHandler = withNftHolderCheck(mockHandler)
        const response = await wrappedHandler(mockRequest)

        expect(mockHandler).not.toHaveBeenCalled()
        expect(response.status).toBe(403)
      })
    })

    describe('Handler Response Passthrough', () => {
      it('should return handler response for NFT holders', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const customResponse = NextResponse.json(
          { custom: 'data', userId: mockUserId },
          { status: 201 }
        )
        mockHandler.mockResolvedValue(customResponse)

        const wrappedHandler = withNftHolderCheck(mockHandler)
        const response = await wrappedHandler(mockRequest)

        expect(response.status).toBe(201)
        const data = await response.json()
        expect(data.custom).toBe('data')
        expect(data.userId).toBe(mockUserId)
      })

      it('should handle handler errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        mockHandler.mockRejectedValue(new Error('Handler error'))

        const wrappedHandler = withNftHolderCheck(mockHandler)

        await expect(wrappedHandler(mockRequest)).rejects.toThrow('Handler error')
      })
    })
  })

  describe('withOptionalNftCheck', () => {
    let mockRequest: NextRequest
    let mockHandler: jest.Mock

    beforeEach(() => {
      mockRequest = createMockRequest()
      mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
    })

    describe('Always Call Handler', () => {
      it('should call handler with NFT status for NFT holders', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const wrappedHandler = withOptionalNftCheck(mockHandler)
        await wrappedHandler(mockRequest)

        expect(mockHandler).toHaveBeenCalledWith(
          mockRequest,
          expect.objectContaining({
            isNftHolder: true,
            userId: mockUserId,
          })
        )
      })

      it('should call handler with false NFT status for non-holders', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: false,
            wallet_address: null,
          },
          error: null,
        })

        const wrappedHandler = withOptionalNftCheck(mockHandler)
        await wrappedHandler(mockRequest)

        expect(mockHandler).toHaveBeenCalledWith(
          mockRequest,
          expect.objectContaining({
            isNftHolder: false,
          })
        )
      })

      it('should not block unauthenticated users', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })

        const wrappedHandler = withOptionalNftCheck(mockHandler)
        const response = await wrappedHandler(mockRequest)

        expect(mockHandler).toHaveBeenCalled()
        const data = await response.json()
        expect(data.success).toBe(true)
      })

      it('should call handler even with database errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockRejectedValue(new Error('Database error'))

        const wrappedHandler = withOptionalNftCheck(mockHandler)
        await wrappedHandler(mockRequest)

        expect(mockHandler).toHaveBeenCalledWith(
          mockRequest,
          expect.objectContaining({
            isNftHolder: false,
            error: expect.any(String),
          })
        )
      })
    })

    describe('Handler Response', () => {
      it('should return handler response', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: true,
            wallet_address: mockWalletAddress,
          },
          error: null,
        })

        const customResponse = NextResponse.json({ data: 'custom' })
        mockHandler.mockResolvedValue(customResponse)

        const wrappedHandler = withOptionalNftCheck(mockHandler)
        const response = await wrappedHandler(mockRequest)

        const data = await response.json()
        expect(data.data).toBe('custom')
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle route protection with pricing logic', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      })

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      })

      const mockRequest = createMockRequest('http://localhost:3000/api/booking', 'POST')

      const mockHandler = jest.fn(async (req, nftStatus) => {
        const basePrice = 100
        const discount = nftStatus.isNftHolder ? 0.5 : 0
        const finalPrice = basePrice * (1 - discount)

        return NextResponse.json({
          price: finalPrice,
          discount_applied: nftStatus.isNftHolder,
          wallet: nftStatus.walletAddress,
        })
      })

      const wrappedHandler = withOptionalNftCheck(mockHandler)
      const response = await wrappedHandler(mockRequest)
      const data = await response.json()

      expect(data.price).toBe(50)
      expect(data.discount_applied).toBe(true)
      expect(data.wallet).toBe(mockWalletAddress)
    })

    it('should handle concurrent NFT status checks', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      })

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      })

      const promises = Array(10)
        .fill(null)
        .map(() => checkNftHolderStatus(mockSupabase))

      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result.isNftHolder).toBe(true)
        expect(result.userId).toBe(mockUserId)
      })
    })

    it('should handle mixed user scenarios in sequence', async () => {
      const mockRequest = createMockRequest()

      // Scenario 1: NFT holder
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      })
      mockSupabase.single.mockResolvedValue({
        data: { nft_holder: true, wallet_address: mockWalletAddress },
        error: null,
      })

      let result = await requireNftHolder(mockRequest)
      expect('result' in result).toBe(true)

      // Scenario 2: Non-holder
      mockSupabase.single.mockResolvedValue({
        data: { nft_holder: false, wallet_address: null },
        error: null,
      })

      result = await requireNftHolder(mockRequest)
      expect('error' in result).toBe(true)

      // Scenario 3: Unauthenticated
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      result = await requireNftHolder(mockRequest)
      expect('error' in result).toBe(true)
    })

    it('should provide different access levels based on NFT status', async () => {
      const testCases = [
        {
          nftHolder: true,
          expectedAccess: 'premium',
          expectedFeatures: ['feature1', 'feature2', 'feature3'],
        },
        {
          nftHolder: false,
          expectedAccess: 'basic',
          expectedFeatures: ['feature1'],
        },
      ]

      for (const testCase of testCases) {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        })

        mockSupabase.single.mockResolvedValue({
          data: {
            nft_holder: testCase.nftHolder,
            wallet_address: testCase.nftHolder ? mockWalletAddress : null,
          },
          error: null,
        })

        const mockHandler = jest.fn(async (req, nftStatus) => {
          const access = nftStatus.isNftHolder ? 'premium' : 'basic'
          const features = nftStatus.isNftHolder
            ? ['feature1', 'feature2', 'feature3']
            : ['feature1']

          return NextResponse.json({ access, features })
        })

        const request = createMockRequest()
        const wrappedHandler = withOptionalNftCheck(mockHandler)
        const response = await wrappedHandler(request)
        const data = await response.json()

        expect(data.access).toBe(testCase.expectedAccess)
        expect(data.features).toEqual(testCase.expectedFeatures)
      }
    })
  })
})