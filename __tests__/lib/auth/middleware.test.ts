/**
 * Authentication Middleware Tests
 * Comprehensive tests for authentication middleware and route protection
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { NextResponse } from 'next/server'
import {
  authenticateRequest,
  withAuth,
  withStaffAuth,
  withAdminAuth,
  withNftHolderAuth,
  getCurrentUser,
  hasRole,
  isNftHolder,
} from '@/lib/auth/middleware'
import type { TokenPayload } from '@/lib/auth/jwt'

// Mock JWT module
jest.mock('@/lib/auth/jwt', () => ({
  verifyToken: jest.fn(),
  extractTokenFromHeader: jest.fn(),
  createTokenPair: jest.fn(),
}))

import * as jwtModule from '@/lib/auth/jwt'

// Type-safe access to mocked functions
const jwt = {
  verifyToken: jwtModule.verifyToken as jest.Mock,
  extractTokenFromHeader: jwtModule.extractTokenFromHeader as jest.Mock,
  createTokenPair: jwtModule.createTokenPair as jest.Mock,
}

// Helper to create mock NextRequest
function createMockRequest(url: string, options?: { headers?: Record<string, string> }) {
  return {
    url,
    method: 'GET',
    headers: {
      get: (name: string) => options?.headers?.[name] || null,
    },
  } as any
}

describe('Authentication Middleware', () => {
  const mockTokenPayload: TokenPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user',
    nftHolder: false,
    walletAddress: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('authenticateRequest', () => {
    test('should successfully authenticate request with valid token', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('valid-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const result = await authenticateRequest(mockRequest)

      expect(result.authenticated).toBe(true)
      expect(result.user).toEqual(mockTokenPayload)
      expect(result.error).toBeUndefined()
      expect(jwt.extractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-token')
      expect(jwt.verifyToken).toHaveBeenCalledWith('valid-token')
    })

    test('should fail authentication when no token provided', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test')

      ;jwt.extractTokenFromHeader.mockReturnValue(null)

      const result = await authenticateRequest(mockRequest)

      expect(result.authenticated).toBe(false)
      expect(result.user).toBeUndefined()
      expect(result.error).toBe('No authentication token provided')
    })

    test('should fail authentication with invalid token', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('invalid-token')
      ;jwt.verifyToken.mockRejectedValue(new Error('Invalid token'))

      const result = await authenticateRequest(mockRequest)

      expect(result.authenticated).toBe(false)
      expect(result.user).toBeUndefined()
      expect(result.error).toBe('Invalid token')
    })

    test('should handle token verification errors', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer expired-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('expired-token')
      ;jwt.verifyToken.mockRejectedValue(new Error('Token expired'))

      const result = await authenticateRequest(mockRequest)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Token expired')
    })

    test('should handle non-Error exceptions', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('token')
      ;jwt.verifyToken.mockRejectedValue('String error')

      const result = await authenticateRequest(mockRequest)

      expect(result.authenticated).toBe(false)
      expect(result.error).toBe('Invalid authentication token')
    })

    test('should handle null Authorization header', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test')

      ;jwt.extractTokenFromHeader.mockReturnValue(null)

      const result = await authenticateRequest(mockRequest)

      expect(result.authenticated).toBe(false)
      expect(jwt.extractTokenFromHeader).toHaveBeenCalledWith(null)
    })
  })

  describe('withAuth', () => {
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    )

    beforeEach(() => {
      mockHandler.mockClear()
    })

    test('should allow authenticated user to access route', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('valid-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const protectedHandler = withAuth(mockHandler)
      const response = await protectedHandler(mockRequest)

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, { user: mockTokenPayload })
      expect(response).toBeDefined()
    })

    test('should reject unauthenticated request', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test')

      ;jwt.extractTokenFromHeader.mockReturnValue(null)

      const protectedHandler = withAuth(mockHandler)
      const response = await protectedHandler(mockRequest)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(401)

      const body = await response.json()
      expect(body).toEqual({
        error: 'Unauthorized',
        message: 'No authentication token provided',
        code: 'UNAUTHORIZED',
      })
    })

    test('should enforce role-based access control', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/admin', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('valid-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload) // user role

      const protectedHandler = withAuth(mockHandler, { roles: ['admin'] })
      const response = await protectedHandler(mockRequest)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)

      const body = await response.json()
      expect(body).toEqual({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
      })
    })

    test('should allow user with correct role', async () => {
      const adminPayload: TokenPayload = { ...mockTokenPayload, role: 'admin' }
      const mockRequest = createMockRequest('http://localhost:3000/api/admin', {
        headers: {
          Authorization: 'Bearer admin-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('admin-token')
      ;jwt.verifyToken.mockResolvedValue(adminPayload)

      const protectedHandler = withAuth(mockHandler, { roles: ['admin'] })
      await protectedHandler(mockRequest)

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, { user: adminPayload })
    })

    test('should allow user with any matching role', async () => {
      const staffPayload: TokenPayload = { ...mockTokenPayload, role: 'staff' }
      const mockRequest = createMockRequest('http://localhost:3000/api/staff', {
        headers: {
          Authorization: 'Bearer staff-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('staff-token')
      ;jwt.verifyToken.mockResolvedValue(staffPayload)

      const protectedHandler = withAuth(mockHandler, { roles: ['staff', 'admin'] })
      await protectedHandler(mockRequest)

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, { user: staffPayload })
    })

    test('should enforce NFT holder requirement', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/nft-only', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('valid-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload) // nftHolder: false

      const protectedHandler = withAuth(mockHandler, { requireNftHolder: true })
      const response = await protectedHandler(mockRequest)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)

      const body = await response.json()
      expect(body).toEqual({
        error: 'Forbidden',
        message: 'NFT holder status required',
        code: 'NFT_REQUIRED',
      })
    })

    test('should allow NFT holder when required', async () => {
      const nftPayload: TokenPayload = { ...mockTokenPayload, nftHolder: true, walletAddress: '0x123' }
      const mockRequest = createMockRequest('http://localhost:3000/api/nft-only', {
        headers: {
          Authorization: 'Bearer nft-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('nft-token')
      ;jwt.verifyToken.mockResolvedValue(nftPayload)

      const protectedHandler = withAuth(mockHandler, { requireNftHolder: true })
      await protectedHandler(mockRequest)

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, { user: nftPayload })
    })

    test('should enforce both role and NFT holder requirements', async () => {
      const nftUserPayload: TokenPayload = { ...mockTokenPayload, nftHolder: true, walletAddress: '0x123' }
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('token')
      ;jwt.verifyToken.mockResolvedValue(nftUserPayload) // user role, nft holder

      const protectedHandler = withAuth(mockHandler, { roles: ['admin'], requireNftHolder: true })
      const response = await protectedHandler(mockRequest)

      expect(response.status).toBe(403) // Should fail on role check
    })

    test('should pass additional arguments to handler', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('valid-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const protectedHandler = withAuth(mockHandler)
      await protectedHandler(mockRequest, { params: { id: '123' } })

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, { user: mockTokenPayload })
    })
  })

  describe('withStaffAuth', () => {
    const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))

    test('should allow staff users', async () => {
      const staffPayload: TokenPayload = { ...mockTokenPayload, role: 'staff' }
      const mockRequest = createMockRequest('http://localhost:3000/api/staff', {
        headers: { Authorization: 'Bearer staff-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('staff-token')
      ;jwt.verifyToken.mockResolvedValue(staffPayload)

      const protectedHandler = withStaffAuth(mockHandler)
      await protectedHandler(mockRequest)

      expect(mockHandler).toHaveBeenCalled()
    })

    test('should allow admin users', async () => {
      const adminPayload: TokenPayload = { ...mockTokenPayload, role: 'admin' }
      const mockRequest = createMockRequest('http://localhost:3000/api/staff', {
        headers: { Authorization: 'Bearer admin-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('admin-token')
      ;jwt.verifyToken.mockResolvedValue(adminPayload)

      const protectedHandler = withStaffAuth(mockHandler)
      await protectedHandler(mockRequest)

      expect(mockHandler).toHaveBeenCalled()
    })

    test('should reject regular users', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/staff', {
        headers: { Authorization: 'Bearer user-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('user-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload) // user role

      const protectedHandler = withStaffAuth(mockHandler)
      const response = await protectedHandler(mockRequest)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('withAdminAuth', () => {
    const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))

    test('should allow admin users', async () => {
      const adminPayload: TokenPayload = { ...mockTokenPayload, role: 'admin' }
      const mockRequest = createMockRequest('http://localhost:3000/api/admin', {
        headers: { Authorization: 'Bearer admin-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('admin-token')
      ;jwt.verifyToken.mockResolvedValue(adminPayload)

      const protectedHandler = withAdminAuth(mockHandler)
      await protectedHandler(mockRequest)

      expect(mockHandler).toHaveBeenCalled()
    })

    test('should reject staff users', async () => {
      const staffPayload: TokenPayload = { ...mockTokenPayload, role: 'staff' }
      const mockRequest = createMockRequest('http://localhost:3000/api/admin', {
        headers: { Authorization: 'Bearer staff-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('staff-token')
      ;jwt.verifyToken.mockResolvedValue(staffPayload)

      const protectedHandler = withAdminAuth(mockHandler)
      const response = await protectedHandler(mockRequest)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })

    test('should reject regular users', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/admin', {
        headers: { Authorization: 'Bearer user-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('user-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const protectedHandler = withAdminAuth(mockHandler)
      const response = await protectedHandler(mockRequest)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('withNftHolderAuth', () => {
    const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))

    test('should allow NFT holders', async () => {
      const nftPayload: TokenPayload = {
        ...mockTokenPayload,
        nftHolder: true,
        walletAddress: '0x123',
      }
      const mockRequest = createMockRequest('http://localhost:3000/api/nft', {
        headers: { Authorization: 'Bearer nft-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('nft-token')
      ;jwt.verifyToken.mockResolvedValue(nftPayload)

      const protectedHandler = withNftHolderAuth(mockHandler)
      await protectedHandler(mockRequest)

      expect(mockHandler).toHaveBeenCalled()
    })

    test('should reject non-NFT holders', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/nft', {
        headers: { Authorization: 'Bearer user-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('user-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload) // nftHolder: false

      const protectedHandler = withNftHolderAuth(mockHandler)
      const response = await protectedHandler(mockRequest)

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(403)
    })
  })

  describe('getCurrentUser', () => {
    test('should return user from valid token', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: { Authorization: 'Bearer valid-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('valid-token')
      ;jwt.verifyToken.mockResolvedValue(mockTokenPayload)

      const user = await getCurrentUser(mockRequest)

      expect(user).toEqual(mockTokenPayload)
    })

    test('should return null for invalid token', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test', {
        headers: { Authorization: 'Bearer invalid-token' },
      })

      ;jwt.extractTokenFromHeader.mockReturnValue('invalid-token')
      ;jwt.verifyToken.mockRejectedValue(new Error('Invalid token'))

      const user = await getCurrentUser(mockRequest)

      expect(user).toBeNull()
    })

    test('should return null when no token provided', async () => {
      const mockRequest = createMockRequest('http://localhost:3000/api/test')

      ;jwt.extractTokenFromHeader.mockReturnValue(null)

      const user = await getCurrentUser(mockRequest)

      expect(user).toBeNull()
    })
  })

  describe('hasRole', () => {
    test('should return true when user has exact role', () => {
      const user: TokenPayload = { ...mockTokenPayload, role: 'admin' }
      expect(hasRole(user, ['admin'])).toBe(true)
    })

    test('should return true when user has one of multiple roles', () => {
      const user: TokenPayload = { ...mockTokenPayload, role: 'staff' }
      expect(hasRole(user, ['staff', 'admin'])).toBe(true)
    })

    test('should return false when user does not have role', () => {
      const user: TokenPayload = { ...mockTokenPayload, role: 'user' }
      expect(hasRole(user, ['admin'])).toBe(false)
    })

    test('should return false for empty role list', () => {
      const user: TokenPayload = { ...mockTokenPayload, role: 'admin' }
      expect(hasRole(user, [])).toBe(false)
    })

    test('should handle all role types', () => {
      const userUser: TokenPayload = { ...mockTokenPayload, role: 'user' }
      const staffUser: TokenPayload = { ...mockTokenPayload, role: 'staff' }
      const adminUser: TokenPayload = { ...mockTokenPayload, role: 'admin' }

      expect(hasRole(userUser, ['user'])).toBe(true)
      expect(hasRole(staffUser, ['staff'])).toBe(true)
      expect(hasRole(adminUser, ['admin'])).toBe(true)
    })
  })

  describe('isNftHolder', () => {
    test('should return true for NFT holder', () => {
      const user: TokenPayload = { ...mockTokenPayload, nftHolder: true }
      expect(isNftHolder(user)).toBe(true)
    })

    test('should return false for non-NFT holder', () => {
      const user: TokenPayload = { ...mockTokenPayload, nftHolder: false }
      expect(isNftHolder(user)).toBe(false)
    })

    test('should return false for undefined nftHolder', () => {
      const user: TokenPayload = { ...mockTokenPayload, nftHolder: undefined }
      expect(isNftHolder(user)).toBe(false)
    })
  })
})
