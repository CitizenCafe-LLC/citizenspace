/**
 * GET /api/auth/verify-nft
 *
 * Verifies NFT ownership for the authenticated user's connected wallet.
 * Returns cached results if available, otherwise queries the blockchain.
 *
 * Query Parameters:
 * - force_refresh: boolean - bypass cache and check on-chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyNftOwnership } from '@/lib/web3/nft-verification';
import { executeQuerySingle } from '@/lib/db/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          verified: false,
          nft_holder: false,
          balance: 0,
          cached: false,
          message: 'Unauthorized - please login first',
        },
        { status: 401 }
      );
    }

    // Get user's wallet address from database
    const { data: userData, error: userError } = await executeQuerySingle<{
      wallet_address: string;
    }>(
      'SELECT wallet_address FROM users WHERE id = $1',
      [session.user.id]
    );

    if (userError || !userData) {
      return NextResponse.json(
        {
          verified: false,
          nft_holder: false,
          balance: 0,
          cached: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const walletAddress = userData.wallet_address;

    if (!walletAddress) {
      return NextResponse.json(
        {
          verified: false,
          nft_holder: false,
          balance: 0,
          cached: false,
          message: 'No wallet connected to this account',
        },
        { status: 400 }
      );
    }

    // Check for force refresh parameter
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('force_refresh') === 'true';

    // Verify NFT ownership
    const verification = await verifyNftOwnership(
      session.user.id,
      walletAddress,
      forceRefresh
    );

    return NextResponse.json(verification, { status: 200 });
  } catch (error) {
    console.error('Error in verify-nft endpoint:', error);
    return NextResponse.json(
      {
        verified: false,
        nft_holder: false,
        balance: 0,
        cached: false,
        message: 'Failed to verify NFT ownership',
      },
      { status: 500 }
    );
  }
}

// POST endpoint to disconnect wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action !== 'disconnect') {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { executeQuery } = await import('@/lib/db/postgres');

    // Remove wallet address and update NFT holder status
    const { error: updateError } = await executeQuery(
      `UPDATE users
       SET wallet_address = NULL,
           nft_holder = false,
           updated_at = NOW()
       WHERE id = $1`,
      [session.user.id]
    );

    if (updateError) {
      console.error('Error disconnecting wallet:', updateError);
      return NextResponse.json(
        { message: 'Failed to disconnect wallet' },
        { status: 500 }
      );
    }

    // Delete cached verifications for this user
    await executeQuery(
      'DELETE FROM nft_verifications WHERE user_id = $1',
      [session.user.id]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Wallet disconnected successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}