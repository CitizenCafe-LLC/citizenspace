/**
 * Shared API Test Utilities
 * Provides consistent mocking and helpers for API route tests
 */

import { NextRequest } from 'next/server'

/**
 * Creates a mock NextRequest for testing
 */
export function createMockRequest(
  url: string,
  method: string = 'GET',
  body?: any,
  token?: string
): NextRequest {
  const fullUrl = new URL(url, 'http://localhost:3000')
  const headers = new Headers()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (body) {
    headers.set('Content-Type', 'application/json')
  }

  return {
    nextUrl: {
      searchParams: fullUrl.searchParams,
    },
    url: fullUrl.toString(),
    method,
    headers,
    json: async () => body,
  } as any
}

/**
 * Mock user data for tests
 */
export const mockUsers = {
  regular: {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user' as const,
    nftHolder: false,
  },
  nftHolder: {
    userId: 'nft-user-123',
    email: 'nft@example.com',
    role: 'user' as const,
    nftHolder: true,
  },
  staff: {
    userId: 'staff-123',
    email: 'staff@example.com',
    role: 'staff' as const,
    nftHolder: false,
  },
  admin: {
    userId: 'admin-123',
    email: 'admin@example.com',
    role: 'admin' as const,
    nftHolder: false,
  },
}

/**
 * Sets up authentication middleware mocks
 * Call this in beforeEach for tests that use withAuth wrapper
 */
export function setupAuthMocks(
  authMiddleware: any,
  currentUser: any = mockUsers.regular
) {
  // Mock withAuth wrapper
  const mockWithAuth = authMiddleware.withAuth as jest.MockedFunction<any>
  mockWithAuth.mockImplementation((handler, options) => {
    return async (request: NextRequest, context?: any) => {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader) {
        return Response.json(
          { error: 'Unauthorized', message: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }

      // Check role-based access
      if (options?.roles && !options.roles.includes(currentUser.role)) {
        return Response.json(
          { error: 'Forbidden', message: 'Insufficient permissions', code: 'FORBIDDEN' },
          { status: 403 }
        )
      }

      // Check NFT holder requirement
      if (options?.requireNftHolder && !currentUser.nftHolder) {
        return Response.json(
          { error: 'Forbidden', message: 'NFT holder status required', code: 'NFT_REQUIRED' },
          { status: 403 }
        )
      }

      // Call the actual handler with authenticated user
      return handler(request, { user: currentUser, ...context })
    }
  })

  // Mock withStaffAuth wrapper
  if (authMiddleware.withStaffAuth) {
    const mockWithStaffAuth = authMiddleware.withStaffAuth as jest.MockedFunction<any>
    mockWithStaffAuth.mockImplementation((handler) => {
      return mockWithAuth(handler, { roles: ['staff', 'admin'] })
    })
  }

  // Mock withAdminAuth wrapper
  if (authMiddleware.withAdminAuth) {
    const mockWithAdminAuth = authMiddleware.withAdminAuth as jest.MockedFunction<any>
    mockWithAdminAuth.mockImplementation((handler) => {
      return mockWithAuth(handler, { roles: ['admin'] })
    })
  }

  // Mock withNftHolderAuth wrapper
  if (authMiddleware.withNftHolderAuth) {
    const mockWithNftHolderAuth = authMiddleware.withNftHolderAuth as jest.MockedFunction<any>
    mockWithNftHolderAuth.mockImplementation((handler) => {
      return mockWithAuth(handler, { requireNftHolder: true })
    })
  }

  // Mock authenticateRequest function
  const mockAuthenticateRequest = authMiddleware.authenticateRequest as jest.MockedFunction<any>
  mockAuthenticateRequest.mockImplementation(async (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return {
        authenticated: false,
        error: 'No authentication token provided',
      }
    }

    return {
      authenticated: true,
      user: currentUser,
    }
  })

  return { mockWithAuth, mockAuthenticateRequest }
}
