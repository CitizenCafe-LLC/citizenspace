import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Wifi, 
  Zap,
  ArrowRight,
  Users,
  Volume2
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hot Desks',
  description: 'Flexible hourly and daily workspace options in our coworking zone. Perfect for remote work, meetings, and focused sessions.',
};

const pricingOptions = [
  {
    name: 'Hourly',
    price: '$2.50/hour',
    description: 'Perfect for quick sessions and meetings',
    features: [
      'Pay as you go',
      'Access to coworking zone',
      'All amenities included',
      'Minimum 1 hour'
    ],
    nftPrice: '$1.25/hour',
    cta: 'Book Hourly',
    popular: false
  },
  {
    name: 'Day Pass',
    price: '$25/day',
    description: 'Full day access with additional perks',
    features: [
      'All-day workspace access',
      '10% off cafe purchases',
      'Meeting room credits (2 hours)',
      'Valid until 10pm'
    ],
    nftPrice: '$12.50/day',
    cta: 'Book Hourly',
    popular: false
  },
  {
    name: 'Day Pass',
    price: '$25/day',
    description: 'Full day access with additional perks',
    features: [
      'All-day workspace access',
      '10% off cafe purchases',
      'Meeting room credits (2 hours)',
      'Valid until 10pm'
    ],
    cta: 'Buy Day Pass',
    popular: true
  }
];

const zoneFeatures = [
  {
    icon: MapPin,
    title: 'Prime Location',
    description: 'Desks throughout our coworking zone with various seating styles and views'
  },
  {
    icon: Volume2,
    title: 'Quiet Focus Areas',
    description: 'Designated quiet zones for deep work and concentration'
  },
  {
    icon: Users,
    title: 'Community Tables',
    description: 'Larger tables perfect for collaboration and networking'
  },
  {
    icon: Wifi,
    title: 'Gigabit Internet',
    description: 'Lightning-fast, reliable connection with backup systems'
  },
  {
    icon: Zap,
    title: 'Power & USB-C',
    description: 'Every seat has power outlets and USB-C charging ports'
  },
  {
    icon: Clock,
    title: 'Extended Hours',
    description: 'Available until 10pm weekdays, 8pm weekends'
  }
];

const availability = {
  current: 12,
  total: 45,
  busyTimes: [
    { time: '9-11am', status: 'Usually busy' },
    { time: '1-3pm', status: 'Peak hours' },
    { time: '4-6pm', status: 'Light traffic' }
  ]
};

export default function DesksPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Hot Desks
            </Badge>
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Flexible Workspace,{' '}
              <span className="gradient-text">Your Way</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose any available desk in our coworking zone. Perfect for remote work, 
              client meetings, or when you need a change from the home office.
            </p>
            
            {/* Live Availability */}
            <div className="bg-muted/30 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">{availability.current} desks available now</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {availability.total - availability.current} of {availability.total} in use
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">
                  Book a Desk Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/membership">See Memberships</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Options */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Choose Your Option
            </h2>
            <p className="text-lg text-muted-foreground">
              Flexible pricing for every working style
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingOptions.map((option, index) => (
              <Card key={index} className={`card-hover ${option.popular ? 'border-2 border-primary' : ''}`}>
                <CardHeader>
                  {option.popular && (
                    <Badge className="self-start mb-2">Most Popular</Badge>
                  )}
                  <CardTitle className="font-display text-2xl">{option.name}</CardTitle>
                  <div className="text-3xl font-bold text-cs-blue">{option.price}</div>
                  <div className="text-sm text-cs-blue">{option.nftPrice} NFT holders</div>
                  <CardDescription className="text-base">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <ArrowRight className="h-4 w-4 mr-2 text-cs-blue" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full btn-primary">
                    <Link href="/booking">{option.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Zone Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              What's Included
            </h2>
            <p className="text-lg text-muted-foreground">
              Every desk comes with premium amenities and coworking perks
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zoneFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Availability Patterns */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Best Times to Visit
              </h2>
              <p className="text-lg text-muted-foreground">
                Plan your workspace session for optimal availability
              </p>
            </div>
            
            <div className="space-y-4">
              {availability.busyTimes.map((period, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div className="font-semibold">{period.time}</div>
                  <Badge variant="outline">{period.status}</Badge>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Want to guarantee your spot? Consider a membership for priority access.
              </p>
              <Button asChild variant="outline">
                <Link href="/membership">Learn About Memberships</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cs-blue/10 to-cs-sun/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Ready to Work?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Book your desk now or download our app to see real-time availability
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">Book a Desk</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/app">Download App</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}