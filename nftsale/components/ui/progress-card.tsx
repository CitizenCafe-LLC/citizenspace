"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReadContract } from 'wagmi';
import { CITIZEN_SPACE_CONTRACT, MINT_PRICE, MAX_SUPPLY } from '@/lib/contract';
import { Users, Calendar, Target, TrendingUp, Zap } from 'lucide-react';

interface ProgressCardProps {
  raised: number;
  minGoal: number;
  stretchGoal: number;
  backers: number;
  daysRemaining: number;
  nftsSold?: number;
  nftsTotal?: number;
}

export function ProgressCard({ 
  raised, 
  minGoal, 
  stretchGoal, 
  backers, 
  daysRemaining 
}: ProgressCardProps) {
  // Get real-time data from contract
  const { data: totalSupply } = useReadContract({
    ...CITIZEN_SPACE_CONTRACT,
    functionName: 'totalSupply',
  });
  
  // Calculate real values from contract data
  const realBackers = Number(totalSupply || 0);
  const realRaised = realBackers * parseFloat(MINT_PRICE) * 3000; // Approximate ETH to USD
  
  const minProgress = Math.min((raised / minGoal) * 100, 100);
  const stretchProgress = Math.min((raised / stretchGoal) * 100, 100);
  const isMinGoalReached = raised >= minGoal;
  const isStretchGoalReached = raised >= stretchGoal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-md shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-2xl text-cs-espresso flex items-center justify-between">
          <span>Funding Progress</span>
          <Badge className="bg-cs-blue text-white">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Progress */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-3xl font-bold text-cs-espresso">
                {formatCurrency(realRaised || raised)}
              </div>
              <div className="text-sm text-cs-muted">raised so far</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-cs-espresso">
                {Math.round(minProgress)}%
              </div>
              <div className="text-xs text-cs-muted">to minimum</div>
            </div>
          </div>

          {/* Minimum Goal Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-cs-muted">Minimum Goal</span>
              <span className="font-medium text-cs-espresso">{formatCurrency(minGoal)}</span>
            </div>
            <Progress 
              value={minProgress} 
              className="h-3"
              style={{
                background: 'var(--cs-border)',
              }}
            />
            {isMinGoalReached && (
              <div className="flex items-center text-xs text-cs-success">
                <Target className="h-3 w-3 mr-1" />
                Minimum goal reached!
              </div>
            )}
          </div>

          {/* Stretch Goal Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-cs-muted">Stretch Goal</span>
              <span className="font-medium text-cs-espresso">{formatCurrency(stretchGoal)}</span>
            </div>
            <Progress 
              value={stretchProgress} 
              className="h-2"
              style={{
                background: 'var(--cs-border)',
              }}
            />
            {isStretchGoalReached && (
              <div className="flex items-center text-xs text-cs-blue">
                <TrendingUp className="h-3 w-3 mr-1" />
                Stretch goal unlocked!
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cs-border">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-cs-muted mr-1" />
            </div>
            <div className="font-display text-2xl font-bold text-cs-espresso">
              {(realBackers || backers).toLocaleString()}
            </div>
            <div className="text-xs text-cs-muted">backers</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-cs-muted mr-1" />
            </div>
            <div className="font-display text-2xl font-bold text-cs-espresso">
              {daysRemaining}
            </div>
            <div className="text-xs text-cs-muted">days left</div>
          </div>
        </div>

        {/* CTA */}
        <Button className="w-full bg-cs-blue hover:bg-cs-blue/90" size="lg">
          <Zap className="mr-2 h-4 w-4" />
          Mint Founder NFT
        </Button>

        {/* Footer Note */}
        <p className="text-xs text-cs-muted text-center">
          {!isMinGoalReached 
            ? "Full refunds if minimum goal isn't reached"
            : "Minimum goal reached - project is funded!"
          }
        </p>
      </CardContent>
    </Card>
  );
}