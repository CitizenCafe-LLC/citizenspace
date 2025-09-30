/**
 * Web3 API Endpoints Tests
 *
 * Integration tests for wallet connection and NFT verification endpoints.
 * Tests cover authentication, wallet linking, NFT verification, and error handling.
 */

import { POST as walletConnectPost } from '@/app/api/auth/wallet-connect/route';
import { GET as verifyNftGet, POST as verifyNftPost } from '@/app/api/auth/verify-nft/route';
import { NextRequest } from 'next/server';
import { verifyNftOwnership } from '@/lib/web3/nft-verification';

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

// Mock NFT verification service
jest.mock('@/lib/web3/nft-verification');

describe('Web3 API Endpoints', () => {
  const mockWalletAddress = '0x1234567890123456789012345678901234567890';
  const mockUserId = 'user-123';

  let mockSupabase: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const { createRouteHandlerClient } = require('@supabase/supabase-js');
    createRouteHandlerClient.mockReturnValue(mockSupabase);
  });

  describe('POST /api/auth/wallet-connect', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });
    });

    it('should successfully connect wallet and verify NFT', async () => {
      // Mock no existing wallet
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      // Mock successful update
      mockSupabase.update.mockResolvedValue({ error: null });

      // Mock NFT verification
      (verifyNftOwnership as jest.Mock).mockResolvedValue({
        verified: true,
        nft_holder: true,
        balance: 5,
        cached: false,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: mockWalletAddress }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.nft_holder).toBe(true);
      expect(data.user_id).toBe(mockUserId);
      expect(data.message).toContain('NFT holder benefits activated');
    });

    it('should connect wallet without NFT ownership', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });
      mockSupabase.update.mockResolvedValue({ error: null });

      (verifyNftOwnership as jest.Mock).mockResolvedValue({
        verified: true,
        nft_holder: false,
        balance: 0,
        cached: false,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: mockWalletAddress }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.nft_holder).toBe(false);
      expect(data.message).toBe('Wallet connected successfully.');
    });

    it('should reject invalid wallet address format', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: 'invalid-address' }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid wallet address');
    });

    it('should reject missing wallet address', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: mockWalletAddress }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Unauthorized');
    });

    it('should reject wallet already connected to another account', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: 'other-user-id', wallet_address: mockWalletAddress },
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: mockWalletAddress }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.message).toContain('already connected to another account');
    });

    it('should handle database update errors', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });
      mockSupabase.update.mockResolvedValue({
        error: { message: 'Database error' },
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: mockWalletAddress }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should continue even if NFT verification fails', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });
      mockSupabase.update.mockResolvedValue({ error: null });

      (verifyNftOwnership as jest.Mock).mockRejectedValue(
        new Error('Blockchain error')
      );

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: mockWalletAddress }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.nft_holder).toBe(false);
    });

    it('should normalize wallet address to lowercase', async () => {
      const upperCaseWallet = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12';
      mockSupabase.single.mockResolvedValue({ data: null, error: null });
      mockSupabase.update.mockResolvedValue({ error: null });

      (verifyNftOwnership as jest.Mock).mockResolvedValue({
        verified: true,
        nft_holder: false,
        balance: 0,
        cached: false,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: upperCaseWallet }),
      });

      const response = await walletConnectPost(mockRequest);

      expect(mockSupabase.update).toHaveBeenCalledWith({
        wallet_address: upperCaseWallet.toLowerCase(),
      });
    });
  });

  describe('GET /api/auth/verify-nft', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { wallet_address: mockWalletAddress },
        error: null,
      });
    });

    it('should verify NFT ownership successfully', async () => {
      (verifyNftOwnership as jest.Mock).mockResolvedValue({
        verified: true,
        nft_holder: true,
        balance: 3,
        cached: false,
        verified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'GET',
      });

      const response = await verifyNftGet(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.verified).toBe(true);
      expect(data.nft_holder).toBe(true);
      expect(data.balance).toBe(3);
    });

    it('should return cached verification result', async () => {
      (verifyNftOwnership as jest.Mock).mockResolvedValue({
        verified: true,
        nft_holder: true,
        balance: 2,
        cached: true,
        verified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'GET',
      });

      const response = await verifyNftGet(mockRequest);
      const data = await response.json();

      expect(data.cached).toBe(true);
      expect(data.balance).toBe(2);
    });

    it('should force refresh when requested', async () => {
      (verifyNftOwnership as jest.Mock).mockResolvedValue({
        verified: true,
        nft_holder: true,
        balance: 5,
        cached: false,
        verified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/auth/verify-nft?force_refresh=true',
        { method: 'GET' }
      );

      const response = await verifyNftGet(mockRequest);
      const data = await response.json();

      expect(verifyNftOwnership).toHaveBeenCalledWith(
        mockSupabase,
        mockUserId,
        mockWalletAddress,
        true // forceRefresh
      );
      expect(data.cached).toBe(false);
    });

    it('should reject unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'GET',
      });

      const response = await verifyNftGet(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.verified).toBe(false);
      expect(data.nft_holder).toBe(false);
    });

    it('should handle user without connected wallet', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { wallet_address: null },
        error: null,
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'GET',
      });

      const response = await verifyNftGet(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('No wallet connected');
    });

    it('should handle user not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'GET',
      });

      const response = await verifyNftGet(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toContain('User not found');
    });

    it('should handle verification errors', async () => {
      (verifyNftOwnership as jest.Mock).mockRejectedValue(
        new Error('Blockchain RPC error')
      );

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'GET',
      });

      const response = await verifyNftGet(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.verified).toBe(false);
      expect(data.message).toContain('Failed to verify');
    });
  });

  describe('POST /api/auth/verify-nft (disconnect)', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });
    });

    it('should disconnect wallet successfully', async () => {
      mockSupabase.update.mockResolvedValue({ error: null });
      mockSupabase.delete.mockResolvedValue({ error: null });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'POST',
        body: JSON.stringify({ action: 'disconnect' }),
      });

      const response = await verifyNftPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('disconnected successfully');

      // Verify wallet address and NFT status cleared
      expect(mockSupabase.update).toHaveBeenCalledWith({
        wallet_address: null,
        nft_holder: false,
      });

      // Verify cached verifications deleted
      expect(mockSupabase.from).toHaveBeenCalledWith('nft_verifications');
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should reject invalid action', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'POST',
        body: JSON.stringify({ action: 'invalid' }),
      });

      const response = await verifyNftPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('Invalid action');
    });

    it('should reject unauthenticated disconnect requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'POST',
        body: JSON.stringify({ action: 'disconnect' }),
      });

      const response = await verifyNftPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toContain('Unauthorized');
    });

    it('should handle database errors during disconnect', async () => {
      mockSupabase.update.mockResolvedValue({
        error: { message: 'Database error' },
      });

      mockRequest = new NextRequest('http://localhost:3000/api/auth/verify-nft', {
        method: 'POST',
        body: JSON.stringify({ action: 'disconnect' }),
      });

      const response = await verifyNftPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toContain('Failed to disconnect');
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle malformed JSON request', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: 'invalid-json',
      });

      const response = await walletConnectPost(mockRequest);

      expect(response.status).toBe(500);
    });

    it('should handle SQL injection attempts in wallet address', async () => {
      const maliciousAddress = "0x123'; DROP TABLE users; --";

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: maliciousAddress }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('Invalid wallet address');
    });

    it('should handle XSS attempts in wallet address', async () => {
      const xssAddress = '0x<script>alert("xss")</script>';

      mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
        method: 'POST',
        body: JSON.stringify({ wallet_address: xssAddress }),
      });

      const response = await walletConnectPost(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('Invalid wallet address');
    });

    it('should validate wallet address checksum format', async () => {
      const addresses = [
        '0x0000000000000000000000000000000000000000', // Valid
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', // Valid
        '0x123', // Invalid - too short
        '0x12345678901234567890123456789012345678901', // Invalid - too long
        '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', // Invalid - non-hex
      ];

      for (const address of addresses) {
        mockRequest = new NextRequest('http://localhost:3000/api/auth/wallet-connect', {
          method: 'POST',
          body: JSON.stringify({ wallet_address: address }),
        });

        const response = await walletConnectPost(mockRequest);
        const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);

        if (isValid) {
          expect([200, 409, 500]).toContain(response.status);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple verification requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { wallet_address: mockWalletAddress },
        error: null,
      });

      (verifyNftOwnership as jest.Mock).mockResolvedValue({
        verified: true,
        nft_holder: true,
        balance: 2,
        cached: true,
        verified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      });

      const requests = Array(5).fill(null).map(() =>
        new NextRequest('http://localhost:3000/api/auth/verify-nft', {
          method: 'GET',
        })
      );

      const responses = await Promise.all(
        requests.map(req => verifyNftGet(req))
      );

      responses.forEach(async (response) => {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.verified).toBe(true);
      });
    });
  });
});