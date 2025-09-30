"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const events = [
  {
    id: 1,
    title: 'Founder Mixer & Space Preview',
    date: 'March 15, 2024',
    time: '6:00 PM - 9:00 PM',
    location: 'The Summit, SoMa',
    attendees: 47,
    capacity: 75,
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    description: 'Meet fellow founders, preview potential space designs, and enjoy craft cocktails.',
    rsvpUrl: 'https://lu.ma/founder-mixer',
    featured: true,
  },
  {
    id: 2,
    title: 'Coffee Cupping & Community Chat',
    date: 'March 22, 2024',
    time: '10:00 AM - 12:00 PM',
    location: 'Blue Bottle Coffee, Mission',
    attendees: 23,
    capacity: 30,
    image: 'https://images.pexels.com/photos/302902/pexels-photo-302902.jpeg',
    description: 'Taste test our potential coffee blends and share ideas for the menu.',
    rsvpUrl: 'https://lu.ma/coffee-cupping',
    featured: false,
  },
  {
    id: 3,
    title: 'Coworking Happy Hour',
    date: 'March 29, 2024',
    time: '5:30 PM - 8:00 PM',
    location: 'WeWork SoMa',
    attendees: 31,
    capacity: 50,
    image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg',
    description: 'Network with the community over drinks and discuss membership perks.',
    rsvpUrl: 'https://lu.ma/coworking-happy-hour',
    featured: false,
  },
];

export function EventsPreview() {
  const featuredEvent = events.find(event => event.featured);
  const otherEvents = events.filter(event => !event.featured);

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso mb-4">
            Join Our Fundraiser Events
          </h2>
          <p className="text-lg text-cs-muted max-w-2xl mx-auto">
            Connect with fellow supporters, preview the space, and help shape the future of Citizen Space.
          </p>
        </div>

        {featuredEvent && (
          <div className="mb-12">
            <Card className="overflow-hidden shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300 max-w-4xl mx-auto">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-cs-sun text-cs-espresso">
                      Featured Event
                    </Badge>
                    <div className="text-sm text-cs-muted">
                      {featuredEvent.attendees}/{featuredEvent.capacity} attending
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-cs-espresso mb-4">
                    {featuredEvent.title}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-cs-muted">
                      <Calendar className="h-4 w-4 mr-3" />
                      {featuredEvent.date}
                    </div>
                    <div className="flex items-center text-cs-muted">
                      <Clock className="h-4 w-4 mr-3" />
                      {featuredEvent.time}
                    </div>
                    <div className="flex items-center text-cs-muted">
                      <MapPin className="h-4 w-4 mr-3" />
                      {featuredEvent.location}
                    </div>
                  </div>

                  <p className="text-cs-muted mb-6">
                    {featuredEvent.description}
                  </p>

                  <Button 
                    className="w-full bg-cs-blue hover:bg-cs-blue/90"
                    onClick={() => window.open(featuredEvent.rsvpUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    RSVP on Luma
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {otherEvents.map((event) => (
            <Card key={event.id} className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300">
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                  {event.attendees}/{event.capacity} attending
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold text-cs-espresso mb-3">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-4 text-sm text-cs-muted">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                </div>

                <p className="text-cs-muted mb-6 text-sm">
                  {event.description}
                </p>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(event.rsvpUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  RSVP
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/events">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}