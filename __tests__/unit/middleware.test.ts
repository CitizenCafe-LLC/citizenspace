/**
 * Unit Tests for Authentication Middleware
 * Tests route protection, role-based access, and NFT holder checks
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateRequest,
  withAuth,
  withStaffAuth,
  withAdminAuth,
  withNftHolderAuth,
  getCurrentUser,
  hasRole,
  isNftHolder,
} from '@/lib/auth/middleware';
import { createAccessToken, TokenPayload } from '@/lib/auth/jwt';

// Mock NextRequest
function createMockRequest(authHeader?: string): NextRequest {
  const url = 'http://localhost:3000/api/test';
  const request = new NextRequest(url);

  if (authHeader) {
    (request as any).headers.set('Authorization', authHeader);
  }

  return request;
}

describe('Authentication Middleware', () => {
  let validToken: string;
  let validPayload: TokenPayload;

  beforeAll(async () => {
    // Create a valid token for testing
    validPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
      nftHolder: false,
    };
    validToken = await createAccessToken(validPayload);
  });

  describe('authenticateRequest', () => {
    it('should return authenticated=false when no token provided', async () => {
      const request = createMockRequest();
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return authenticated=false with invalid token', async () => {
      const request = createMockRequest('Bearer invalid-token');
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return authenticated=true with valid token', async () => {
      const request = createMockRequest(`Bearer ${validToken}`);
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.userId).toBe(validPayload.userId);
      expect(result.user?.email).toBe(validPayload.email);
    });

    it('should extract nftHolder flag from token', async () => {
      const nftHolderPayload: TokenPayload = {
        ...validPayload,
        nftHolder: true,
      };
      const nftToken = await createAccessToken(nftHolderPayload);
      const request = createMockRequest(`Bearer ${nftToken}`);
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(true);
      expect(result.user?.nftHolder).toBe(true);
    });
  });

  describe('withAuth Higher-Order Function', () => {
    it('should reject requests without authentication', async () => {
      const handler = jest.fn();
      const protectedHandler = withAuth(handler);

      const request = createMockRequest();
      const response = await protectedHandler(request);

      expect(response.status).toBe(401);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow authenticated requests', async () => {
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const protectedHandler = withAuth(handler);

      const request = createMockRequest(`Bearer ${validToken}`);
      const response = await protectedHandler(request);

      expect(handler).toHaveBeenCalled();
      const handlerArgs = handler.mock.calls[0];
      expect(handlerArgs[1].user.userId).toBe(validPayload.userId);
    });

    it('should enforce role-based access control', async () => {
      const handler = jest.fn();
      const protectedHandler = withAuth(handler, { roles: ['admin'] });

      const request = createMockRequest(`Bearer ${validToken}`);
      const response = await protectedHandler(request);

      expect(response.status).toBe(403);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow access for matching roles', async () => {
      const staffPayload: TokenPayload = {
        ...validPayload,
        role: 'staff',
      };
      const staffToken = await createAccessToken(staffPayload);

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const protectedHandler = withAuth(handler, { roles: ['staff', 'admin'] });

      const request = createMockRequest(`Bearer ${staffToken}`);
      const response = await protectedHandler(request);

      expect(handler).toHaveBeenCalled();
    });

    it('should enforce NFT holder requirement', async () => {
      const handler = jest.fn();
      const protectedHandler = withAuth(handler, { requireNftHolder: true });

      const request = createMockRequest(`Bearer ${validToken}`);
      const response = await protectedHandler(request);

      expect(response.status).toBe(403);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow access for NFT holders', async () => {
      const nftPayload: TokenPayload = {
        ...validPayload,
        nftHolder: true,
      };
      const nftToken = await createAccessToken(nftPayload);

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const protectedHandler = withAuth(handler, { requireNftHolder: true });

      const request = createMockRequest(`Bearer ${nftToken}`);
      const response = await protectedHandler(request);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('withStaffAuth', () => {
    it('should reject non-staff users', async () => {
      const handler = jest.fn();
      const protectedHandler = withStaffAuth(handler);

      const request = createMockRequest(`Bearer ${validToken}`);
      const response = await protectedHandler(request);

      expect(response.status).toBe(403);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow staff users', async () => {
      const staffPayload: TokenPayload = {
        ...validPayload,
        role: 'staff',
      };
      const staffToken = await createAccessToken(staffPayload);

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const protectedHandler = withStaffAuth(handler);

      const request = createMockRequest(`Bearer ${staffToken}`);
      const response = await protectedHandler(request);

      expect(handler).toHaveBeenCalled();
    });

    it('should allow admin users', async () => {
      const adminPayload: TokenPayload = {
        ...validPayload,
        role: 'admin',
      };
      const adminToken = await createAccessToken(adminPayload);

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const protectedHandler = withStaffAuth(handler);

      const request = createMockRequest(`Bearer ${adminToken}`);
      const response = await protectedHandler(request);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('withAdminAuth', () => {
    it('should reject non-admin users', async () => {
      const handler = jest.fn();
      const protectedHandler = withAdminAuth(handler);

      const request = createMockRequest(`Bearer ${validToken}`);
      const response = await protectedHandler(request);

      expect(response.status).toBe(403);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow admin users', async () => {
      const adminPayload: TokenPayload = {
        ...validPayload,
        role: 'admin',
      };
      const adminToken = await createAccessToken(adminPayload);

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const protectedHandler = withAdminAuth(handler);

      const request = createMockRequest(`Bearer ${adminToken}`);
      const response = await protectedHandler(request);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null for unauthenticated requests', async () => {
      const request = createMockRequest();
      const user = await getCurrentUser(request);

      expect(user).toBeNull();
    });

    it('should return user for authenticated requests', async () => {
      const request = createMockRequest(`Bearer ${validToken}`);
      const user = await getCurrentUser(request);

      expect(user).not.toBeNull();
      expect(user?.userId).toBe(validPayload.userId);
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', () => {
      expect(hasRole(validPayload, ['user'])).toBe(true);
    });

    it('should return true for one of multiple roles', () => {
      expect(hasRole(validPayload, ['user', 'staff'])).toBe(true);
    });

    it('should return false for non-matching role', () => {
      expect(hasRole(validPayload, ['admin'])).toBe(false);
    });
  });

  describe('isNftHolder', () => {
    it('should return false for non-NFT holders', () => {
      expect(isNftHolder(validPayload)).toBe(false);
    });

    it('should return true for NFT holders', () => {
      const nftPayload: TokenPayload = {
        ...validPayload,
        nftHolder: true,
      };
      expect(isNftHolder(nftPayload)).toBe(true);
    });
  });
});