import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Share2, Twitter, Linkedin, Facebook, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

// This would normally come from your CMS
const blogPosts = [
  {
    slug: 'evolution-of-coworking',
    title: 'The Evolution of Coworking: From Necessity to Community',
    excerpt:
      'How coworking spaces have transformed from simple desk rentals to thriving communities that foster innovation and connection.',
    content: `The coworking movement has come a long way since its humble beginnings in 2005. What started as a simple solution to the isolation of remote work has evolved into a global phenomenon that's reshaping how we think about work, community, and collaboration.

## The Early Days

When Brad Neuberg opened the first official coworking space in San Francisco, he was solving a personal problem: the loneliness of working from home combined with the lack of freedom in traditional office environments. His solution was simple—create a space where independent workers could come together while maintaining their autonomy.

## The Community Revolution

Fast-forward to today, and coworking has become about much more than just shared desks and Wi-Fi. Modern coworking spaces like Citizen Space are community hubs that bring together diverse professionals, foster serendipitous connections, and create environments where innovation naturally occurs.

### Key Elements of Modern Coworking:

- **Intentional Community Building**: Events, workshops, and networking opportunities
- **Flexible Space Design**: Areas for focus work, collaboration, and relaxation
- **Local Integration**: Partnerships with neighborhood businesses and artists
- **Holistic Experience**: Combining work with food, culture, and wellness

## The Hybrid Future

The pandemic has accelerated the evolution of coworking once again. Today's professionals don't just need a desk—they need flexibility, community, and experiences that enrich their work life. This is why we've embraced the cafe-coworking hybrid model at Citizen Space.

By blending the accessibility of a neighborhood cafe with the amenities of a premium coworking space, we're creating something new: a place where anyone can drop in for a coffee and end up joining a vibrant professional community.

## Looking Ahead

As remote work becomes permanently embedded in our professional culture, coworking spaces will continue to evolve. We're not just providing desks anymore—we're creating the infrastructure for a new way of working that prioritizes flexibility, community, and human connection over traditional corporate hierarchies.

The future of work is flexible, community-driven, and filled with possibility. And it's happening right here in spaces like ours, one coffee conversation at a time.`,
    image:
      'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200',
    author: {
      name: 'Karsten Wade',
      avatar: '/team/karsten.jpg',
      bio: "Founder & CEO of Citizen Space. Karsten started Citizen Space in 2006 as one of San Francisco's first coworking spaces and has been at the forefront of the community-driven workspace movement ever since.",
    },
    tags: ['Coworking', 'Community', 'Business', 'Future of Work'],
    publishedAt: new Date('2025-01-10'),
    readingTime: 8,
  },
]

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find(p => p.slug === params.slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author.name],
      images: [{ url: post.image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find(p => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="py-12">
      {/* Navigation */}
      <section className="pb-8">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Article Header */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="mb-6 font-display text-4xl font-bold lg:text-5xl">{post.title}</h1>

            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {post.author.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{post.author.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {post.publishedAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {post.readingTime} min read
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="mb-8 aspect-video overflow-hidden rounded-lg">
              <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">{post.content}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Author Bio */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Separator className="mb-8" />
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="text-lg">
                      {post.author.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="mb-2 font-display text-xl font-bold">
                      About {post.author.name}
                    </h3>
                    <p className="text-muted-foreground">{post.author.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Share Options */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h3 className="mb-4 font-display text-xl font-bold">Share This Article</h3>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm">
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center font-display text-3xl font-bold">Continue Reading</h2>
            <div className="text-center">
              <Button asChild variant="outline">
                <Link href="/blog">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
