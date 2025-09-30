"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Coffee, Wallet } from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useNFTContract } from '@/hooks/useNFTContract';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();
  const { isHolder, userBalance } = useNFTContract();

  return (
    <nav className="bg-cs-bg border-b border-cs-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-cs-blue" />
            <span className="font-display text-xl font-bold text-cs-espresso">
              Citizen Space
            </span>
            {isHolder && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-cs-sun/20 text-cs-espresso rounded-full">
                Founder #{userBalance}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isConnected && isHolder && (
              <Link href="/dashboard" className="text-cs-muted hover:text-cs-espresso transition-colors">
                Dashboard
              </Link>
            )}
            <Link href="/faq" className="text-cs-muted hover:text-cs-espresso transition-colors">
              FAQ
            </Link>
            <Link href="/events" className="text-cs-muted hover:text-cs-espresso transition-colors">
              Events
            </Link>
            <Link href="/updates" className="text-cs-muted hover:text-cs-espresso transition-colors">
              Updates
            </Link>
            <ConnectButton
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full'
              }}
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-cs-border">
            <div className="flex flex-col space-y-4">
              {isConnected && isHolder && (
                <Link
                  href="/dashboard"
                  className="text-cs-muted hover:text-cs-espresso transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/faq"
                className="text-cs-muted hover:text-cs-espresso transition-colors"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/events"
                className="text-cs-muted hover:text-cs-espresso transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/updates"
                className="text-cs-muted hover:text-cs-espresso transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Updates
              </Link>
              <div className="pt-2">
                <ConnectButton
                  showBalance={false}
                  accountStatus="avatar"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}