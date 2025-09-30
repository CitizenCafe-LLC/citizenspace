"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Coffee, Palette, FileText, Armchair, Phone, Wifi, Users, Clock, CircleCheck as CheckCircle2 } from 'lucide-react';

const minGoalItems = [
  { icon: Palette, title: 'Fresh Paint & Repairs', description: 'Complete interior refresh with warm, welcoming colors' },
  { icon: Coffee, title: 'Basic Espresso Setup', description: 'Quality espresso machine and grinder for great coffee' },
  { icon: Armchair, title: 'Initial Furniture', description: '20 comfortable work chairs and collaborative tables' },
  { icon: FileText, title: 'Permits & Insurance', description: 'All necessary permits and comprehensive business insurance' },
  { icon: Users, title: 'Initial Staffing', description: 'Part-time barista and community manager to get started' },
];

const stretchGoalItems = [
  { icon: Phone, title: '2× Phone Booths', description: 'Private soundproof spaces for important calls' },
  { icon: Wifi, title: 'Fiber + Mesh Wi-Fi', description: 'Lightning-fast internet throughout the entire space' },
  { icon: Coffee, title: 'Pro Espresso System', description: 'Commercial-grade La Marzocco machine & premium grinder' },
  { icon: Armchair, title: '30 Ergonomic Chairs', description: 'Herman Miller-quality seating for all-day comfort' },
  { icon: Clock, title: 'Extended Hours', description: 'Members-only access until 10pm for night owls' },
];

function GoalDetails({ title, items, isStretch = false }: { 
  title: string; 
  items: typeof minGoalItems; 
  isStretch?: boolean; 
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isStretch ? 'bg-cs-blue/20 text-cs-blue' : 'bg-cs-success/20 text-cs-success'
            }`}>
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-cs-espresso">{item.title}</h4>
              <p className="text-sm text-cs-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FundingGoals() {
  return (
    <section className="py-16 lg:py-24 bg-cs-sun/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso mb-4">
            What Your Support Unlocks
          </h2>
          <p className="text-lg text-cs-muted max-w-2xl mx-auto">
            Every contribution helps us build the community space SF needs. See exactly how we'll use your support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="font-display text-2xl text-cs-espresso">
                  $25,000 Minimum
                </CardTitle>
                <Badge className="bg-cs-success text-white">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Essential
                </Badge>
              </div>
              <p className="text-cs-muted">
                The foundation we need to open our doors and serve great coffee
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {minGoalItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-cs-success" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                ))}
                <p className="text-xs text-cs-muted pl-8">+ permits, insurance, initial staff</p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    View Full Breakdown
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Minimum Goal: $25,000</DialogTitle>
                    <DialogDescription>
                      Essential items to open and operate
                    </DialogDescription>
                  </DialogHeader>
                  <GoalDetails title="Minimum Goal" items={minGoalItems} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300 border-2 border-cs-blue/20">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="font-display text-2xl text-cs-espresso">
                  $50,000 Stretch
                </CardTitle>
                <Badge className="bg-cs-blue text-white">
                  Premium Upgrades
                </Badge>
              </div>
              <p className="text-cs-muted">
                Transform the space into a world-class coworking destination
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {stretchGoalItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-cs-blue" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                ))}
                <p className="text-xs text-cs-muted pl-8">+ extended hours, premium seating</p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-cs-blue hover:bg-cs-blue/90">
                    View Premium Features
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Stretch Goal: $50,000</DialogTitle>
                    <DialogDescription>
                      Premium upgrades for founders
                    </DialogDescription>
                  </DialogHeader>
                  <GoalDetails title="Stretch Goal" items={stretchGoalItems} isStretch />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="p-6 bg-gradient-to-r from-cs-apricot/10 to-cs-blue/10 rounded-2xl max-w-2xl mx-auto">
            <h3 className="font-display text-xl font-semibold text-cs-espresso mb-2">
              Transparent Funding
            </h3>
            <p className="text-sm text-cs-muted">
              All funds are held in a multi-signature wallet. We'll provide monthly updates on spending 
              and progress. If we don't reach our minimum goal, all NFT holders receive full refunds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}