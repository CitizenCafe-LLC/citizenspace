import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  ExternalLink,
  ArrowLeft,
  Share2
} from 'lucide-react';
import type { Metadata } from 'next';

// This would normally come from your CMS
const events = [
  {
    slug: 'digital-art-basics',
    title: 'Digital Art Basics Workshop',
    date: '2024-01-15',
    time: '7:00 PM - 9:00 PM',
    location: 'Citizen Space Main Floor',
    host: 'Maya Chen',
    type: 'Workshop',
    capacity: 20,
    price: 25,
    description: 'Learn the fundamentals of digital art creation using Procreate and Adobe Creative Suite.',
    longDescription: `Join local artist Maya Chen for an immersive introduction to digital art. This hands-on workshop covers the essentials of digital illustration, from basic brush techniques to color theory and composition.

    What you'll learn:
    • Procreate basics and interface navigation
    • Brush selection and custom brush creation
    • Layer management and blending modes
    • Color theory for digital art
    • Composition and layout principles
    • Export settings for different platforms

    What's included:
    • iPad and Apple Pencil (if you don't have one)
    • Procreate license for the workshop
    • Take-home digital art guide
    • Light refreshments

    Maya is a Bay Area digital artist whose work has been featured in SF galleries and tech company campaigns. She specializes in character design and has worked with startups on branding projects.`,
    image: '/events/digital-art.jpg',
    tags: ['Creative', 'Beginner-Friendly'],
    rsvpLink: 'https://lu.ma/digital-art-basics',
    requirements: ['No experience necessary', 'Materials provided', 'Bring enthusiasm!']
  }
];

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = events.find(e => e.slug === params.slug);
  
  if (!event) {
    return { title: 'Event Not Found' };
  }

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      type: 'article',
      publishedTime: event.date,
      images: [{ url: event.image, width: 1200, height: 630 }],
    },
  };
}

export default function EventDetailPage({ params }: Props) {
  const event = events.find(e => e.slug === params.slug);
  
  if (!event) {
    notFound();
  }

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
            
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-8">
              <Calendar className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">{event.type}</Badge>
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              {event.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="pb-12">
        <div className="container">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{event.longDescription}</div>
                </CardContent>
              </Card>

              {event.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {event.requirements.map((req, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-cs-blue rounded-full mr-3"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">{event.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{event.location}</div>
                      <div className="text-sm text-muted-foreground">
                        420 Pacific Ave, Santa Cruz
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{event.capacity} attendees max</div>
                      <div className="text-sm text-muted-foreground">
                        Hosted by {event.host}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cs-blue mb-2">
                      {event.price > 0 ? `$${event.price}` : 'Free'}
                    </div>
                    {event.price > 0 && (
                      <div className="text-sm text-muted-foreground">per person</div>
                    )}
                  </div>
                  
                  <Button asChild className="w-full btn-primary" size="lg">
                    <Link href={event.rsvpLink} target="_blank" rel="noopener noreferrer">
                      RSVP Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Event
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/location">Get Directions</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              You Might Also Like
            </h2>
            <div className="text-center">
              <Button asChild variant="outline">
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}