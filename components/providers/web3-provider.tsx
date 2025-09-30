/**
 * Web3Provider Component
 *
 * Wraps the application with necessary Web3 providers including:
 * - WagmiProvider: Blockchain connection management
 * - QueryClientProvider: React Query for data fetching
 * - RainbowKitProvider: Wallet connection UI
 */

'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/web3/wagmi'
import { useState } from 'react'
import { useTheme } from 'next-themes'

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  const { theme } = useTheme()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={
            theme === 'dark'
              ? darkTheme({
                  accentColor: '#79AEF2',
                  accentColorForeground: 'white',
                  borderRadius: 'medium',
                })
              : lightTheme({
                  accentColor: '#79AEF2',
                  accentColorForeground: 'white',
                  borderRadius: 'medium',
                })
          }
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
