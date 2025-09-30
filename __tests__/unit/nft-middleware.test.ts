/**
 * NFT Holder Middleware Tests
 *
 * Tests for middleware functions that check NFT holder status
 * and protect routes requiring NFT ownership.
 */

import {
  checkNftHolderStatus,
  requireNftHolder,
  checkNftHolderOptional,
  isNftVerificationCacheValid,
  withNftHolderCheck,
  withOptionalNftCheck,
} from '@/lib/middleware/nft-holder';
import { NextRequest, NextResponse } from 'next/server';

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createRouteHandlerClient: jest.fn(),
}));

describe('NFT Holder Middleware', () => {
  const mockUserId = 'user-123';
  const mockWalletAddress = '0x1234567890123456789012345678901234567890';

  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

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
    };

    const { createRouteHandlerClient } = require('@supabase/supabase-js');
    createRouteHandlerClient.mockReturnValue(mockSupabase);
  });

  describe('checkNftHolderStatus', () => {
    it('should return NFT holder status for authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const result = await checkNftHolderStatus(mockSupabase);

      expect(result).toEqual({
        isNftHolder: true,
        userId: mockUserId,
        walletAddress: mockWalletAddress,
      });
    });

    it('should return false for non-NFT holder', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: false,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const result = await checkNftHolderStatus(mockSupabase);

      expect(result.isNftHolder).toBe(false);
      expect(result.userId).toBe(mockUserId);
    });

    it('should handle unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await checkNftHolderStatus(mockSupabase);

      expect(result).toEqual({
        isNftHolder: false,
        error: 'User not authenticated',
      });
    });

    it('should handle missing user data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const result = await checkNftHolderStatus(mockSupabase);

      expect(result.isNftHolder).toBe(false);
      expect(result.userId).toBe(mockUserId);
      expect(result.error).toContain('User data not found');
    });

    it('should handle null NFT holder field', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: null,
          wallet_address: null,
        },
        error: null,
      });

      const result = await checkNftHolderStatus(mockSupabase);

      expect(result.isNftHolder).toBe(false);
    });

    it('should handle database errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockRejectedValue(new Error('Database error'));

      const result = await checkNftHolderStatus(mockSupabase);

      expect(result.isNftHolder).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should create Supabase client if not provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const result = await checkNftHolderStatus();

      expect(result.isNftHolder).toBe(true);
    });
  });

  describe('requireNftHolder', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });
    });

    it('should allow access for NFT holders', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const result = await requireNftHolder(mockRequest);

      expect('result' in result).toBe(true);
      if ('result' in result) {
        expect(result.result.isNftHolder).toBe(true);
        expect(result.result.userId).toBe(mockUserId);
      }
    });

    it('should block non-NFT holders', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: false,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const result = await requireNftHolder(mockRequest);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        const data = await result.error.json();
        expect(data.nft_holder_required).toBe(true);
        expect(result.error.status).toBe(403);
      }
    });

    it('should block unauthenticated users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await requireNftHolder(mockRequest);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.status).toBe(403);
      }
    });

    it('should include error message in response', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await requireNftHolder(mockRequest);

      if ('error' in result) {
        const data = await result.error.json();
        expect(data.message).toBeDefined();
        expect(data.nft_holder_required).toBe(true);
      }
    });
  });

  describe('checkNftHolderOptional', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });
    });

    it('should return NFT holder status without blocking', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const result = await checkNftHolderOptional(mockRequest);

      expect(result.isNftHolder).toBe(true);
      expect(result.userId).toBe(mockUserId);
    });

    it('should return false for non-NFT holders without blocking', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: false,
          wallet_address: null,
        },
        error: null,
      });

      const result = await checkNftHolderOptional(mockRequest);

      expect(result.isNftHolder).toBe(false);
    });

    it('should return false for unauthenticated without blocking', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await checkNftHolderOptional(mockRequest);

      expect(result.isNftHolder).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('isNftVerificationCacheValid', () => {
    it('should return true for valid cache', async () => {
      const futureDate = new Date(Date.now() + 12 * 60 * 60 * 1000);

      mockSupabase.single.mockResolvedValue({
        data: {
          expires_at: futureDate.toISOString(),
        },
        error: null,
      });

      const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId);

      expect(isValid).toBe(true);
    });

    it('should return false for expired cache', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId);

      expect(isValid).toBe(false);
    });

    it('should return false when no cache exists', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      });

      const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId);

      expect(isValid).toBe(false);
    });

    it('should handle database errors', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Database error'));

      const isValid = await isNftVerificationCacheValid(mockSupabase, mockUserId);

      expect(isValid).toBe(false);
    });
  });

  describe('withNftHolderCheck', () => {
    let mockRequest: NextRequest;
    let mockHandler: jest.Mock;

    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });
      mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
    });

    it('should call handler for NFT holders', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const wrappedHandler = withNftHolderCheck(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          isNftHolder: true,
          userId: mockUserId,
        })
      );

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should block non-NFT holders', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: false,
          wallet_address: null,
        },
        error: null,
      });

      const wrappedHandler = withNftHolderCheck(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.nft_holder_required).toBe(true);
    });
  });

  describe('withOptionalNftCheck', () => {
    let mockRequest: NextRequest;
    let mockHandler: jest.Mock;

    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });
      mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
    });

    it('should call handler with NFT status for NFT holders', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const wrappedHandler = withOptionalNftCheck(mockHandler);
      await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          isNftHolder: true,
          userId: mockUserId,
        })
      );
    });

    it('should call handler with false NFT status for non-holders', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: false,
          wallet_address: null,
        },
        error: null,
      });

      const wrappedHandler = withOptionalNftCheck(mockHandler);
      await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          isNftHolder: false,
        })
      );
    });

    it('should not block unauthenticated users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const wrappedHandler = withOptionalNftCheck(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle route protection with pricing logic', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const mockRequest = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
      });

      const mockHandler = jest.fn(async (req, nftStatus) => {
        const basePrice = 100;
        const discount = nftStatus.isNftHolder ? 0.5 : 0;
        const finalPrice = basePrice * (1 - discount);

        return NextResponse.json({
          price: finalPrice,
          discount_applied: nftStatus.isNftHolder,
        });
      });

      const wrappedHandler = withOptionalNftCheck(mockHandler);
      const response = await wrappedHandler(mockRequest);
      const data = await response.json();

      expect(data.price).toBe(50);
      expect(data.discount_applied).toBe(true);
    });

    it('should handle concurrent NFT status checks', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          nft_holder: true,
          wallet_address: mockWalletAddress,
        },
        error: null,
      });

      const promises = Array(10).fill(null).map(() =>
        checkNftHolderStatus(mockSupabase)
      );

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.isNftHolder).toBe(true);
        expect(result.userId).toBe(mockUserId);
      });
    });
  });
});