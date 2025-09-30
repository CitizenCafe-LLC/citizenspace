'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useNFTContract } from '@/hooks/useNFTContract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Coffee,
  Calendar,
  Users,
  Zap,
  Shield,
  Star,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  LogOut,
  Copy,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    userBalance,
    numberMinted,
    isHolder,
    totalSupply,
    maxSupply,
    mintPrice
  } = useNFTContract();

  const [copied, setCopied] = useState(false);

  // Temporarily disable all redirects for testing
  // Uncomment in production to require wallet connection
  // useEffect(() => {
  //   if (!isConnected) {
  //     router.push('/');
  //     toast.error('Please connect your wallet to access the dashboard');
  //   }
  // }, [isConnected, router]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareProfile = () => {
    const url = `${window.location.origin}/founder/${address}`;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard');
  };

  // Show connection prompt if not connected
  // For demo, we show the dashboard anyway
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-cs-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Zap className="h-12 w-12 text-cs-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-cs-espresso">Connect Your Wallet</h2>
          <p className="text-cs-muted">Please connect your wallet to view the dashboard</p>
          <p className="text-sm text-cs-muted">(Dashboard will show demo data)</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const membershipValue = userBalance * parseFloat(mintPrice) * 2500; // Assuming 1 ETH = $2500
  const savingsPerMonth = 200; // 50% off $400 monthly membership
  const totalSavings = savingsPerMonth * 12; // Annual savings

  const benefits = [
    { icon: Coffee, label: 'Unlimited Coffee', status: 'active' },
    { icon: Users, label: 'Community Access', status: 'active' },
    { icon: Calendar, label: 'Event Priority', status: 'active' },
    { icon: Shield, label: 'Founder Status', status: 'active' },
    { icon: Star, label: 'VIP Lounge', status: 'coming' },
    { icon: Gift, label: 'Partner Perks', status: 'coming' },
  ];

  const upcomingEvents = [
    { date: 'Oct 1', title: 'Founder Mixer', spots: 5 },
    { date: 'Oct 1', title: 'Coffee Cupping', spots: 12 },
    { date: 'Oct 1', title: 'Happy Hour', spots: 8 },
  ];

  return (
    <main className="min-h-screen bg-cs-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-cs-espresso mb-2">
              Founder Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-cs-sun/20 text-cs-espresso">
                <Trophy className="h-3 w-3 mr-1" />
                Founder #{userBalance}
              </Badge>
              <Badge variant="outline">
                NFTs Owned: {userBalance}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Address'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareProfile}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-5 w-5 text-cs-sun" />
                <Badge className="bg-cs-success/20 text-cs-success text-xs">Active</Badge>
              </div>
              <div className="font-display text-2xl font-bold text-cs-espresso">
                {userBalance}
              </div>
              <p className="text-sm text-cs-muted">Founder NFTs</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-cs-blue" />
              </div>
              <div className="font-display text-2xl font-bold text-cs-espresso">
                ${membershipValue.toLocaleString()}
              </div>
              <p className="text-sm text-cs-muted">Portfolio Value</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-cs-apricot" />
              </div>
              <div className="font-display text-2xl font-bold text-cs-espresso">
                50%
              </div>
              <p className="text-sm text-cs-muted">Lifetime Discount</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Gift className="h-5 w-5 text-cs-caramel" />
              </div>
              <div className="font-display text-2xl font-bold text-cs-espresso">
                ${totalSavings}/yr
              </div>
              <p className="text-sm text-cs-muted">Estimated Savings</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="membership" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-grid">
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="membership" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Membership Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Membership Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-cs-success/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-cs-success" />
                      <div>
                        <p className="font-medium text-cs-espresso">Founder Member</p>
                        <p className="text-sm text-cs-muted">Lifetime 50% discount active</p>
                      </div>
                    </div>
                    <Badge className="bg-cs-success text-white">Active</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-cs-muted">Regular Monthly Rate</span>
                      <span className="line-through text-cs-muted">$400</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cs-muted">Your Founder Rate</span>
                      <span className="font-bold text-cs-success">$200</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cs-muted">Monthly Savings</span>
                      <span className="font-bold text-cs-espresso">$200</span>
                    </div>
                  </div>

                  <Button className="w-full bg-cs-blue hover:bg-cs-blue/90">
                    Activate Monthly Membership
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/events">
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Upcoming Events
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Coffee className="h-4 w-4 mr-2" />
                    Reserve Workspace
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Join Discord Community
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on OpenSea
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Founder Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        benefit.status === 'active'
                          ? 'bg-cs-success/5 border-cs-success/20'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <benefit.icon
                          className={`h-5 w-5 ${
                            benefit.status === 'active' ? 'text-cs-success' : 'text-gray-400'
                          }`}
                        />
                        {benefit.status === 'coming' && (
                          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                        )}
                      </div>
                      <p className={`font-medium ${
                        benefit.status === 'active' ? 'text-cs-espresso' : 'text-gray-500'
                      }`}>
                        {benefit.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cs-muted">Total Founders</span>
                      <span className="font-display text-xl font-bold text-cs-espresso">
                        {totalSupply}
                      </span>
                    </div>
                    <Progress value={(totalSupply / maxSupply) * 100} className="h-2" />
                    <p className="text-xs text-cs-muted">
                      {maxSupply - totalSupply} spots remaining
                    </p>
                  </div>

                  <div className="pt-4 border-t border-cs-border">
                    <h4 className="font-medium text-cs-espresso mb-3">Upcoming Events</h4>
                    <div className="space-y-2">
                      {upcomingEvents.map((event, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-cs-sun/5 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-xs text-cs-muted">Oct</p>
                              <p className="font-display font-bold text-cs-espresso">
                                {event.date.split(' ')[1]}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-cs-espresso">
                                {event.title}
                              </p>
                              <p className="text-xs text-cs-muted">
                                {event.spots} spots left
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Program */}
              <Card>
                <CardHeader>
                  <CardTitle>Referral Program</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-cs-sun/10 rounded-lg">
                    <p className="font-display text-2xl font-bold text-cs-espresso mb-1">
                      Coming Soon
                    </p>
                    <p className="text-sm text-cs-muted">
                      Earn rewards for bringing new founders to Citizen Space
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cs-muted" />
                      <p className="text-sm text-cs-muted">
                        Get 0.01 ETH for each successful referral
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cs-muted" />
                      <p className="text-sm text-cs-muted">
                        Exclusive rewards for top referrers
                      </p>
                    </div>
                  </div>

                  <Button disabled className="w-full">
                    Get Referral Link (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}