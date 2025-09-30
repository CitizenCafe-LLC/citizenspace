import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MapPin, Clock, Brain as Train, Car, Bike, Accessibility, Phone, Mail, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Location & Directions',
  description: 'Visit Citizen Space at 1899 Market Street in San Francisco. Easy access by BART, Muni, bike, and car with detailed directions.',
};

const hours = [
  { day: 'Monday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Tuesday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Wednesday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Thursday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Friday', cafe: '7:00 AM - 10:00 PM', coworking: '7:00 AM - 10:00 PM' },
  { day: 'Saturday', cafe: '8:00 AM - 8:00 PM', coworking: '8:00 AM - 8:00 PM' },
  { day: 'Sunday', cafe: '8:00 AM - 8:00 PM', coworking: '8:00 AM - 8:00 PM' }
];

const transportOptions = [
  {
    icon: Train,
    title: 'BART & Muni',
    description: 'Civic Center/UN Plaza BART (2 blocks)',
    details: [
      'BART: All lines stop at Civic Center',
      'Muni: Multiple bus lines on Market St',
      '2-minute walk from Civic Center station'
    ]
  },
  {
    icon: Bike,
    title: 'Bike Friendly',
    description: 'Bike racks and Bay Wheels stations nearby',
    details: [
      'Secure bike parking available',
      'Bay Wheels station at UN Plaza',
      'Market St bike lane access'
    ]
  },
  {
    icon: Car,
    title: 'Parking Options',
    description: 'Street parking and nearby garages',
    details: [
      'Metered street parking available',
      'UN Plaza Garage (2 blocks)',
      'Civic Center Garage nearby'
    ]
  }
];

const neighborhoodSpots = [
  {
    name: 'Santa Cruz Beach Boardwalk',
    type: 'Attraction',
    distance: '3 blocks',
    description: 'Historic seaside amusement park and beach'
  },
  {
    name: 'Downtown Farmers Market',
    type: 'Market',
    distance: '2 blocks',
    description: 'Wednesday farmers market with local produce'
  },
  {
    name: 'Santa Cruz Museum of Art & History',
    type: 'Culture',
    distance: '4 blocks',
    description: 'Local art, history, and community events'
  },
  {
    name: 'Pacific Avenue',
    type: 'Shopping',
    distance: '0 blocks',
    description: 'Main shopping and dining street'
  }
];

export default function LocationPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Visit Us
            </Badge>
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Right in the{' '}
              <span className="gradient-text">Heart of SC</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find us on Pacific Avenue with easy access to Highway 1, local transit, and all of Santa Cruz. 
              We're in the heart of downtown, steps from the beach and boardwalk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="font-display text-2xl flex items-center">
                    <MapPin className="h-6 w-6 mr-2 text-cs-blue" />
                    Our Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Citizen Space</h3>
                    <address className="not-italic text-muted-foreground">
                      420 Pacific Ave<br />
                      Santa Cruz, CA 95060
                    </address>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>(831) 295-1482</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>hello@citizenspace.com</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Quick Navigation</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Apple Maps
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Train className="h-4 w-4 mr-2" />
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
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 mr-3 text-cs-blue" />
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
                        <th className="text-left p-4">Day</th>
                        <th className="text-left p-4">Cafe Hours</th>
                        <th className="text-left p-4">Coworking Hours</th>
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
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Members with 24/7 access can enter the coworking zone anytime. 
                Holiday hours may vary—check our social media for updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transportation */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Getting Here
              </h2>
              <p className="text-lg text-muted-foreground">
                Multiple transportation options make us easily accessible from anywhere in the Bay Area
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {transportOptions.map((option, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <option.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                    </div>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {option.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start">
                          <span className="w-2 h-2 bg-cs-blue rounded-full mr-3 mt-2 flex-shrink-0"></span>
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
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl flex items-center">
                  <Accessibility className="h-6 w-6 mr-2 text-cs-blue" />
                  Accessibility Information
                </CardTitle>
                <CardDescription>
                  We're committed to providing an accessible space for everyone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Building Access</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• ADA-compliant entrance on Market Street</li>
                      <li>• Elevator access to all floors</li>
                      <li>• Wide doorways and accessible pathways</li>
                      <li>• Accessible restrooms on each floor</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Workspace Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Adjustable-height desks available</li>
                      <li>• Screen reader compatible WiFi network</li>
                      <li>• Quiet zones for sensory needs</li>
                      <li>• Accessible parking nearby</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Need specific accommodations? <Link href="/contact" className="text-cs-blue hover:underline">Contact us</Link> before your visit and we'll make sure everything is ready for you.
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Explore the Neighborhood
              </h2>
              <p className="text-lg text-muted-foreground">
                Located in the heart of San Francisco with great spots nearby
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {neighborhoodSpots.map((spot, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">{spot.name}</h3>
                    <Badge variant="outline" className="mb-2">{spot.type}</Badge>
                    <p className="text-sm text-cs-blue mb-2">{spot.distance}</p>
                    <p className="text-xs text-muted-foreground">{spot.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cs-blue/10 to-cs-sun/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Ready to Visit?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Drop by anytime during cafe hours, or book a workspace to guarantee your spot
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
  );
}