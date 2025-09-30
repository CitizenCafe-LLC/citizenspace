import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  LampDesk as Desk,
  Users,
  Shield,
  Phone,
  Wifi,
  Coffee,
  Clock,
  ArrowRight,
  Zap,
  Volume2,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspaces',
  description:
    'From hourly desks to dedicated team pods, find the perfect workspace solution in our coworking zone.',
}

const workspaceTypes = [
  {
    icon: Desk,
    title: 'Hot Desks',
    description: 'Flexible seating in our coworking zone with hourly and daily options',
    priceFrom: '$2/hour',
    href: '/workspaces/desks',
    features: ['First-come, first-served', 'Full coworking amenities', 'App-based booking'],
  },
  {
    icon: Users,
    title: 'Meeting Rooms',
    description: 'Private spaces for teams with whiteboards and AV equipment',
    priceFrom: '$25/hour',
    href: '/workspaces/meeting-rooms',
    features: ['2-8 person capacity', 'Whiteboard & display', 'Sound isolation'],
  },
  {
    icon: Phone,
    title: 'Communications Pods',
    description: 'Private phone booths for calls and video meetings',
    priceFrom: '$5/hour',
    href: '/workspaces/communications-pods',
    features: ['1 person capacity', 'Soundproof booth', 'Perfect for calls'],
  },
  {
    icon: Shield,
    title: 'Cafe Membership',
    description: 'Monthly membership for flexible workspace during business hours',
    priceFrom: '$150/month',
    nftPrice: '$75/month NFT holders',
    href: '/workspaces/team-pods',
    features: ['Any available desk', '9am-5pm access', '2 hours meeting rooms'],
  },
]

const amenities = [
  {
    icon: Wifi,
    title: 'High-Speed WiFi',
    description: 'Gigabit fiber with redundant connections',
  },
  {
    icon: Zap,
    title: 'Power Everywhere',
    description: 'USB-C and standard outlets at every seat',
  },
  {
    icon: Coffee,
    title: 'In-Seat Ordering',
    description: 'Order cafe items directly to your workspace',
  },
  {
    icon: Clock,
    title: 'Extended Hours',
    description: 'Access until 10pm on weekdays',
  },
  {
    icon: Volume2,
    title: 'Quiet Zones',
    description: 'Designated areas for focused work',
  },
  {
    icon: Phone,
    title: 'Phone Booths',
    description: 'Soundproof spaces for private calls',
  },
]

const testimonials = [
  {
    quote:
      "The perfect blend of community and productivity. I've been working here for two years and love the energy.",
    author: 'Sarah Johnson',
    role: 'Startup Founder',
  },
  {
    quote:
      'Great coffee, reliable internet, and a welcoming atmosphere. The day passes are perfect when I need a change of scenery.',
    author: 'Mike Chen',
    role: 'Software Developer',
  },
  {
    quote:
      "Our team pod has been a game-changer. It's like having our own office but with all the coworking benefits.",
    author: 'Alex Rodriguez',
    role: 'Design Team Lead',
  },
]

export default function WorkspacesPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Coworking Spaces
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Work How <span className="gradient-text">You Want</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              From quick hourly sessions to dedicated team spaces, we have workspace solutions for
              every working style. All behind our coworking gate with premium amenities.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">
                  Book a Workspace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/membership">View Memberships</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Types */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">Choose Your Space</h2>
            <p className="text-lg text-muted-foreground">
              Three workspace options designed for different needs and working styles
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {workspaceTypes.map((workspace, index) => (
              <Card key={index} className="card-hover">
                <Link href={workspace.href}>
                  <CardHeader>
                    <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3">
                      <workspace.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-center font-display text-xl">
                      {workspace.title}
                    </CardTitle>
                    <div className="text-center">
                      <Badge variant="outline" className="text-cs-blue">
                        {workspace.priceFrom}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-center text-base">
                      {workspace.description}
                    </CardDescription>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {workspace.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <ArrowRight className="mr-2 h-3 w-3 text-cs-blue" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple, streamlined access to premium workspace
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cs-blue/10 p-4">
                <span className="text-2xl font-bold text-cs-blue">1</span>
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">Check In</h3>
              <p className="text-muted-foreground">
                Use your membership card or day pass to access the coworking zone through our gate
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cs-sun/10 p-4">
                <span className="text-2xl font-bold text-cs-caramel">2</span>
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">Find Your Spot</h3>
              <p className="text-muted-foreground">
                Choose any available desk or use our app to reserve specific seats and meeting rooms
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cs-apricot/10 p-4">
                <span className="text-2xl font-bold text-cs-apricot">3</span>
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">Get to Work</h3>
              <p className="text-muted-foreground">
                Enjoy all amenities including cafe ordering, printing, and meeting room access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Premium amenities included with every workspace option
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <amenity.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{amenity.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{amenity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">
              What Our Members Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of professionals who call Citizen Space home
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <blockquote className="mb-4 text-lg italic">"{testimonial.quote}"</blockquote>
                  <footer>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </footer>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Book a workspace today or schedule a tour to see our space in person
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">Book Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Schedule a Tour</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
