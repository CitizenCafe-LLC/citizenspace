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

// Mock postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
}))

describe('NFT Verification Service', () => {
  const mockWalletAddress = '0x1234567890123456789012345678901234567890'
  const mockUserId = 'user-123'

  let mockPublicClient: any
  let mockExecuteQuery: jest.Mock
  let mockExecuteQuerySingle: jest.Mock

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock Viem public client
    mockPublicClient = {
      readContract: jest.fn(),
    }
    ;(createPublicClient as jest.Mock).mockReturnValue(mockPublicClient)

    // Get mocked postgres functions
    const postgres = require('@/lib/db/postgres')
    mockExecuteQuery = postgres.executeQuery as jest.Mock
    mockExecuteQuerySingle = postgres.executeQuerySingle as jest.Mock

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

      mockExecuteQuerySingle.mockResolvedValue({ data: mockData, error: null })

      const result = await getCachedVerification(mockUserId, mockWalletAddress)

      expect(result).toBeDefined()
      expect(result?.balance).toBe(2)
      expect(result?.wallet_address).toBe(mockWalletAddress.toLowerCase())
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('SELECT wallet_address, nft_balance, verified_at, expires_at'),
        [mockUserId, mockWalletAddress.toLowerCase()]
      )
    })

    it('should return null when cache expired', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: 'Not found' })

      const result = await getCachedVerification(mockUserId, mockWalletAddress)

      expect(result).toBeNull()
    })

    it('should return null when no cache exists', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })

      const result = await getCachedVerification(mockUserId, mockWalletAddress)

      expect(result).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      mockExecuteQuerySingle.mockRejectedValue(new Error('Database connection failed'))

      const result = await getCachedVerification(mockUserId, mockWalletAddress)

      expect(result).toBeNull()
    })
  })

  describe('cacheVerification', () => {
    it('should successfully cache verification result', async () => {
      mockExecuteQuery.mockResolvedValue({ error: null })

      await expect(
        cacheVerification(mockUserId, mockWalletAddress, 5)
      ).resolves.not.toThrow()

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO nft_verifications'),
        expect.arrayContaining([
          mockUserId,
          mockWalletAddress.toLowerCase(),
          5,
          expect.any(String),
          expect.any(String),
          expect.any(String),
        ])
      )
    })

    it('should cache zero balance correctly', async () => {
      mockExecuteQuery.mockResolvedValue({ error: null })

      await cacheVerification(mockUserId, mockWalletAddress, 0)

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO nft_verifications'),
        expect.arrayContaining([
          mockUserId,
          mockWalletAddress.toLowerCase(),
          0,
          expect.any(String),
          expect.any(String),
          expect.any(String),
        ])
      )
    })

    it('should throw error when caching fails', async () => {
      mockExecuteQuery.mockResolvedValue({ error: 'Insert failed' })

      await expect(
        cacheVerification(mockUserId, mockWalletAddress, 3)
      ).rejects.toThrow('Failed to cache verification result')
    })

    it('should normalize wallet address to lowercase', async () => {
      const upperCaseWallet = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12'
      mockExecuteQuery.mockResolvedValue({ error: null })

      await cacheVerification(mockUserId, upperCaseWallet, 1)

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO nft_verifications'),
        expect.arrayContaining([
          mockUserId,
          upperCaseWallet.toLowerCase(),
          1,
          expect.any(String),
          expect.any(String),
          expect.any(String),
        ])
      )
    })
  })

  describe('updateUserNftStatus', () => {
    it('should update user NFT holder status to true', async () => {
      mockExecuteQuery.mockResolvedValue({ error: null })

      await expect(updateUserNftStatus(mockUserId, true)).resolves.not.toThrow()

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [true, mockUserId]
      )
    })

    it('should update user NFT holder status to false', async () => {
      mockExecuteQuery.mockResolvedValue({ error: null })

      await updateUserNftStatus(mockUserId, false)

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [false, mockUserId]
      )
    })

    it('should throw error when update fails', async () => {
      mockExecuteQuery.mockResolvedValue({ error: 'Update failed' })

      await expect(updateUserNftStatus(mockUserId, true)).rejects.toThrow(
        'Failed to update user NFT holder status'
      )
    })
  })

  describe('verifyNftOwnership', () => {
    beforeEach(() => {
      // Mock successful cache and update operations
      mockExecuteQuery.mockResolvedValue({ error: null })
    })

    it('should use cached result when available and not forcing refresh', async () => {
      const now = new Date()
      const futureDate = new Date(now.getTime() + 1000 * 60 * 60)

      mockExecuteQuerySingle.mockResolvedValue({
        data: {
          wallet_address: mockWalletAddress.toLowerCase(),
          nft_balance: 3,
          verified_at: now.toISOString(),
          expires_at: futureDate.toISOString(),
        },
        error: null,
      })

      const result = await verifyNftOwnership(mockUserId, mockWalletAddress, false)

      expect(result.cached).toBe(true)
      expect(result.nft_holder).toBe(true)
      expect(result.balance).toBe(3)
      expect(mockPublicClient.readContract).not.toHaveBeenCalled()
    })

    it('should query blockchain when cache not available', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(5))

      const result = await verifyNftOwnership(mockUserId, mockWalletAddress, false)

      expect(result.cached).toBe(false)
      expect(result.nft_holder).toBe(true)
      expect(result.balance).toBe(5)
      expect(mockPublicClient.readContract).toHaveBeenCalled()
      expect(mockExecuteQuery).toHaveBeenCalled()
    })

    it('should query blockchain when forceRefresh is true', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
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
        mockUserId,
        mockWalletAddress,
        true // Force refresh
      )

      expect(result.cached).toBe(false)
      expect(result.balance).toBe(7)
      expect(mockPublicClient.readContract).toHaveBeenCalled()
    })

    it('should correctly identify non-NFT holder (zero balance)', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(0))

      const result = await verifyNftOwnership(mockUserId, mockWalletAddress, false)

      expect(result.nft_holder).toBe(false)
      expect(result.balance).toBe(0)
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [false, mockUserId]
      )
    })

    it('should handle blockchain errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })
      mockPublicClient.readContract.mockRejectedValue(new Error('RPC error'))

      await expect(
        verifyNftOwnership(mockUserId, mockWalletAddress, false)
      ).rejects.toThrow()
    })

    it('should set correct expiration time (24 hours)', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(1))

      const beforeTime = Date.now()
      const result = await verifyNftOwnership(mockUserId, mockWalletAddress, false)
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

      mockExecuteQuery.mockResolvedValue({
        data: mockDeletedRecords,
        error: null,
      })

      const count = await cleanupExpiredVerifications()

      expect(count).toBe(3)
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM nft_verifications'),
        []
      )
    })

    it('should return 0 when no expired verifications exist', async () => {
      mockExecuteQuery.mockResolvedValue({ data: [], error: null })

      const count = await cleanupExpiredVerifications()

      expect(count).toBe(0)
    })

    it('should handle deletion errors gracefully', async () => {
      mockExecuteQuery.mockResolvedValue({
        data: null,
        error: 'Delete failed',
      })

      const count = await cleanupExpiredVerifications()

      expect(count).toBe(0)
    })

    it('should handle database exceptions', async () => {
      mockExecuteQuery.mockRejectedValue(new Error('Database error'))

      const count = await cleanupExpiredVerifications()

      expect(count).toBe(0)
    })
  })

  describe('Edge Cases and Integration', () => {
    it('should handle concurrent verification requests', async () => {
      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })
      mockExecuteQuery.mockResolvedValue({ error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(1))

      const promises = [
        verifyNftOwnership(mockUserId, mockWalletAddress, false),
        verifyNftOwnership(mockUserId, mockWalletAddress, false),
        verifyNftOwnership(mockUserId, mockWalletAddress, false),
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

      mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })
      mockExecuteQuery.mockResolvedValue({ error: null })
      mockPublicClient.readContract.mockResolvedValue(BigInt(1))

      await verifyNftOwnership('user1', lowerCaseWallet, false)
      await verifyNftOwnership('user2', upperCaseWallet, false)
      await verifyNftOwnership('user3', mixedCaseWallet, false)

      // All should be normalized to lowercase
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO nft_verifications'),
        expect.arrayContaining([
          expect.any(String),
          lowerCaseWallet.toLowerCase(),
          expect.any(Number),
          expect.any(String),
          expect.any(String),
          expect.any(String),
        ])
      )
    })
  })

  describe('Additional Coverage Tests', () => {
    describe('getPublicClient', () => {
      it('should create client for mainnet chain', async () => {
        process.env.NEXT_PUBLIC_CHAIN = 'mainnet'
        mockPublicClient.readContract.mockResolvedValue(BigInt(1))

        await checkNftBalanceOnChain(mockWalletAddress)

        expect(createPublicClient).toHaveBeenCalled()
      })

      it('should create client for base chain', async () => {
        process.env.NEXT_PUBLIC_CHAIN = 'base'
        mockPublicClient.readContract.mockResolvedValue(BigInt(1))

        await checkNftBalanceOnChain(mockWalletAddress)

        expect(createPublicClient).toHaveBeenCalled()
      })

      it('should create client for base-sepolia chain', async () => {
        process.env.NEXT_PUBLIC_CHAIN = 'base-sepolia'
        mockPublicClient.readContract.mockResolvedValue(BigInt(1))

        await checkNftBalanceOnChain(mockWalletAddress)

        expect(createPublicClient).toHaveBeenCalled()
      })

      it('should default to sepolia for unknown chain', async () => {
        process.env.NEXT_PUBLIC_CHAIN = 'unknown-chain'
        mockPublicClient.readContract.mockResolvedValue(BigInt(1))

        await checkNftBalanceOnChain(mockWalletAddress)

        expect(createPublicClient).toHaveBeenCalled()
      })
    })

    describe('Cache expiration logic', () => {
      it('should set expiration to 24 hours from now', async () => {
        mockExecuteQuery.mockResolvedValue({ error: null })

        const before = Date.now()
        await cacheVerification(mockUserId, mockWalletAddress, 5)
        const after = Date.now()

        const [[query, params]] = mockExecuteQuery.mock.calls
        const expiresAt = new Date(params[4]).getTime()
        const expectedMin = before + 24 * 60 * 60 * 1000
        const expectedMax = after + 24 * 60 * 60 * 1000

        expect(expiresAt).toBeGreaterThanOrEqual(expectedMin)
        expect(expiresAt).toBeLessThanOrEqual(expectedMax)
      })
    })

    describe('Error handling edge cases', () => {
      it('should handle null balance from blockchain', async () => {
        mockPublicClient.readContract.mockResolvedValue(null)

        const balance = await checkNftBalanceOnChain(mockWalletAddress)

        expect(balance).toBe(0)
      })

      it('should throw when cacheVerification encounters exception', async () => {
        mockExecuteQuery.mockRejectedValue(new Error('Network timeout'))

        await expect(
          cacheVerification(mockUserId, mockWalletAddress, 3)
        ).rejects.toThrow()
      })

      it('should throw when updateUserNftStatus encounters exception', async () => {
        mockExecuteQuery.mockRejectedValue(new Error('Connection lost'))

        await expect(
          updateUserNftStatus(mockUserId, true)
        ).rejects.toThrow()
      })
    })

    describe('verifyNftOwnership complete flow', () => {
      it('should successfully complete full verification with all database updates', async () => {
        mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })
        mockExecuteQuery.mockResolvedValue({ error: null })
        mockPublicClient.readContract.mockResolvedValue(BigInt(2))

        const result = await verifyNftOwnership(mockUserId, mockWalletAddress, false)

        expect(result.verified).toBe(true)
        expect(result.nft_holder).toBe(true)
        expect(result.balance).toBe(2)
        expect(result.cached).toBe(false)
        expect(result.verified_at).toBeDefined()
        expect(result.expires_at).toBeDefined()

        // Verify all database operations were called
        expect(mockExecuteQuerySingle).toHaveBeenCalledTimes(1) // getCachedVerification
        expect(mockExecuteQuery).toHaveBeenCalledTimes(2) // cacheVerification + updateUserNftStatus
      })

      it('should handle caching failure but still return result', async () => {
        mockExecuteQuerySingle.mockResolvedValue({ data: null, error: null })
        mockPublicClient.readContract.mockResolvedValue(BigInt(3))
        mockExecuteQuery
          .mockResolvedValueOnce({ error: 'Cache write failed' })
          .mockResolvedValueOnce({ error: null })

        await expect(
          verifyNftOwnership(mockUserId, mockWalletAddress, false)
        ).rejects.toThrow()
      })
    })
  })
})
