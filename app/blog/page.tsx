import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Search, Clock, ArrowRight, Coffee, Users, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on coworking, remote work, San Francisco culture, and coffee. Stories from our community and industry thoughts.',
}

const blogPosts = [
  {
    id: 1,
    title: 'The Evolution of Coworking: From Necessity to Community',
    slug: 'evolution-of-coworking',
    excerpt:
      'How coworking spaces have transformed from simple desk rentals to thriving communities that foster innovation and connection.',
    content: 'Full blog post content would go here...',
    image:
      'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      name: 'Karsten Wade',
      avatar: '/team/karsten.jpg',
      bio: 'Founder & CEO of Citizen Space',
    },
    tags: ['Coworking', 'Community', 'Business'],
    publishedAt: new Date('2025-01-10'),
    readingTime: 8,
  },
  {
    id: 2,
    title: 'Coffee Culture and Productivity: The Perfect Blend',
    slug: 'coffee-culture-productivity',
    excerpt:
      'Exploring the relationship between coffee culture and creative productivity in modern workspaces.',
    content: 'Full blog post content would go here...',
    image:
      'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      name: 'Maria Rodriguez',
      avatar: '/team/maria.jpg',
      bio: 'Head of Community at Citizen Space',
    },
    tags: ['Coffee', 'Productivity', 'Culture'],
    publishedAt: new Date('2025-01-08'),
    readingTime: 6,
  },
  {
    id: 3,
    title: 'Building Remote Team Culture in Hybrid Workspaces',
    slug: 'remote-team-culture',
    excerpt:
      'Strategies for maintaining strong team connections when your workforce spans home offices and coworking spaces.',
    content: 'Full blog post content would go here...',
    image:
      'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      name: 'James Kim',
      avatar: '/team/james.jpg',
      bio: 'Community Manager',
    },
    tags: ['Remote Work', 'Team Building', 'Hybrid'],
    publishedAt: new Date('2025-01-05'),
    readingTime: 10,
  },
  {
    id: 4,
    title: "San Francisco's Entrepreneurial Renaissance",
    slug: 'sf-entrepreneurial-renaissance',
    excerpt:
      'How the post-pandemic landscape has created new opportunities for startups and independent workers in SF.',
    content: 'Full blog post content would go here...',
    image:
      'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      name: 'Karsten Wade',
      avatar: '/team/karsten.jpg',
      bio: 'Founder & CEO of Citizen Space',
    },
    tags: ['San Francisco', 'Entrepreneurship', 'Startups'],
    publishedAt: new Date('2025-01-02'),
    readingTime: 7,
  },
]

const categories = [
  { id: 'coworking', name: 'Coworking', icon: Users, count: 8 },
  { id: 'remote-work', name: 'Remote Work', icon: Zap, count: 12 },
  { id: 'coffee-culture', name: 'Coffee Culture', icon: Coffee, count: 6 },
  { id: 'san-francisco', name: 'San Francisco', icon: Users, count: 4 },
]

export default function BlogPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Blog & Insights
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Stories from Our <span className="gradient-text">Community</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Insights on coworking, remote work, Santa Cruz culture, and the intersection of coffee
              and creativity. Written by our team and community members.
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-center font-display text-2xl font-bold">Browse by Category</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {categories.map(category => (
                <Card key={category.id} className="card-hover cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <category.icon className="mx-auto mb-3 h-8 w-8 text-cs-blue" />
                    <h3 className="mb-1 font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} articles</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 font-display text-2xl font-bold">Featured Article</h2>
            <Card className="card-hover overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-video lg:aspect-square">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <div className="mb-4 flex gap-2">
                    {blogPosts[0].tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="mb-4 font-display text-2xl font-bold">
                    <Link href={`/blog/${blogPosts[0].slug}`} className="hover:text-cs-blue">
                      {blogPosts[0].title}
                    </Link>
                  </h3>
                  <p className="mb-6 text-muted-foreground">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={blogPosts[0].author.avatar} />
                        <AvatarFallback>
                          {blogPosts[0].author.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold">{blogPosts[0].author.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {blogPosts[0].publishedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {blogPosts[0].readingTime} min read
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 font-display text-2xl font-bold">Recent Articles</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.slice(1).map(post => (
                <Card key={post.id} className="card-hover overflow-hidden">
                  <div className="aspect-video">
                    <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                  <CardHeader className="pb-4">
                    <div className="mb-2 flex gap-2">
                      {post.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="font-display text-lg">
                      <Link href={`/blog/${post.slug}`} className="hover:text-cs-blue">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback className="text-xs">
                            {post.author.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">{post.author.name}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {post.readingTime} min
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">Stay in the Loop</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Get our latest articles, community updates, and event announcements delivered to your
              inbox monthly.
            </p>
            <div className="mx-auto flex max-w-md flex-col justify-center gap-4 sm:flex-row">
              <Input placeholder="Your email address" className="flex-1" />
              <Button className="btn-primary">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
