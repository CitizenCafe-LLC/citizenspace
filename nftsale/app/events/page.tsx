'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const events = [
  {
    id: 1,
    title: 'Founder Mixer & Space Preview',
    date: 'October 1, 2025',
    time: '6:00 PM - 9:00 PM',
    location: 'The Summit, SoMa',
    attendees: 47,
    capacity: 75,
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    description: 'Join fellow founders for an evening of networking, space design previews, and craft cocktails. Get a first look at our potential layouts and share your input on what makes the perfect coworking space.',
    rsvpUrl: 'https://lu.ma/founder-mixer',
    status: 'upcoming',
  },
  {
    id: 2,
    title: 'Coffee Cupping & Community Chat',
    date: 'October 1, 2025',
    time: '10:00 AM - 12:00 PM',
    location: 'Blue Bottle Coffee, Mission',
    attendees: 23,
    capacity: 30,
    image: 'https://images.pexels.com/photos/302902/pexels-photo-302902.jpeg',
    description: 'Taste test potential coffee blends for Citizen Space and help us craft the perfect menu. Learn about our partnership with local roasters and share your preferences.',
    rsvpUrl: 'https://lu.ma/coffee-cupping',
    status: 'upcoming',
  },
  {
    id: 3,
    title: 'Coworking Happy Hour',
    date: 'October 1, 2025',
    time: '5:30 PM - 8:00 PM',
    location: 'WeWork SoMa',
    attendees: 31,
    capacity: 50,
    image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg',
    description: 'Network with the growing Citizen Space community over drinks and appetizers. Discuss membership benefits, share startup stories, and build lasting connections.',
    rsvpUrl: 'https://lu.ma/coworking-happy-hour',
    status: 'upcoming',
  },
  {
    id: 4,
    title: 'Space Planning Workshop',
    date: 'October 1, 2025',
    time: '2:00 PM - 5:00 PM',
    location: 'Potential SoMa Location',
    attendees: 0,
    capacity: 40,
    image: 'https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg',
    description: 'Roll up your sleeves and help design the space! Work with our architects and designers to plan the optimal layout for productivity, community, and comfort.',
    rsvpUrl: 'https://lu.ma/space-planning',
    status: 'upcoming',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'upcoming':
      return <Badge className="bg-cs-blue text-white">Upcoming</Badge>;
    case 'past':
      return <Badge className="bg-cs-muted text-white">Past Event</Badge>;
    default:
      return null;
  }
};

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-cs-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-cs-espresso mb-4">
              Fundraiser Events
            </h1>
            <p className="text-lg text-cs-muted max-w-2xl mx-auto">
              Connect with fellow founders, preview the space, and help shape the future of Citizen Space. 
              All events are free for NFT holders and supporters.
            </p>
          </div>

          <div className="grid gap-8">
            {events.map((event) => (
              <Card key={event.id} className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className="relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 md:h-full object-cover rounded-l-2xl"
                      />
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                        {event.attendees}/{event.capacity} attending
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-8">
                    <h2 className="font-display text-2xl font-bold text-cs-espresso mb-4">
                      {event.title}
                    </h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-cs-muted">
                        <Calendar className="h-4 w-4 mr-3" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-cs-muted">
                        <Clock className="h-4 w-4 mr-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-cs-muted">
                        <MapPin className="h-4 w-4 mr-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-cs-muted">
                        <Users className="h-4 w-4 mr-3" />
                        {event.attendees} attending
                      </div>
                    </div>

                    <p className="text-cs-muted mb-6 leading-relaxed">
                      {event.description}
                    </p>

                    <Button 
                      className="w-full md:w-auto bg-cs-blue hover:bg-cs-blue/90"
                      onClick={() => window.open(event.rsvpUrl, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      RSVP on Luma
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 p-8 bg-cs-sun/10 rounded-2xl">
            <h3 className="font-display text-xl font-semibold text-cs-espresso mb-3">
              Host Your Own Event
            </h3>
            <p className="text-cs-muted mb-4">
              Want to organize a Citizen Space community event? We'd love to support founder-led initiatives!
            </p>
            <Button variant="outline">
              Propose an Event
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}