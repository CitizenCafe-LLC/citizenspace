import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Users, 
  Monitor, 
  Volume2, 
  Presentation,
  ArrowRight,
  Calendar,
  Clock,
  Wifi
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meeting Rooms',
  description: 'Private meeting rooms for teams with whiteboards, displays, and professional AV equipment. Book by the hour.',
};

const rooms = [
  {
    name: 'Focus Room',
    capacity: '2-4 people',
    price: '$25/hour',
    features: [
      '55" wall-mounted display',
      'Wireless presentation',
      'Whiteboard walls',
      'Sound isolation',
      'Natural lighting'
    ],
    image: '/workspaces/focus-room.jpg',
    available: true
  },
  {
    name: 'Collaborate',
    capacity: '4-6 people',
    price: '$40/hour',
    features: [
      '65" interactive display',
      'Conference camera',
      'Premium audio system',
      'Glass walls with blinds',
      'Standing desk option'
    ],
    image: '/workspaces/collaborate-room.jpg',
    available: false
  },
  {
    name: 'Boardroom',
    capacity: '6-8 people',
    price: '$60/hour',
    features: [
      'Large conference table',
      'Dual 55" displays',
      'Professional lighting',
      'Full sound isolation',
      'Executive seating'
    ],
    image: '/workspaces/boardroom.jpg',
    available: true
  }
];

const amenities = [
  {
    icon: Monitor,
    title: 'Professional Displays',
    description: 'High-resolution screens in every room with wireless casting'
  },
  {
    icon: Volume2,
    title: 'Sound Isolation',
    description: 'Acoustic treatment ensures privacy for sensitive discussions'
  },
  {
    icon: Presentation,
    title: 'Presentation Tools',
    description: 'Whiteboards, markers, and digital annotation capabilities'
  },
  {
    icon: Wifi,
    title: 'Premium Connectivity',
    description: 'Dedicated network access with enterprise-grade security'
  },
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Reserve online or via app with instant confirmation'
  },
  {
    icon: Clock,
    title: 'Flexible Duration',
    description: 'Book from 30 minutes to full-day sessions'
  }
];

const useCases = [
  {
    title: 'Client Presentations',
    description: 'Impress clients with professional meeting spaces and high-quality AV equipment'
  },
  {
    title: 'Team Workshops',
    description: 'Collaborative spaces with whiteboards and tools for productive brainstorming'
  },
  {
    title: 'Remote Interviews',
    description: 'Professional backdrop and excellent audio/video quality for virtual meetings'
  },
  {
    title: 'Training Sessions',
    description: 'Spacious rooms with displays and presentation capabilities for team training'
  }
];

export default function MeetingRoomsPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Meeting Rooms
            </Badge>
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Private Spaces for{' '}
              <span className="gradient-text">Professional Meetings</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Book professional meeting rooms with premium AV equipment, whiteboards, 
              and sound isolation. Perfect for client presentations, team workshops, and important calls.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">
                  Book a Room
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

      {/* Room Options */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Choose Your Room
            </h2>
            <p className="text-lg text-muted-foreground">
              Three professional spaces designed for different meeting needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((room, index) => (
              <Card key={index} className="card-hover">
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-display text-xl">{room.name}</CardTitle>
                      <p className="text-muted-foreground text-sm">{room.capacity}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cs-blue">{room.price}</div>
                      <Badge variant={room.available ? "secondary" : "outline"}>
                        {room.available ? "Available" : "In Use"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {room.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <ArrowRight className="h-3 w-3 mr-2 text-cs-blue" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full btn-primary" disabled={!room.available}>
                    <Link href="/booking">
                      {room.available ? "Book This Room" : "Join Waitlist"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Room Amenities */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Professional Amenities
            </h2>
            <p className="text-lg text-muted-foreground">
              Every meeting room comes equipped with tools for productive sessions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Use Cases */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Perfect For
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional spaces that adapt to your meeting needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Booking Information
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about reserving meeting rooms
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Minimum Duration:</span>
                    <span className="font-semibold">30 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum Duration:</span>
                    <span className="font-semibold">8 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Advance Booking:</span>
                    <span className="font-semibold">Up to 30 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancellation:</span>
                    <span className="font-semibold">2 hours notice</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Member Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Day Pass Holders:</span>
                    <span className="font-semibold">No hours included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cafe Members:</span>
                    <span className="font-semibold">4 hours included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resident Members:</span>
                    <span className="font-semibold">8 hours included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority Booking:</span>
                    <span className="font-semibold">Yes</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cs-blue/10 to-cs-sun/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Book Your Meeting Room
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Professional spaces available now. Reserve online or visit us to see the rooms in person.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">Reserve Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/membership">See Membership Benefits</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}