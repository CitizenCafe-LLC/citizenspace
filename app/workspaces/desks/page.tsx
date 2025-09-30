import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Clock, Calendar, MapPin, Wifi, Zap, ArrowRight, Users, Volume2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hot Desks',
  description:
    'Flexible hourly and daily workspace options in our coworking zone. Perfect for remote work, meetings, and focused sessions.',
}

const pricingOptions = [
  {
    name: 'Hourly',
    price: '$2.50/hour',
    description: 'Perfect for quick sessions and meetings',
    features: [
      'Pay as you go',
      'Access to coworking zone',
      'All amenities included',
      'Minimum 1 hour',
    ],
    nftPrice: '$1.25/hour',
    cta: 'Book Hourly',
    popular: false,
  },
  {
    name: 'Day Pass',
    price: '$25/day',
    description: 'Full day access with additional perks',
    features: [
      'All-day workspace access',
      '10% off cafe purchases',
      'Meeting room credits (2 hours)',
      'Valid until 10pm',
    ],
    nftPrice: '$12.50/day',
    cta: 'Book Hourly',
    popular: false,
  },
  {
    name: 'Day Pass',
    price: '$25/day',
    description: 'Full day access with additional perks',
    features: [
      'All-day workspace access',
      '10% off cafe purchases',
      'Meeting room credits (2 hours)',
      'Valid until 10pm',
    ],
    cta: 'Buy Day Pass',
    popular: true,
  },
]

const zoneFeatures = [
  {
    icon: MapPin,
    title: 'Prime Location',
    description: 'Desks throughout our coworking zone with various seating styles and views',
  },
  {
    icon: Volume2,
    title: 'Quiet Focus Areas',
    description: 'Designated quiet zones for deep work and concentration',
  },
  {
    icon: Users,
    title: 'Community Tables',
    description: 'Larger tables perfect for collaboration and networking',
  },
  {
    icon: Wifi,
    title: 'Gigabit Internet',
    description: 'Lightning-fast, reliable connection with backup systems',
  },
  {
    icon: Zap,
    title: 'Power & USB-C',
    description: 'Every seat has power outlets and USB-C charging ports',
  },
  {
    icon: Clock,
    title: 'Extended Hours',
    description: 'Available until 10pm weekdays, 8pm weekends',
  },
]

const availability = {
  current: 12,
  total: 45,
  busyTimes: [
    { time: '9-11am', status: 'Usually busy' },
    { time: '1-3pm', status: 'Peak hours' },
    { time: '4-6pm', status: 'Light traffic' },
  ],
}

export default function DesksPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Hot Desks
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Flexible Workspace, <span className="gradient-text">Your Way</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Choose any available desk in our coworking zone. Perfect for remote work, client
              meetings, or when you need a change from the home office.
            </p>

            {/* Live Availability */}
            <div className="mx-auto mb-8 max-w-md rounded-lg bg-muted/30 p-6">
              <div className="mb-2 flex items-center justify-center space-x-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                <span className="font-semibold">{availability.current} desks available now</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {availability.total - availability.current} of {availability.total} in use
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">Choose Your Option</h2>
            <p className="text-lg text-muted-foreground">
              Flexible pricing for every working style
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {pricingOptions.map((option, index) => (
              <Card
                key={index}
                className={`card-hover ${option.popular ? 'border-2 border-primary' : ''}`}
              >
                <CardHeader>
                  {option.popular && <Badge className="mb-2 self-start">Most Popular</Badge>}
                  <CardTitle className="font-display text-2xl">{option.name}</CardTitle>
                  <div className="text-3xl font-bold text-cs-blue">{option.price}</div>
                  <div className="text-sm text-cs-blue">{option.nftPrice} NFT holders</div>
                  <CardDescription className="text-base">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <ArrowRight className="mr-2 h-4 w-4 text-cs-blue" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="btn-primary w-full">
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
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">What's Included</h2>
            <p className="text-lg text-muted-foreground">
              Every desk comes with premium amenities and coworking perks
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">
                Best Times to Visit
              </h2>
              <p className="text-lg text-muted-foreground">
                Plan your workspace session for optimal availability
              </p>
            </div>

            <div className="space-y-4">
              {availability.busyTimes.map((period, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-background p-4"
                >
                  <div className="font-semibold">{period.time}</div>
                  <Badge variant="outline">{period.status}</Badge>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
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
      <section className="bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">Ready to Work?</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Book your desk now or download our app to see real-time availability
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
  )
}
