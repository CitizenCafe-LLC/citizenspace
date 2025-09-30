"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Percent, 
  Users, 
  Calendar, 
  MessageCircle, 
  Trophy,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';

const benefits = [
  {
    icon: Percent,
    title: 'Lifetime 50% Off',
    description: 'Half-price monthly membership rates for as long as you hold the NFT',
    highlight: 'Save $100+ monthly',
  },
  {
    icon: ArrowRightLeft,
    title: 'Transferable Rights',
    description: 'Sell or gift your membership benefits to anyone on the secondary market',
    highlight: 'True ownership',
  },
  {
    icon: Trophy,
    title: 'Founder Status',
    description: 'Special founder badge in our community and priority access to new features',
    highlight: 'Exclusive recognition',
  },
  {
    icon: MessageCircle,
    title: 'Private Discord',
    description: 'Token-gated access to the founders-only Discord channel',
    highlight: 'Inner circle access',
  },
  {
    icon: Calendar,
    title: 'Priority Booking',
    description: 'First dibs on event spaces, meeting rooms, and special workshops',
    highlight: 'Never miss out',
  },
  {
    icon: Sparkles,
    title: 'Future Perks',
    description: 'First access to new locations, merchandise, and exclusive member benefits',
    highlight: 'Growing utility',
  },
];

export function NFTBenefits() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso mb-4">
            Why an NFT Membership?
          </h2>
          <p className="text-lg text-cs-muted max-w-2xl mx-auto mb-6">
            Your Founder NFT isn't just a digital collectible—it's a key to lifetime benefits 
            and true ownership of your membership.
          </p>
          <div className="inline-flex items-center space-x-2 bg-cs-success/10 text-cs-success px-4 py-2 rounded-full">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">ERC-721 Standard • Ethereum Mainnet</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="shadow-cs-card hover:shadow-cs-hover transition-all duration-300 group hover:scale-105">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cs-apricot to-cs-blue flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="font-display text-lg text-cs-espresso">
                    {benefit.title}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="w-fit bg-cs-sun/20 text-cs-espresso">
                  {benefit.highlight}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-cs-muted">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-cs-blue/5 to-cs-apricot/5 border-cs-border">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <h3 className="font-display text-2xl font-semibold text-cs-espresso">
                  Smart Contract Benefits
                </h3>
                <p className="text-cs-muted max-w-2xl mx-auto">
                  Unlike traditional memberships, your NFT gives you verifiable ownership. 
                  The 50% discount is automatically applied when you connect your wallet—no renewals, 
                  no expiration dates, no fine print.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-cs-espresso mb-1">500</div>
                    <div className="text-sm text-cs-muted">Total Supply</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-cs-espresso mb-1">2.5%</div>
                    <div className="text-sm text-cs-muted">Creator Royalty</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-cs-espresso mb-1">∞</div>
                    <div className="text-sm text-cs-muted">Benefit Duration</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}