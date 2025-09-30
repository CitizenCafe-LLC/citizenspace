/**
 * NFT Holder Middleware
 *
 * Middleware functions to check NFT holder status on protected routes.
 * Can be used in API routes or server components to verify NFT ownership.
 */

import { createRouteHandlerClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface NftHolderCheckResult {
  isNftHolder: boolean;
  userId?: string;
  walletAddress?: string;
  error?: string;
}

/**
 * Checks if the current authenticated user is an NFT holder
 *
 * @param supabase - Optional Supabase client (will create one if not provided)
 * @returns Promise resolving to NFT holder check result
 */
export async function checkNftHolderStatus(
  supabase?: any
): Promise<NftHolderCheckResult> {
  try {
    // Create Supabase client if not provided
    const client = supabase || createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError || !user) {
      return {
        isNftHolder: false,
        error: 'User not authenticated',
      };
    }

    // Get user's NFT holder status from database
    const { data: userData, error: userError } = await client
      .from('users')
      .select('nft_holder, wallet_address')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        isNftHolder: false,
        userId: user.id,
        error: 'User data not found',
      };
    }

    return {
      isNftHolder: userData.nft_holder || false,
      userId: user.id,
      walletAddress: userData.wallet_address,
    };
  } catch (error) {
    console.error('Error checking NFT holder status:', error);
    return {
      isNftHolder: false,
      error: 'Failed to check NFT holder status',
    };
  }
}

/**
 * Middleware function to require NFT holder status for a route
 *
 * Usage in API routes:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const nftCheck = await requireNftHolder(request);
 *   if (nftCheck.error) {
 *     return nftCheck.error;
 *   }
 *   // Continue with protected route logic
 * }
 * ```
 *
 * @param request - Next.js request object
 * @returns Promise resolving to either the NFT check result or error response
 */
export async function requireNftHolder(
  request: NextRequest
): Promise<{ result: NftHolderCheckResult } | { error: NextResponse }> {
  const result = await checkNftHolderStatus();

  if (result.error || !result.isNftHolder) {
    return {
      error: NextResponse.json(
        {
          message: result.error || 'NFT holder access required',
          nft_holder_required: true,
        },
        { status: 403 }
      ),
    };
  }

  return { result };
}

/**
 * Middleware function that allows a route but marks it as NFT-holder eligible
 * Useful for routes that provide different features/pricing based on NFT status
 *
 * @param request - Next.js request object
 * @returns NFT holder check result (never throws)
 */
export async function checkNftHolderOptional(
  request: NextRequest
): Promise<NftHolderCheckResult> {
  const result = await checkNftHolderStatus();
  return result;
}

/**
 * Validates if a cached NFT verification is still valid
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @returns Promise resolving to whether the cache is valid
 */
export async function isNftVerificationCacheValid(
  supabase: any,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('nft_verifications')
      .select('expires_at')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Higher-order function to wrap API route handlers with NFT holder check
 *
 * Usage:
 * ```typescript
 * export const GET = withNftHolderCheck(async (request, nftStatus) => {
 *   // Your route logic here
 *   return NextResponse.json({ data: "..." });
 * });
 * ```
 */
export function withNftHolderCheck(
  handler: (request: NextRequest, nftStatus: NftHolderCheckResult) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const result = await requireNftHolder(request);

    if ('error' in result) {
      return result.error;
    }

    return handler(request, result.result);
  };
}

/**
 * Higher-order function to wrap API route handlers with optional NFT holder check
 * Route is accessible to all, but NFT status is provided to handler
 *
 * Usage:
 * ```typescript
 * export const GET = withOptionalNftCheck(async (request, nftStatus) => {
 *   const discount = nftStatus.isNftHolder ? 0.5 : 0;
 *   // Your route logic here
 * });
 * ```
 */
export function withOptionalNftCheck(
  handler: (request: NextRequest, nftStatus: NftHolderCheckResult) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const nftStatus = await checkNftHolderOptional(request);
    return handler(request, nftStatus);
  };
}