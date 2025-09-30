/**
 * NFT Verification Service
 *
 * Handles on-chain verification of NFT ownership with caching.
 * Uses Viem to query the blockchain and Supabase for caching results.
 */

import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, sepolia, baseSepolia } from 'viem/chains';
import { CITIZEN_SPACE_NFT_CONTRACT } from './contract';
import { NftVerification, NftVerificationResponse, NftVerificationCache } from './types';

// Cache TTL in milliseconds (24 hours)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Creates a public client for reading from the blockchain
 */
function getPublicClient() {
  // Determine chain based on environment
  const chain = process.env.NEXT_PUBLIC_CHAIN === 'mainnet'
    ? mainnet
    : process.env.NEXT_PUBLIC_CHAIN === 'base'
    ? base
    : process.env.NEXT_PUBLIC_CHAIN === 'base-sepolia'
    ? baseSepolia
    : sepolia;

  return createPublicClient({
    chain,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL),
  });
}

/**
 * Queries the blockchain to check NFT balance for a wallet address
 *
 * @param walletAddress - Ethereum wallet address to check
 * @returns Promise resolving to NFT balance
 */
export async function checkNftBalanceOnChain(walletAddress: string): Promise<number> {
  try {
    const client = getPublicClient();

    // Call the balanceOf function on the NFT contract
    const balance = await client.readContract({
      address: CITIZEN_SPACE_NFT_CONTRACT.address,
      abi: CITIZEN_SPACE_NFT_CONTRACT.abi,
      functionName: 'balanceOf',
      args: [walletAddress as Address],
    });

    return Number(balance);
  } catch (error) {
    console.error('Error checking NFT balance on-chain:', error);
    throw new Error('Failed to verify NFT ownership on blockchain');
  }
}

/**
 * Retrieves cached NFT verification from database
 *
 * @param userId - User ID to check
 * @param walletAddress - Wallet address to check
 * @returns Cached verification if valid, null otherwise
 */
export async function getCachedVerification(
  userId: string,
  walletAddress: string
): Promise<NftVerificationCache | null> {
  try {
    const { executeQuerySingle } = await import('../db/postgres');

    const query = `
      SELECT wallet_address, nft_balance, verified_at, expires_at
      FROM nft_verifications
      WHERE user_id = $1
        AND wallet_address = $2
        AND expires_at > NOW()
    `;

    const { data, error } = await executeQuerySingle<{
      wallet_address: string;
      nft_balance: number;
      verified_at: string;
      expires_at: string;
    }>(query, [userId, walletAddress.toLowerCase()]);

    if (error || !data) {
      return null;
    }

    return {
      wallet_address: data.wallet_address,
      balance: data.nft_balance,
      verified_at: new Date(data.verified_at),
      expires_at: new Date(data.expires_at),
    };
  } catch (error) {
    console.error('Error retrieving cached verification:', error);
    return null;
  }
}

/**
 * Saves NFT verification to database cache
 *
 * @param userId - User ID
 * @param walletAddress - Wallet address
 * @param balance - NFT balance
 */
export async function cacheVerification(
  userId: string,
  walletAddress: string,
  balance: number
): Promise<void> {
  try {
    const { executeQuery } = await import('../db/postgres');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

    const query = `
      INSERT INTO nft_verifications (user_id, wallet_address, nft_balance, verified_at, expires_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, wallet_address)
      DO UPDATE SET
        nft_balance = $3,
        verified_at = $4,
        expires_at = $5,
        updated_at = $6
    `;

    const { error } = await executeQuery(query, [
      userId,
      walletAddress.toLowerCase(),
      balance,
      now.toISOString(),
      expiresAt.toISOString(),
      now.toISOString(),
    ]);

    if (error) {
      console.error('Error caching verification:', error);
      throw new Error('Failed to cache verification result');
    }
  } catch (error) {
    console.error('Error in cacheVerification:', error);
    throw error;
  }
}

/**
 * Updates user's NFT holder status in the database
 *
 * @param userId - User ID to update
 * @param isNftHolder - Whether user holds NFTs
 */
export async function updateUserNftStatus(
  userId: string,
  isNftHolder: boolean
): Promise<void> {
  try {
    const { executeQuery } = await import('../db/postgres');

    const query = `
      UPDATE users
      SET nft_holder = $1, updated_at = NOW()
      WHERE id = $2
    `;

    const { error } = await executeQuery(query, [isNftHolder, userId]);

    if (error) {
      console.error('Error updating user NFT status:', error);
      throw new Error('Failed to update user NFT holder status');
    }
  } catch (error) {
    console.error('Error in updateUserNftStatus:', error);
    throw error;
  }
}

/**
 * Verifies NFT ownership for a user, using cache when available
 *
 * @param userId - User ID to verify
 * @param walletAddress - Wallet address to check
 * @param forceRefresh - Whether to bypass cache and check on-chain
 * @returns Verification result with balance and cache status
 */
export async function verifyNftOwnership(
  userId: string,
  walletAddress: string,
  forceRefresh: boolean = false
): Promise<NftVerificationResponse> {
  try {
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cached = await getCachedVerification(userId, walletAddress);
      if (cached) {
        return {
          verified: true,
          nft_holder: cached.balance > 0,
          balance: cached.balance,
          cached: true,
          verified_at: cached.verified_at.toISOString(),
          expires_at: cached.expires_at.toISOString(),
        };
      }
    }

    // Query blockchain for current balance
    const balance = await checkNftBalanceOnChain(walletAddress);
    const isNftHolder = balance > 0;

    // Cache the result
    await cacheVerification(userId, walletAddress, balance);

    // Update user's NFT holder status
    await updateUserNftStatus(userId, isNftHolder);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

    return {
      verified: true,
      nft_holder: isNftHolder,
      balance,
      cached: false,
      verified_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    throw error;
  }
}

/**
 * Cleans up expired verifications from the database
 * Should be run periodically (e.g., daily cron job)
 */
export async function cleanupExpiredVerifications(): Promise<number> {
  try {
    const { executeQuery } = await import('../db/postgres');

    const query = `
      DELETE FROM nft_verifications
      WHERE expires_at < NOW()
      RETURNING id
    `;

    const { data, error } = await executeQuery<{ id: string }>(query, []);

    if (error) {
      console.error('Error cleaning up expired verifications:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in cleanupExpiredVerifications:', error);
    return 0;
  }
}