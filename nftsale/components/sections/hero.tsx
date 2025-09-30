"use client";

import { ProgressCard } from '@/components/ui/progress-card';
import { Button } from '@/components/ui/button';
import { MintModal } from '@/components/ui/mint-modal';
import { ArrowRight, Calendar } from 'lucide-react';
import { useNFTContract } from '@/hooks/useNFTContract';
import Link from 'next/link';

export function Hero() {
  const { totalSupply, maxSupply, mintPrice, progress } = useNFTContract();
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-cs-bg via-cs-bg to-cs-sun/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Help Us Build{' '}
                <span className="bg-gradient-to-r from-cs-apricot to-cs-blue bg-clip-text text-transparent">
                  Citizen Space 3.0
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-cs-muted leading-relaxed">
                Local people + coffee + power = Work Cafe with community support
              </p>
              
              <p className="text-lg text-cs-muted max-w-xl">
                Mint a Founder NFT ({mintPrice} ETH) for{' '}
                <span className="font-semibold text-cs-espresso">lifetime 50% off</span>{' '}
                monthly rates + exclusive founder perks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <MintModal />
              <Link href="/events">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-cs-border hover:bg-cs-sun/10 w-full sm:w-auto"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  RSVP Fundraiser Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="pt-8">
              <p className="text-sm text-cs-muted mb-4">
                Every mint powers paint, permits, espresso, and seats.
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-cs-success"></div>
                  <span>Minimum Goal: $25k</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-cs-blue"></div>
                  <span>Stretch Goal: $50k</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <ProgressCard
              raised={totalSupply * parseFloat(mintPrice) * 2500} // Assuming 1 ETH = $2500
              minGoal={25000}
              stretchGoal={50000}
              backers={totalSupply}
              daysRemaining={23}
              nftsSold={totalSupply}
              nftsTotal={maxSupply}
            />
          </div>
        </div>
      </div>
    </section>
  );
}