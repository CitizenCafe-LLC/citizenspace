/**
 * NFT Verification Service Tests
 *
 * Comprehensive tests for blockchain NFT ownership verification with caching.
 * Tests cover on-chain queries, caching logic, and database updates.
 */

import {
  checkNftBalanceOnChain,
  getCachedVerification,
  cacheVerification,
  updateUserNftStatus,
  verifyNftOwnership,
  cleanupExpiredVerifications,
} from '@/lib/web3/nft-verification'
import { createPublicClient } from 'viem'

// Mock viem
jest.mock('viem', () => ({
  createPublicClient: jest.fn(),
  http: jest.fn(),
}))

// Mock the chains
jest.mock('viem/chains', () => ({
  mainnet: { id: 1, name: 'Ethereum' },
  base: { id: 8453, name: 'Base' },
  sepolia: { id: 11155111, name: 'Sepolia' },
  baseSepolia: { id: 84532, name: 'Base Sepolia' },
}))

describe('NFT Verification Service', () => {
  const mockWalletAddress = '0x1234567890123456789012345678901234567890'
  const mockUserId = 'user-123'

  let mockSupabase: any
  let mockPublicClient: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    // Mock Viem public client
    mockPublicClient = {
      readContract: jest.fn(),
    }
    ;(createPublicClient as jest.Mock).mockReturnValue(mockPublicClient)

    // Set up environment variables
    process.env.NEXT_PUBLIC_CHAIN = 'sepolia'
    process.env.NEXT_PUBLIC_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/test'
  })

  describe('checkNftBalanceOnChain', () => {
    it('should successfully query NFT balance from blockchain', async () => {
      const expectedBalance = 3
      mockPublicClient.readContract.mockResolvedValue(BigInt(expectedBalance))

      const balance = await checkNftBalanceOnChain(mockWalletAddress)

      expect(balance).toBe(expectedBalance)
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: 'balanceOf',
          args: [mockWalletAddress],
        })
      )
    })

    it('should handle zero balance', async () => {
      mockPublicClient.readContract.mockResolvedValue(BigInt(0))

      const balance = await checkNftBalanceOnChain(mockWalletAddress)

      expect(balance).toBe(0)
    })

    it('should throw error when blockchain query fails', async () => {
      mockPublicClient.readContract.mockRejectedValue(new Error('Network error'))

      await expect(checkNftBalanceOnChain(mockWalletAddress)).rejects.toThrow(
        'Failed to verify NFT ownership on blockchain'
      )
    })

    it('should handle large balances correctly', async () => {
      const largeBalance = 1000
      mockPublicClient.readContract.mockResolvedValue(BigInt(largeBalance))

      const balance = await checkNftBalanceOnChain(mockWalletAddress)

      expect(balance).toBe(largeBalance)
    })
  })

  describe('getCachedVerification', () => {
    it('should return cached verification when valid', async () => {
      const now = new Date()
      const futureDate = new Date(now.getTime() + 1000 * 60 * 60) // 1 hour future

      const mockData = {
        wallet_address: mockWalletAddress.toLowerCase(),
        nft_balance: 2,
        verified_at: now.toISOString(),
        expires_at: futureDate.toISOString(),
      }

      mockSupabase.single.mockResolvedValue({ data: mockData, error: null })

      const result = await getCachedVerification(mockSupabase, mockUserId, mockWalletAddress)

      expect(result).toBeDefined()
      expect(result?.balance).toBe(2)
      expect(result?.wallet_address).toBe(mockWalletAddress.toLowerCase())
      expect(mockSupabase.from).toHaveBeenCalledWith('nft_verifications')
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
    })

    it('should return null when cache expired', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } })

      const result = await getCachedVerification(mockSupabase, mockUserId, mockWalletAddress)

      expect(result).toBeNull()
    })

    it('should return null when no cache exists', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })

      const result = await getCachedVerification(mockSupabase, mockUserId, mockWalletAddress)

      expect(result).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Database connection failed'))

      const result = await getCachedVerification(mockSupabase, mockUserId, mockWalletAddress)

      expect(result).toBeNull()
    })
  })

  describe('cacheVerification', () => {
    it('should successfully cache verification result', async () => {
      mockSupabase.upsert.mockResolvedValue({ error: null })

      await expect(
        cacheVerification(mockSupabase, mockUserId, mockWalletAddress, 5)
      ).resolves.not.toThrow()

      expect(mockSupabase.from).toHaveBeenCalledWith('nft_verifications')
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          wallet_address: mockWalletAddress.toLowerCase(),
          nft_balance: 5,
        }),
        { onConflict: 'user_id,wallet_address' }
      )
    })

    it('should cache zero balance correctly', async () => {
      mockSupabase.upsert.mockResolvedValue({ error: null })

      await cacheVerification(mockSupabase, mockUserId, mockWalletAddress, 0)

      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          nft_balance: 0,
        }),
        expect.any(Object)
      )
    })

    it('should throw error when caching fails', async () => {
      mockSupabase.upsert.mockResolvedValue({ error: { message: 'Insert failed' } })

      await expect(
        cacheVerification(mockSupabase, mockUserId, mockWalletAddress, 3)
      ).rejects.toThrow()
    })

    it('should normalize wallet address to lowercase', async () => {
      const upperCaseWallet = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12'
      mockSupabase.upsert.mockResolvedValue({ error: null })

      await cacheVerification(mockSupabase, mockUserId, upperCaseWallet, 1)

      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet_address: upperCaseWallet.toLowerCase(),
        }),
        expect.any(Object)
      )
    })
  })

  describe('updateUserNftStatus', () => {
    it('should update user NFT holder status to true', async () => {
      mockSupabase.update.mockResolvedValue({ error: null })

      await expect(updateUserNftStatus(mockSupabase, mockUserId, true)).resolves.not.toThrow()

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockSupabase.update).toHaveBeenCalledWith({ nft_holder: true })
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockUserId)
    })

    it('should update user NFT holder status to false', async () => {
      mockSupabase.update.mockResolvedValue({ error: null })

      await updateUserNftStatus(mockSupabase, mockUserId, false)

      expect(mockSupabase.update).toHaveBeenCalledWith({ nft_holder: false })
    })

    it('should throw error when update fails', async () => {
      mockSupabase.update.mockResolvedValue({ error: { message: 'Update failed' } })

      await expect(updateUserNftStatus(mockSupabase, mockUserId, true)).rejects.toThrow(
        'Failed to update user NFT holder status'
      )
    })
  })

  describe('verifyNftOwnership', () => {
    beforeEach(() => {
      // Mock successful cache and update operations
      mockSupabase.upsert.mockResolvedValue({ error: null })
      mockSupabase.update.mockResolvedValue({ error: null })
    })

    it('should use cached result when available and not forcing refresh', async () => {
      const now = new Date()
      const futureDate = new Date(now.getTime() + 1000 * 60 * 60)

      mockSupabase.single.mockResolvedValue({
        data: {
          wallet_address: mockWalletAddress.toLowerCase(),
          nft_balance: 3,
          verified_at: now.toISOString(),
          expires_at: futureDate.toISOString(),
        },
        error: null,
      })

      const result = await verifyNftOwnership(mockSupabase, mockUserId, mockWalletAddress, false)

      expect(result.cached).toBe(true)
      expect(result.nft_holder).toBe(true)
      expect(result.balance).toBe(3)
      expect(mockPublicClient.readContract).not.toHaveBeenCalled()
    })

    it('should query blockchain when cache not available', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(5))

      const result = await verifyNftOwnership(mockSupabase, mockUserId, mockWalletAddress, false)

      expect(result.cached).toBe(false)
      expect(result.nft_holder).toBe(true)
      expect(result.balance).toBe(5)
      expect(mockPublicClient.readContract).toHaveBeenCalled()
      expect(mockSupabase.upsert).toHaveBeenCalled()
      expect(mockSupabase.update).toHaveBeenCalled()
    })

    it('should query blockchain when forceRefresh is true', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          wallet_address: mockWalletAddress.toLowerCase(),
          nft_balance: 3,
          verified_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        },
        error: null,
      })
      mockPublicClient.readContract.mockResolvedValue(BigInt(7))

      const result = await verifyNftOwnership(
        mockSupabase,
        mockUserId,
        mockWalletAddress,
        true // Force refresh
      )

      expect(result.cached).toBe(false)
      expect(result.balance).toBe(7)
      expect(mockPublicClient.readContract).toHaveBeenCalled()
    })

    it('should correctly identify non-NFT holder (zero balance)', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(0))

      const result = await verifyNftOwnership(mockSupabase, mockUserId, mockWalletAddress, false)

      expect(result.nft_holder).toBe(false)
      expect(result.balance).toBe(0)
      expect(mockSupabase.update).toHaveBeenCalledWith({ nft_holder: false })
    })

    it('should handle blockchain errors', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })
      mockPublicClient.readContract.mockRejectedValue(new Error('RPC error'))

      await expect(
        verifyNftOwnership(mockSupabase, mockUserId, mockWalletAddress, false)
      ).rejects.toThrow()
    })

    it('should set correct expiration time (24 hours)', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(1))

      const beforeTime = Date.now()
      const result = await verifyNftOwnership(mockSupabase, mockUserId, mockWalletAddress, false)
      const afterTime = Date.now()

      const expiresAt = new Date(result.expires_at!).getTime()
      const expectedExpiry = beforeTime + 24 * 60 * 60 * 1000

      expect(expiresAt).toBeGreaterThanOrEqual(expectedExpiry)
      expect(expiresAt).toBeLessThanOrEqual(afterTime + 24 * 60 * 60 * 1000)
    })
  })

  describe('cleanupExpiredVerifications', () => {
    it('should delete expired verifications', async () => {
      const mockDeletedRecords = [{ id: '1' }, { id: '2' }, { id: '3' }]

      mockSupabase.select.mockResolvedValue({
        data: mockDeletedRecords,
        error: null,
      })

      const count = await cleanupExpiredVerifications(mockSupabase)

      expect(count).toBe(3)
      expect(mockSupabase.from).toHaveBeenCalledWith('nft_verifications')
      expect(mockSupabase.delete).toHaveBeenCalled()
      expect(mockSupabase.lt).toHaveBeenCalledWith('expires_at', expect.any(String))
    })

    it('should return 0 when no expired verifications exist', async () => {
      mockSupabase.select.mockResolvedValue({ data: [], error: null })

      const count = await cleanupExpiredVerifications(mockSupabase)

      expect(count).toBe(0)
    })

    it('should handle deletion errors gracefully', async () => {
      mockSupabase.select.mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      })

      const count = await cleanupExpiredVerifications(mockSupabase)

      expect(count).toBe(0)
    })

    it('should handle database exceptions', async () => {
      mockSupabase.select.mockRejectedValue(new Error('Database error'))

      const count = await cleanupExpiredVerifications(mockSupabase)

      expect(count).toBe(0)
    })
  })

  describe('Edge Cases and Integration', () => {
    it('should handle concurrent verification requests', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })
      mockSupabase.upsert.mockResolvedValue({ error: null })
      mockSupabase.update.mockResolvedValue({ error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(1))

      const promises = [
        verifyNftOwnership(mockSupabase, mockUserId, mockWalletAddress, false),
        verifyNftOwnership(mockSupabase, mockUserId, mockWalletAddress, false),
        verifyNftOwnership(mockSupabase, mockUserId, mockWalletAddress, false),
      ]

      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result.verified).toBe(true)
        expect(result.nft_holder).toBe(true)
      })
    })

    it('should handle wallet address case insensitivity', async () => {
      const lowerCaseWallet = '0xabcdef1234567890abcdef1234567890abcdef12'
      const upperCaseWallet = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12'
      const mixedCaseWallet = '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12'

      mockSupabase.single.mockResolvedValue({ data: null, error: null })
      mockSupabase.upsert.mockResolvedValue({ error: null })
      mockSupabase.update.mockResolvedValue({ error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(1))

      await verifyNftOwnership(mockSupabase, 'user1', lowerCaseWallet, false)
      await verifyNftOwnership(mockSupabase, 'user2', upperCaseWallet, false)
      await verifyNftOwnership(mockSupabase, 'user3', mixedCaseWallet, false)

      // All should be normalized to lowercase
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet_address: lowerCaseWallet.toLowerCase(),
        }),
        expect.any(Object)
      )
    })
  })
})
