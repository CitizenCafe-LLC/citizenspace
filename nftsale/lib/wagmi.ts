import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, base, baseSepolia } from 'wagmi/chains';

// You'll need to get a project ID from https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'Citizen Space',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [
    // Production chains
    mainnet,
    base,
    // Test chains
    sepolia,
    baseSepolia,
  ],
  ssr: true,
});