import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Coffee, 
  Users, 
  Wifi, 
  Calendar, 
  MapPin, 
  Clock,
  ArrowRight,
  Zap,
  Shield,
  Heart,
  Wallet
} from 'lucide-react';

const features = [
  {
    icon: Coffee,
    title: 'Cafe Zone',
    description: 'Premium coffee, pastries, and light meals in a welcoming atmosphere perfect for casual work or meetings.'
  },
  {
    icon: Users,
    title: 'Work Zone',
    description: 'Dedicated workspace beyond the gate with desks, meeting rooms, and all the amenities you need.'
  },
  {
    icon: Shield,
    title: 'Meeting Pods',
    description: 'Private spaces for teams with whiteboards, displays, and soundproofing for focused collaboration.'
  }
];

const highlights = [
  {
    icon: Zap,
    title: '12 Seats Available',
    description: 'Ready to book now',
    href: '/booking'
  },
  {
    icon: Calendar,
    title: 'Creative Workshop Tonight',
    description: '7pm - Digital Art Basics',
    href: '/events'
  },
  {
    icon: Heart,
    title: 'Today\'s Special',
    description: 'Ethiopian Single Origin + Almond Croissant',
    href: '/cafe/menu'
  }
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-muted/20 to-background py-24 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Now Open in San Francisco
            </Badge>
            <h1 className="font-display text-5xl lg:text-7xl font-bold mb-6">
              Where{' '}
              <span className="gradient-text">Coffee</span>{' '}
              Meets{' '}
              <span className="gradient-text">Power</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A hybrid space blending the energy of a neighborhood cafe with the focus of a professional coworking environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary text-lg px-8">
                <Link href="/booking">
                  Reserve a Desk
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/membership">See Memberships</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/cafe/menu">View Menu</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Funding Banner */}
      <section className="py-12 bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Wallet className="h-4 w-4 mr-2" />
              Founding Member NFT
            </Badge>
            <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">
              Help Us Build the Future of Coworking
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Purchase our Founding Member NFT to support our Santa Cruz build and unlock exclusive benefits: 
              <strong> 50% off all workspace services</strong> and <strong>10% off cafe items</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <Wallet className="mr-2 h-5 w-5" />
                  Purchase NFT
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/membership">Learn About Benefits</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Concept Explainer */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Three Zones, One Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built on the principles of <strong>Open Coworking</strong>—collaboration, openness, community, 
              accessibility, and sustainability—we create spaces where everyone can thrive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Highlights */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Happening Today
            </h2>
            <p className="text-lg text-muted-foreground">
              Live updates on availability, events, and specials
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <Card key={index} className="card-hover cursor-pointer">
                <Link href={highlight.href}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-secondary/20">
                        <highlight.icon className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <CardTitle className="text-lg">{highlight.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{highlight.description}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Teaser */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Find Your Perfect Plan
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              From casual drop-ins to dedicated desks, choose what works for your workflow
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Hourly</CardTitle>
                  <div className="text-2xl font-bold text-cs-blue">$2.50/hr</div>
                  <div className="text-sm text-cs-blue font-semibold">$1.25/hr NFT holders</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Perfect for quick sessions</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Day Pass</CardTitle>
                  <div className="text-2xl font-bold text-cs-sun">$25/day</div>
                  <div className="text-sm text-cs-sun font-semibold">$12.50/day NFT holders</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Full day access</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Cafe Member</CardTitle>
                  <div className="text-2xl font-bold text-cs-caramel">$150/mo</div>
                  <div className="text-sm text-cs-caramel font-semibold">$75/mo NFT holders</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Any desk, 9-5 access</p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-2 border-primary">
                <CardHeader className="pb-3">
                  <Badge className="mb-2">Most Popular</Badge>
                  <CardTitle className="text-lg">Resident</CardTitle>
                  <div className="text-2xl font-bold text-cs-apricot">$425/mo</div>
                  <div className="text-sm text-cs-apricot font-semibold">$212.50/mo NFT holders</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Dedicated desk 24/7</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/membership">
                  See Full Plans
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <Wallet className="mr-2 h-5 w-5" />
                  Get 50% Off with NFT
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
                Right in the Heart of SF
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Located on Market Street with easy access to BART, Muni, and major bike routes. 
                We're part of the community that's been shaping Santa Cruz's creative and tech landscape since 2006.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>420 Pacific Ave, Santa Cruz, CA 95060</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Mon-Fri 7am-10pm, Weekends 8am-8pm</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Wifi className="h-5 w-5 text-muted-foreground" />
                  <span>High-speed WiFi, Power at every seat</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="btn-primary">
                  <Link href="/location">Get Directions</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Schedule a Tour</Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-muted rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive map coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}