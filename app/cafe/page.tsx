import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coffee, Smartphone, Clock, MapPin, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cafe',
  description:
    'Premium coffee, fresh pastries, and light meals in our welcoming cafe space. Order from your seat with our app.',
}

const highlights = [
  {
    title: 'Artisan Coffee',
    description: 'Sourced from local roasters with single-origin options and house blends',
    icon: Coffee,
  },
  {
    title: 'Fresh Daily',
    description: 'Pastries and light meals made fresh every morning by local partners',
    icon: Clock,
  },
  {
    title: 'Order from Your Seat',
    description: 'Use our mobile app to order without leaving your workspace',
    icon: Smartphone,
  },
]

const todaysSpecials = [
  {
    name: 'Ethiopian Yirgacheffe',
    description: 'Single-origin with bright citrus notes and floral aroma',
    price: '$4.50',
    badge: "Today's Brew",
  },
  {
    name: 'Almond Croissant',
    description: 'Buttery pastry with almond cream from Arsicault Bakery',
    price: '$3.75',
    badge: 'Fresh Today',
  },
  {
    name: 'Avocado Toast',
    description: 'Sourdough with smashed avocado, radish, and everything seasoning',
    price: '$12.00',
    badge: 'Local Favorite',
  },
]

export default function CafePage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Cafe & Kitchen
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Great Coffee, <span className="gradient-text">Great Community</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Start your day with expertly crafted coffee and fresh food from local artisans.
              Whether you're grabbing and going or settling in to work, we've got you covered.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {highlights.map((highlight, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3">
                    <highlight.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{highlight.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Specials */}
      <section className="py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">Today's Specials</h2>
            <p className="text-lg text-muted-foreground">
              Fresh selections that change daily, featuring seasonal ingredients and local
              partnerships
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {todaysSpecials.map((item, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="secondary">{item.badge}</Badge>
                    <span className="text-lg font-bold text-cs-blue">{item.price}</span>
                  </div>
                  <CardTitle className="font-display text-xl">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Ordering CTA */}
      <section className="bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <Smartphone className="mx-auto mb-6 h-16 w-16 text-cs-blue" />
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">
                Order from Your Seat
              </h2>
              <p className="text-xl text-muted-foreground">
                Skip the line and get your coffee delivered right to your workspace. Perfect for
                those deep focus sessions when you can't break concentration.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="card-hover">
              <Link href="/cafe/menu">
                <CardHeader>
                  <CardTitle className="flex items-center font-display text-2xl">
                    Full Menu
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Explore our complete selection of coffee, tea, pastries, and light meals with
                    prices and dietary information.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="card-hover">
              <Link href="/cafe/partners">
                <CardHeader>
                  <CardTitle className="flex items-center font-display text-2xl">
                    Our Partners
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Meet the local roasters, bakeries, and artisans who help us create an authentic
                    San Francisco cafe experience.
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
