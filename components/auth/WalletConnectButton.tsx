/**
 * WalletConnectButton Component
 * Custom styled RainbowKit wallet connection button
 */

'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} variant="outline" className="gap-2">
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="destructive">
                    Wrong network
                  </Button>
                )
              }

              return (
                <div className="flex gap-2">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>

                  <Button onClick={openAccountModal} variant="outline" size="sm">
                    <Wallet className="mr-2 h-4 w-4" />
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

/**
 * Compact version for mobile or sidebar use
 */
export function WalletConnectButtonCompact() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {!connected ? (
              <Button onClick={openConnectModal} size="sm" variant="ghost" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Connect</span>
              </Button>
            ) : (
              <Button onClick={openAccountModal} size="sm" variant="ghost">
                <Wallet className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{account.displayName}</span>
              </Button>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}