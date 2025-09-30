/**
 * POST /api/auth/wallet-connect
 *
 * Links a Web3 wallet to a user account and verifies NFT ownership.
 * This endpoint associates a wallet address with the authenticated user
 * and triggers NFT verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyNftOwnership } from '@/lib/web3/nft-verification';
import { WalletConnectRequest, WalletConnectResponse } from '@/lib/web3/types';

/**
 * Validates Ethereum wallet address format
 */
function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: WalletConnectRequest = await request.json();
    const { wallet_address } = body;

    // Validate wallet address
    if (!wallet_address || !isValidWalletAddress(wallet_address)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid wallet address format',
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - please login first',
        },
        { status: 401 }
      );
    }

    // Check if wallet is already connected to another user
    const { data: existingWallet, error: walletCheckError } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('wallet_address', wallet_address.toLowerCase())
      .neq('id', user.id)
      .single();

    if (existingWallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'This wallet is already connected to another account',
        },
        { status: 409 }
      );
    }

    // Update user's wallet address
    const { error: updateError } = await supabase
      .from('users')
      .update({
        wallet_address: wallet_address.toLowerCase(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user wallet:', updateError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to connect wallet',
        },
        { status: 500 }
      );
    }

    // Verify NFT ownership
    let nftHolder = false;
    try {
      const verification = await verifyNftOwnership(
        supabase,
        user.id,
        wallet_address,
        true // Force refresh on initial connection
      );
      nftHolder = verification.nft_holder;
    } catch (error) {
      console.error('Error verifying NFT ownership:', error);
      // Continue even if verification fails - wallet is still connected
    }

    const response: WalletConnectResponse = {
      success: true,
      user_id: user.id,
      nft_holder: nftHolder,
      message: nftHolder
        ? 'Wallet connected successfully! NFT holder benefits activated.'
        : 'Wallet connected successfully.',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in wallet-connect endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

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