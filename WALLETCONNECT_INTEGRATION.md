# WalletConnect Integration for CitizenSpace NFT Authentication

## Overview

CitizenSpace uses WalletConnect (via RainbowKit) to allow users to connect their crypto wallets and verify NFT ownership for accessing discounted services.

## Architecture

### Frontend (Client-Side)

- **RainbowKit**: Wallet connection UI
- **Wagmi**: React hooks for Ethereum
- **Viem**: Ethereum client library
- **TanStack Query**: Data fetching and caching

### Backend (Server-Side)

- **PostgreSQL**: User and NFT verification storage
- **Viem**: Blockchain queries (balanceOf calls)
- **NFT Contract**: ERC-721/1155 token verification

## Configuration

### Environment Variables

```bash
# WalletConnect Project ID (Required)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=f6274007f91e59537205739c6ed92475

# NFT Contract Configuration
NEXT_PUBLIC_CHAIN=base  # or mainnet, sepolia, base-sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Your NFT contract address
NEXT_PUBLIC_RPC_URL=https://...  # Optional: Custom RPC endpoint
```

**Get your WalletConnect Project ID:**

1. Visit https://cloud.walletconnect.com (now Reown)
2. Create a free project
3. Copy your Project ID

### Supported Networks

- **Production**: Ethereum Mainnet, Base
- **Testing**: Sepolia, Base Sepolia

## Files Structure

```
/lib/web3/
├── wagmi.ts                    # Wagmi configuration
├── contract.ts                 # NFT contract ABI and address
├── nft-verification.ts         # NFT ownership verification logic
└── types.ts                    # TypeScript interfaces

/components/providers/
└── web3-provider.tsx           # React context for Web3

/app/api/auth/
├── verify-nft/route.ts         # NFT verification endpoint
└── wallet-connect/route.ts     # Wallet connection endpoint

/supabase/migrations/
└── *_initial_schema.sql        # nft_verifications table
```

## How It Works

### 1. Wallet Connection Flow

```
User clicks "Connect Wallet"
    ↓
RainbowKit modal opens
    ↓
User selects wallet (MetaMask, Coinbase, etc.)
    ↓
Wallet prompts for connection approval
    ↓
Frontend receives wallet address
    ↓
POST /api/auth/wallet-connect { address }
    ↓
Server stores wallet_address in users table
```

### 2. NFT Verification Flow

```
User authenticated & wallet connected
    ↓
GET /api/auth/verify-nft
    ↓
Server checks cache (nft_verifications table)
    ↓
If cache valid (< 24hrs): Return cached result
    ↓
If cache expired or missing:
    ├── Query blockchain: contract.balanceOf(walletAddress)
    ├── Cache result for 24 hours
    └── Update users.nft_holder flag
    ↓
Return { verified, nft_holder, balance, cached }
```

### 3. Discount Application

```
User makes booking/purchase
    ↓
Check session.user.nft_holder flag
    ↓
If true: Apply 50% workspace discount, 10% cafe discount
    ↓
Calculate final price
    ↓
Process payment
```

## Database Schema

### users table

```sql
ALTER TABLE users ADD COLUMN wallet_address VARCHAR(42);
ALTER TABLE users ADD COLUMN nft_holder BOOLEAN DEFAULT false;
```

### nft_verifications table

```sql
CREATE TABLE nft_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  nft_balance INTEGER NOT NULL DEFAULT 0,
  verified_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wallet_address)
);

CREATE INDEX idx_nft_verifications_user ON nft_verifications(user_id);
CREATE INDEX idx_nft_verifications_expires ON nft_verifications(expires_at);
```

## API Endpoints

### GET /api/auth/verify-nft

**Purpose**: Verify NFT ownership for authenticated user

**Query Parameters**:

- `force_refresh` (boolean): Bypass cache and check blockchain

**Response**:

```json
{
  "verified": true,
  "nft_holder": true,
  "balance": 1,
  "cached": false,
  "verified_at": "2025-01-15T10:30:00Z",
  "expires_at": "2025-01-16T10:30:00Z"
}
```

**Status Codes**:

- 200: Success
- 401: Unauthorized (not logged in)
- 400: No wallet connected
- 404: User not found
- 500: Server error

### POST /api/auth/verify-nft

**Purpose**: Disconnect wallet from user account

**Body**:

```json
{
  "action": "disconnect"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Wallet disconnected successfully"
}
```

### POST /api/auth/wallet-connect

**Purpose**: Connect wallet to user account

**Body**:

```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Wallet connected successfully"
}
```

## Frontend Integration

### 1. Wrap App with Web3Provider

```tsx
// app/layout.tsx
import { Web3Provider } from '@/components/providers/web3-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
```

### 2. Add Connect Button

```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header>
      <nav>
        {/* Your nav items */}
        <ConnectButton />
      </nav>
    </header>
  )
}
```

### 3. Use Wallet in Components

```tsx
import { useAccount, useBalance } from 'wagmi'

export function NFTStatus() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  return <div>{isConnected ? <p>Connected: {address}</p> : <ConnectButton />}</div>
}
```

### 4. Verify NFT Ownership

```tsx
async function verifyNFT() {
  const response = await fetch('/api/auth/verify-nft')
  const data = await response.json()

  if (data.nft_holder) {
    console.log('User holds NFT! Applying discounts...')
  }
}
```

## NFT Contract Setup

### contract.ts Example

```typescript
export const CITIZEN_SPACE_NFT_CONTRACT = {
  address: '0x...' as `0x${string}`,
  abi: [
    {
      inputs: [{ name: 'owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
}
```

## Caching Strategy

- **Cache Duration**: 24 hours
- **Cache Key**: `(user_id, wallet_address)`
- **Cache Invalidation**: Manual via `force_refresh=true` or wallet disconnect
- **Cleanup**: Expired entries should be removed daily (cron job)

## Security Considerations

1. **Signature Verification**: Consider adding signature verification to prove wallet ownership
2. **Rate Limiting**: Implement rate limits on blockchain queries
3. **Cache Poisoning**: Validate wallet addresses before caching
4. **Session Security**: Ensure wallet_address in session matches database
5. **RPC Endpoint**: Use reliable RPC providers (Alchemy, Infura) for production

## Discount Logic

### Workspace Services (50% off)

```typescript
const basePrice = workspace.hourly_rate * duration
const discount = user.nft_holder ? basePrice * 0.5 : 0
const finalPrice = basePrice - discount
```

### Cafe Items (10% off)

```typescript
const subtotal = items.reduce((sum, item) => sum + item.price, 0)
const discount = user.nft_holder ? subtotal * 0.1 : 0
const total = subtotal - discount
```

## Testing

### Test on Sepolia Testnet

1. Deploy test NFT contract to Sepolia
2. Mint test NFTs to your wallet
3. Connect wallet on dev environment
4. Verify NFT detection works

### Manual Testing Checklist

- [ ] Connect wallet (MetaMask)
- [ ] Verify NFT ownership endpoint returns correct balance
- [ ] Disconnect wallet
- [ ] Reconnect and verify cache works
- [ ] Force refresh bypasses cache
- [ ] Discounts apply correctly in booking flow

## Troubleshooting

### "No projectId found" Error

**Fix**: Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in `.env.local`

### NFT Balance Shows 0 (but you own NFTs)

**Possible causes**:

1. Wrong network selected (check NEXT_PUBLIC_CHAIN)
2. Wrong contract address
3. RPC endpoint issues
4. Wallet address mismatch

**Fix**: Check logs for blockchain query errors

### Cache Not Updating

**Fix**: Call `/api/auth/verify-nft?force_refresh=true`

## Production Deployment

### Pre-Launch Checklist

- [ ] Deploy NFT contract to mainnet
- [ ] Update `NEXT_PUBLIC_CONTRACT_ADDRESS`
- [ ] Set `NEXT_PUBLIC_CHAIN=mainnet` or `base`
- [ ] Configure production RPC endpoint
- [ ] Test wallet connection on production
- [ ] Verify discount logic works end-to-end
- [ ] Set up cache cleanup cron job
- [ ] Monitor blockchain query costs

## Future Enhancements

1. **Multi-Chain Support**: Verify NFTs across multiple chains
2. **Signature Login**: Web3-only authentication (no email/password)
3. **NFT Gating**: Require NFT ownership to access certain features
4. **Tiered Benefits**: Different discounts based on NFT traits/rarity
5. **NFT Staking**: Additional benefits for staked NFTs
6. **Analytics**: Track NFT holder engagement and conversion

## Support Resources

- **WalletConnect Docs**: https://docs.walletconnect.com
- **RainbowKit Docs**: https://www.rainbowkit.com/docs
- **Wagmi Docs**: https://wagmi.sh
- **Viem Docs**: https://viem.sh

## License

This integration is part of CitizenSpace proprietary codebase.
