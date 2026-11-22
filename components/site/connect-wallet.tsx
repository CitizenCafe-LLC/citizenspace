'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Connect Wallet, kept from the original site: members connect a crypto wallet
 * to buy the Citizen Space NFT (the member key). Uses the RainbowKit modal that
 * Web3Provider already mounts in app/layout.tsx, styled to the brand.
 */
export function ConnectWallet({ className, onOpen }: { className?: string; onOpen?: () => void }) {
  const base =
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-brand-forest px-4 text-[15px] font-bold text-brand-forest hover:bg-brand-forest hover:text-brand-bone'

  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openConnectModal, openAccountModal, openChainModal }) => {
        const ready = mounted
        const connected = ready && account && chain
        const open = (fn: () => void) => () => {
          onOpen?.()
          fn()
        }

        if (!connected) {
          return (
            <button
              type="button"
              aria-hidden={!ready}
              className={cn(base, !ready && 'pointer-events-none opacity-0', className)}
              onClick={open(openConnectModal)}
            >
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Connect Wallet
            </button>
          )
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              className={cn(base, 'border-brand-brick text-brand-brick', className)}
              onClick={open(openChainModal)}
            >
              Wrong network
            </button>
          )
        }

        return (
          <button
            type="button"
            className={cn(base, 'bg-brand-forest text-brand-bone', className)}
            onClick={open(openAccountModal)}
            aria-label={`Wallet connected: ${account.displayName}`}
          >
            <Wallet className="h-4 w-4" aria-hidden="true" />
            {account.displayName}
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}
