import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Camera, Users, Coffee, Palette } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Explore our vibrant coworking and cafe space through photos of our community, events, and beautiful San Francisco location.',
}

const galleryCategories = [
  { id: 'all', name: 'All Photos', icon: Camera },
  { id: 'space', name: 'The Space', icon: Coffee },
  { id: 'community', name: 'Community', icon: Users },
  { id: 'events', name: 'Events', icon: Palette },
]

const galleryImages = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Main coworking floor with natural lighting',
    category: 'space',
    title: 'Main Floor',
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Coffee bar with barista preparing drinks',
    category: 'space',
    title: 'Coffee Bar',
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Community members working together',
    category: 'community',
    title: 'Collaborative Work',
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Digital art workshop in progress',
    category: 'events',
    title: 'Creative Workshop',
  },
  {
    id: 5,
    src: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Meeting room with team collaboration',
    category: 'space',
    title: 'Meeting Room',
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Networking event with community members',
    category: 'events',
    title: 'Networking Event',
  },
  {
    id: 7,
    src: 'https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Quiet focus area for concentrated work',
    category: 'space',
    title: 'Focus Zone',
  },
  {
    id: 8,
    src: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Community lunch gathering',
    category: 'community',
    title: 'Community Lunch',
  },
]

export default function GalleryPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Photo Gallery
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              See Our <span className="gradient-text">Vibrant Community</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              From quiet focus sessions to lively workshops, explore the energy and atmosphere that
              makes Citizen Space a unique place to work and connect.
            </p>
            <Button asChild size="lg" className="btn-primary">
              <Link href="/contact">Schedule a Tour</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Tabs */}
      <section className="pb-20">
        <div className="container">
          <Tabs defaultValue="all" className="mx-auto max-w-6xl">
            <TabsList className="mb-12 grid w-full grid-cols-2 lg:grid-cols-4">
              {galleryCategories.map(category => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {galleryCategories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {galleryImages
                    .filter(img => category.id === 'all' || img.category === category.id)
                    .map(image => (
                      <Card key={image.id} className="card-hover group overflow-hidden">
                        <div className="relative aspect-square">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-end bg-black/0 transition-colors group-hover:bg-black/20">
                            <div className="p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                              <h3 className="font-semibold">{image.title}</h3>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Virtual Tour CTA */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">Want to See More?</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Schedule an in-person tour or explore our virtual walkthrough to get the full Citizen
              Space experience.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/contact">Schedule In-Person Tour</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/location">Visit Our Location</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
