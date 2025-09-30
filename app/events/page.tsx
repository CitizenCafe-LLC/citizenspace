import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  ArrowRight,
  Palette,
  Code,
  Coffee,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Join our community events, workshops, and networking sessions. From creative workshops to tech talks.',
}

const upcomingEvents = [
  {
    id: '1',
    title: 'Digital Art Basics Workshop',
    slug: 'digital-art-basics',
    date: '2024-01-15',
    time: '7:00 PM - 9:00 PM',
    location: 'Citizen Space Main Floor',
    host: 'Maya Chen',
    type: 'Workshop',
    capacity: 20,
    price: 25,
    description:
      'Learn the fundamentals of digital art creation using Procreate and Adobe Creative Suite.',
    image: '/events/digital-art.jpg',
    tags: ['Creative', 'Beginner-Friendly'],
    rsvpLink: 'https://lu.ma/digital-art-basics',
  },
  {
    id: '2',
    title: 'Entrepreneur Breakfast',
    slug: 'entrepreneur-breakfast',
    date: '2024-01-20',
    time: '8:00 AM - 10:00 AM',
    location: 'Citizen Space Cafe',
    host: 'SF Entrepreneurs Guild',
    type: 'Networking',
    capacity: 30,
    price: 0,
    description:
      'Monthly networking breakfast for startup founders and entrepreneurs in the Bay Area.',
    image: '/events/networking.jpg',
    tags: ['Networking', 'Business'],
    rsvpLink: 'https://eventbrite.com/entrepreneur-breakfast',
  },
  {
    id: '3',
    title: 'JavaScript Deep Dive',
    slug: 'javascript-deep-dive',
    date: '2024-01-25',
    time: '6:30 PM - 8:30 PM',
    location: 'Boardroom',
    host: 'Alex Kim',
    type: 'Tech Talk',
    capacity: 15,
    price: 15,
    description: 'Advanced JavaScript concepts, async patterns, and modern ES6+ features.',
    image: '/events/javascript.jpg',
    tags: ['Technical', 'Advanced'],
    rsvpLink: 'https://lu.ma/javascript-deep-dive',
  },
  {
    id: '4',
    title: 'Coffee Cupping Session',
    slug: 'coffee-cupping',
    date: '2024-01-28',
    time: '10:00 AM - 12:00 PM',
    location: 'Citizen Space Cafe',
    host: 'Four Barrel Coffee',
    type: 'Experience',
    capacity: 12,
    price: 20,
    description: 'Learn to taste coffee like a professional with our partner roasters.',
    image: '/events/cupping.jpg',
    tags: ['Coffee', 'Educational'],
    rsvpLink: 'https://eventbrite.com/coffee-cupping',
  },
]

const eventTypes = [
  { id: 'all', name: 'All Events', icon: Calendar },
  { id: 'workshop', name: 'Workshops', icon: Palette },
  { id: 'networking', name: 'Networking', icon: Users },
  { id: 'tech-talk', name: 'Tech Talks', icon: Code },
  { id: 'experience', name: 'Experiences', icon: Coffee },
]

export default function EventsPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Community Events
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Learn, Connect, <span className="gradient-text">Create Together</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Join our vibrant community for workshops, talks, networking events, and unique
              experiences. From creative sessions to tech deep-dives, there's something for
              everyone.
            </p>
            <Button asChild size="lg" className="btn-primary">
              <Link href="#upcoming-events">
                See Upcoming Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Event Types Filter */}
      <section className="pb-12" id="upcoming-events">
        <div className="container">
          <Tabs defaultValue="all" className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">Upcoming Events</h2>
              <p className="text-lg text-muted-foreground">
                Filter by type or browse all our community events
              </p>
            </div>

            <TabsList className="mb-12 grid w-full grid-cols-2 lg:grid-cols-5">
              {eventTypes.map(type => (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>

            {eventTypes.slice(1).map(type => (
              <TabsContent key={type.id} value={type.id}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {upcomingEvents
                    .filter(event => event.type.toLowerCase().replace(' ', '-') === type.id)
                    .map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Host an Event CTA */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">
              Want to Host an Event?
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Share your expertise with our community. We provide the space, you bring the knowledge
              and passion.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/contact">Propose an Event</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/membership">See Host Benefits</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function EventCard({ event }: { event: (typeof upcomingEvents)[0] }) {
  return (
    <Card className="card-hover">
      <div className="flex aspect-video items-center justify-center rounded-t-lg bg-muted">
        <Calendar className="h-12 w-12 text-muted-foreground" />
      </div>
      <CardHeader>
        <div className="mb-2 flex items-start justify-between">
          <Badge variant="outline">{event.type}</Badge>
          <div className="text-right">
            {event.price > 0 ? (
              <span className="text-lg font-bold text-cs-blue">${event.price}</span>
            ) : (
              <Badge className="bg-green-100 text-green-800">Free</Badge>
            )}
          </div>
        </div>
        <CardTitle className="font-display text-xl">
          <Link href={`/events/${event.slug}`} className="hover:text-cs-blue">
            {event.title}
          </Link>
        </CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          {new Date(event.date).toLocaleDateString()} • {event.time}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          {event.location}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          {event.capacity} spots available • Hosted by {event.host}
        </div>
        <div className="flex gap-2">
          {event.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <Button asChild className="btn-primary w-full">
          <Link href={event.rsvpLink} target="_blank" rel="noopener noreferrer">
            RSVP on {event.rsvpLink.includes('lu.ma') ? 'Luma' : 'Eventbrite'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
