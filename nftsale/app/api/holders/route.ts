import { NextResponse } from 'next/server';

// In production, store in database
const holders = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const { walletAddress, nftCount, transactionHash } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Store holder information
    holders.set(walletAddress.toLowerCase(), {
      walletAddress,
      nftCount,
      transactionHash,
      firstMintedAt: holders.get(walletAddress.toLowerCase())?.firstMintedAt || new Date(),
      lastUpdated: new Date(),
    });

    // In production:
    // 1. Verify on-chain that the wallet actually owns the NFTs
    // 2. Store in database with proper indexing
    // 3. Trigger Discord role assignment
    // 4. Send welcome email if first time
    // 5. Update analytics

    console.log('Holder updated:', {
      walletAddress,
      nftCount,
      totalHolders: holders.size,
    });

    return NextResponse.json({
      success: true,
      message: 'Holder information updated',
      isNewHolder: !holders.has(walletAddress.toLowerCase()),
    });
  } catch (error) {
    console.error('Holder update error:', error);
    return NextResponse.json(
      { error: 'Failed to update holder information' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');

  if (walletAddress) {
    const holder = holders.get(walletAddress.toLowerCase());
    if (!holder) {
      return NextResponse.json(
        { error: 'Holder not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(holder);
  }

  // Return stats (in production, protect with auth)
  return NextResponse.json({
    totalHolders: holders.size,
    holders: Array.from(holders.values()).map(h => ({
      ...h,
      walletAddress: `${h.walletAddress.slice(0, 6)}...${h.walletAddress.slice(-4)}`,
    })),
  });
}