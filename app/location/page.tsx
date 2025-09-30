import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  Brain as Train,
  Car,
  Bike,
  Accessibility,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Location & Directions',
  description:
    'Visit Citizen Space at 1899 Market Street in San Francisco. Easy access by BART, Muni, bike, and car with detailed directions.',
}

const hours = [
  { day: 'Monday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Tuesday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Wednesday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Thursday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Friday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Saturday', cafe: '8:00 AM - 8:00 PM', coworking: '8:00 AM - 8:00 PM' },
  { day: 'Sunday', cafe: '8:00 AM - 8:00 PM', coworking: '8:00 AM - 8:00 PM' },
]

const transportOptions = [
  {
    icon: Train,
    title: 'BART & Muni',
    description: 'Civic Center/UN Plaza BART (2 blocks)',
    details: [
      'BART: All lines stop at Civic Center',
      'Muni: Multiple bus lines on Market St',
      '2-minute walk from Civic Center station',
    ],
  },
  {
    icon: Bike,
    title: 'Bike Friendly',
    description: 'Bike racks and Bay Wheels stations nearby',
    details: [
      'Secure bike parking available',
      'Bay Wheels station at UN Plaza',
      'Market St bike lane access',
    ],
  },
  {
    icon: Car,
    title: 'Parking Options',
    description: 'Street parking and nearby garages',
    details: [
      'Metered street parking available',
      'UN Plaza Garage (2 blocks)',
      'Civic Center Garage nearby',
    ],
  },
]

const neighborhoodSpots = [
  {
    name: 'Santa Cruz Beach Boardwalk',
    type: 'Attraction',
    distance: '3 blocks',
    description: 'Historic seaside amusement park and beach',
  },
  {
    name: 'Downtown Farmers Market',
    type: 'Market',
    distance: '2 blocks',
    description: 'Wednesday farmers market with local produce',
  },
  {
    name: 'Santa Cruz Museum of Art & History',
    type: 'Culture',
    distance: '4 blocks',
    description: 'Local art, history, and community events',
  },
  {
    name: 'Pacific Avenue',
    type: 'Shopping',
    distance: '0 blocks',
    description: 'Main shopping and dining street',
  },
]

export default function LocationPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Visit Us
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Right in the <span className="gradient-text">Heart of SC</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Find us on Pacific Avenue with easy access to Highway 1, local transit, and all of
              Santa Cruz. We're in the heart of downtown, steps from the beach and boardwalk.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">Book Your Visit</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Schedule a Tour</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Address & Map */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center font-display text-2xl">
                    <MapPin className="mr-2 h-6 w-6 text-cs-blue" />
                    Our Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Citizen Space</h3>
                    <address className="not-italic text-muted-foreground">
                      420 Pacific Ave
                      <br />
                      Santa Cruz, CA 95060
                    </address>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span>(831) 295-1482</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span>hello@citizenspace.com</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Quick Navigation</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in Google Maps
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in Apple Maps
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Train className="mr-2 h-4 w-4" />
                        BART Trip Planner
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="h-full">
                <CardContent className="p-0">
                  <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Interactive map loading...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 flex items-center justify-center font-display text-3xl font-bold lg:text-4xl">
                <Clock className="mr-3 h-8 w-8 text-cs-blue" />
                Hours of Operation
              </h2>
              <p className="text-lg text-muted-foreground">
                Our cafe is open to everyone. The coworking zone requires a membership or day pass.
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left">Day</th>
                        <th className="p-4 text-left">Cafe Hours</th>
                        <th className="p-4 text-left">Coworking Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hours.map((day, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="p-4 font-semibold">{day.day}</td>
                          <td className="p-4">{day.cafe}</td>
                          <td className="p-4">{day.coworking}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Members with 24/7 access can enter the coworking zone
                anytime. Holiday hours may vary—check our social media for updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transportation */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">Getting Here</h2>
              <p className="text-lg text-muted-foreground">
                Multiple transportation options make us easily accessible from anywhere in the Bay
                Area
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {transportOptions.map((option, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="mb-2 flex items-center space-x-3">
                      <option.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                    </div>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {option.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start">
                          <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-cs-blue"></span>
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-display text-2xl">
                  <Accessibility className="mr-2 h-6 w-6 text-cs-blue" />
                  Accessibility Information
                </CardTitle>
                <CardDescription>
                  We're committed to providing an accessible space for everyone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Building Access</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• ADA-compliant entrance on Market Street</li>
                      <li>• Elevator access to all floors</li>
                      <li>• Wide doorways and accessible pathways</li>
                      <li>• Accessible restrooms on each floor</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Workspace Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Adjustable-height desks available</li>
                      <li>• Screen reader compatible WiFi network</li>
                      <li>• Quiet zones for sensory needs</li>
                      <li>• Accessible parking nearby</li>
                    </ul>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Need specific accommodations?{' '}
                    <Link href="/contact" className="text-cs-blue hover:underline">
                      Contact us
                    </Link>{' '}
                    before your visit and we'll make sure everything is ready for you.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Neighborhood */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">
                Explore the Neighborhood
              </h2>
              <p className="text-lg text-muted-foreground">
                Located in the heart of San Francisco with great spots nearby
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {neighborhoodSpots.map((spot, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <h3 className="mb-2 font-semibold">{spot.name}</h3>
                    <Badge variant="outline" className="mb-2">
                      {spot.type}
                    </Badge>
                    <p className="mb-2 text-sm text-cs-blue">{spot.distance}</p>
                    <p className="text-xs text-muted-foreground">{spot.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">Ready to Visit?</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Drop by anytime during cafe hours, or book a workspace to guarantee your spot
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">Reserve a Desk</Link>
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
