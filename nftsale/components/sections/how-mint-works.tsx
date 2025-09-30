"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, Zap, CircleHelp as HelpCircle } from 'lucide-react';
import { MintModal } from '@/components/ui/mint-modal';
import Link from 'next/link';

const steps = [
  {
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Link your MetaMask, Rainbow, or other Web3 wallet to get started',
    note: 'New to wallets? We\'ll help you set one up',
  },
  {
    icon: Zap,
    title: 'Mint Your NFT',
    description: 'Pay 0.08 ETH + gas fees to mint your Founder NFT directly to your wallet',
    note: 'Transaction takes 1-2 minutes on Ethereum',
  },
  {
    icon: CreditCard,
    title: 'Enjoy Benefits',
    description: 'Use your NFT for 50% off memberships and exclusive founder perks',
    note: 'Benefits activate immediately after mint',
  },
];

export function HowMintWorks() {
  return (
    <section className="py-16 lg:py-24 bg-cs-apricot/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso mb-4">
            How Minting Works
          </h2>
          <p className="text-lg text-cs-muted max-w-2xl mx-auto">
            Get your Founder NFT in just three simple steps. No crypto experience needed—we'll guide you through it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300 relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-cs-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                
                <div className="mb-6 mt-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cs-apricot to-cs-blue rounded-full flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h3 className="font-display text-xl font-semibold text-cs-espresso mb-3">
                  {step.title}
                </h3>
                
                <p className="text-cs-muted mb-4">
                  {step.description}
                </p>
                
                <p className="text-xs text-cs-muted bg-cs-sun/10 px-3 py-2 rounded-full">
                  {step.note}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MintModal />
            <Button 
              variant="outline" 
              size="lg"
              asChild
              className="border-cs-border hover:bg-cs-sun/10"
            >
              <Link href="/faq">
                <HelpCircle className="mr-2 h-5 w-5" />
                Need Help? Check FAQ
              </Link>
            </Button>
          </div>

          <div className="max-w-2xl mx-auto bg-cs-bg border border-cs-border rounded-2xl p-6">
            <h4 className="font-display text-lg font-semibold text-cs-espresso mb-3">
              Don't have crypto yet?
            </h4>
            <p className="text-cs-muted text-sm mb-4">
              We're adding a fiat payment option soon! Pay with credit card and claim your NFT later.
            </p>
            <Button variant="outline" size="sm" disabled>
              Credit Card Option (Coming Soon)
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-cs-muted">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-cs-success"></div>
              <span>Ethereum Mainnet</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-cs-blue"></div>
              <span>ERC-721 Standard</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-cs-sun"></div>
              <span>2.5% Creator Royalty</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}