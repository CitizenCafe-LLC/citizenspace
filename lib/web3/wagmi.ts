/**
 * Wagmi Configuration for CitizenSpace
 *
 * This configuration sets up the Web3 provider with RainbowKit and Wagmi,
 * enabling wallet connections and blockchain interactions.
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, base, baseSepolia } from 'wagmi/chains'

// WalletConnect Project ID from environment variables
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!WALLETCONNECT_PROJECT_ID) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Web3 features may not work correctly.'
  )
}

export const config = getDefaultConfig({
  appName: 'CitizenSpace',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [
    // Production chains
    mainnet,
    base,
    // Test chains (for development)
    ...(process.env.NODE_ENV === 'development' ? [sepolia, baseSepolia] : []),
  ],
  ssr: true, // Enable server-side rendering support
})
