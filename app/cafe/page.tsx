import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Smartphone, Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cafe',
  description: 'Premium coffee, fresh pastries, and light meals in our welcoming cafe space. Order from your seat with our app.',
};

const highlights = [
  {
    title: 'Artisan Coffee',
    description: 'Sourced from local roasters with single-origin options and house blends',
    icon: Coffee
  },
  {
    title: 'Fresh Daily',
    description: 'Pastries and light meals made fresh every morning by local partners',
    icon: Clock
  },
  {
    title: 'Order from Your Seat',
    description: 'Use our mobile app to order without leaving your workspace',
    icon: Smartphone
  }
];

const todaysSpecials = [
  {
    name: 'Ethiopian Yirgacheffe',
    description: 'Single-origin with bright citrus notes and floral aroma',
    price: '$4.50',
    badge: 'Today\'s Brew'
  },
  {
    name: 'Almond Croissant',
    description: 'Buttery pastry with almond cream from Arsicault Bakery',
    price: '$3.75',
    badge: 'Fresh Today'
  },
  {
    name: 'Avocado Toast',
    description: 'Sourdough with smashed avocado, radish, and everything seasoning',
    price: '$12.00',
    badge: 'Local Favorite'
  }
];

export default function CafePage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Cafe & Kitchen
            </Badge>
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Great Coffee,{' '}
              <span className="gradient-text">Great Community</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Start your day with expertly crafted coffee and fresh food from local artisans. 
              Whether you're grabbing and going or settling in to work, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/cafe/menu">
                  View Full Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/app">Download App</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                    <highlight.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {highlight.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Specials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Today's Specials
            </h2>
            <p className="text-lg text-muted-foreground">
              Fresh selections that change daily, featuring seasonal ingredients and local partnerships
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {todaysSpecials.map((item, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{item.badge}</Badge>
                    <span className="text-lg font-bold text-cs-blue">{item.price}</span>
                  </div>
                  <CardTitle className="font-display text-xl">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Ordering CTA */}
      <section className="py-20 bg-gradient-to-r from-cs-blue/10 to-cs-sun/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Smartphone className="h-16 w-16 mx-auto text-cs-blue mb-6" />
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Order from Your Seat
              </h2>
              <p className="text-xl text-muted-foreground">
                Skip the line and get your coffee delivered right to your workspace. 
                Perfect for those deep focus sessions when you can't break concentration.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/app">Download Our App</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/cafe/menu">Browse Menu First</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-hover">
              <Link href="/cafe/menu">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center">
                    Full Menu
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Explore our complete selection of coffee, tea, pastries, and light meals 
                    with prices and dietary information.
                  </p>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="card-hover">
              <Link href="/cafe/partners">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center">
                    Our Partners
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Meet the local roasters, bakeries, and artisans who help us create 
                    an authentic San Francisco cafe experience.
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}