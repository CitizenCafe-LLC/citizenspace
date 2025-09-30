import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Phone, Video, Volume2, Shield, ArrowRight, Clock, Users, Wifi } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Communications Pods',
  description:
    'Private phone booth style rooms for calls and video meetings. Soundproof spaces perfect for confidential conversations.',
}

const podFeatures = [
  {
    icon: Shield,
    title: 'Complete Privacy',
    description: 'Soundproof booth ensures your conversations stay confidential',
  },
  {
    icon: Video,
    title: 'Video Ready',
    description: 'Perfect lighting and backdrop for professional video calls',
  },
  {
    icon: Volume2,
    title: 'Crystal Clear Audio',
    description: 'Acoustic treatment for optimal call quality',
  },
  {
    icon: Wifi,
    title: 'High-Speed Connection',
    description: 'Dedicated network access for stable video calls',
  },
  {
    icon: Clock,
    title: 'Flexible Booking',
    description: 'Book from 30 minutes to 4 hours as needed',
  },
  {
    icon: Users,
    title: 'Single Occupancy',
    description: 'Designed for one person to maximize focus and privacy',
  },
]

const useCases = [
  {
    title: 'Client Calls',
    description: 'Professional environment for important client conversations and negotiations',
  },
  {
    title: 'Video Interviews',
    description: 'Perfect backdrop and acoustics for conducting or participating in interviews',
  },
  {
    title: 'Confidential Meetings',
    description: 'Secure space for sensitive business discussions and legal consultations',
  },
  {
    title: 'Focus Calls',
    description: 'Distraction-free environment for important calls that require full attention',
  },
]

export default function CommunicationsPodsPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Communications Pods
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Your Private <span className="gradient-text">Call Sanctuary</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Soundproof phone booth style rooms designed for confidential calls, video meetings,
              and focused conversations. Perfect when you need complete privacy.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">
                  Book a Pod
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Schedule a Tour</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 font-display text-3xl font-bold lg:text-4xl">
              Simple, Affordable Pricing
            </h2>

            <Card className="mx-auto max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 p-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-display text-2xl">Communications Pod</CardTitle>
                <div className="mb-2 text-4xl font-bold text-cs-blue">$5/hour</div>
                <div className="text-lg text-cs-blue">$2.50/hour NFT holders</div>
                <CardDescription className="text-base">
                  Private soundproof booth for calls and video meetings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-cs-blue" />
                    <span className="text-sm">30 minutes minimum booking</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-cs-blue" />
                    <span className="text-sm">Up to 4 hours maximum</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-cs-blue" />
                    <span className="text-sm">Complete soundproofing</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-cs-blue" />
                    <span className="text-sm">Professional lighting</span>
                  </li>
                </ul>
                <Button asChild className="btn-primary w-full">
                  <Link href="/booking">Book Now</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>For Drop-in Users:</strong> Communications Pod time is charged separately
                from your workspace time. If you're paying hourly for a desk ($2.50/hour), you'll
                also pay for pod usage ($5/hour) during your call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">
              Designed for Professional Calls
            </h2>
            <p className="text-lg text-muted-foreground">
              Every detail optimized for clear communication and complete privacy
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {podFeatures.map((feature, index) => (
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

      {/* Use Cases */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">Perfect For</h2>
            <p className="text-lg text-muted-foreground">
              Professional scenarios that require complete privacy and focus
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="font-display text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Info */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">How It Works</h2>
              <p className="text-lg text-muted-foreground">
                Simple booking process for immediate or advance reservations
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cs-blue/10 p-4">
                  <span className="text-2xl font-bold text-cs-blue">1</span>
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold">Book Online</h3>
                <p className="text-muted-foreground">
                  Reserve your pod through our website or mobile app
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cs-sun/10 p-4">
                  <span className="text-2xl font-bold text-cs-caramel">2</span>
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold">Access Your Pod</h3>
                <p className="text-muted-foreground">
                  Use your access card or app to enter the pod at your reserved time
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cs-apricot/10 p-4">
                  <span className="text-2xl font-bold text-cs-apricot">3</span>
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold">Make Your Call</h3>
                <p className="text-muted-foreground">
                  Enjoy complete privacy and professional acoustics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">
              Need a Private Space for Your Next Call?
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Book a Communications Pod for complete privacy and professional acoustics
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">Reserve a Pod</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/workspaces">See All Workspaces</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
