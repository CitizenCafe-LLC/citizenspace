import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Learn about Citizen Space's history, mission, and the team behind San Francisco's unique coffee and coworking hybrid.",
}

const timeline = [
  {
    year: '2006',
    title: 'The Beginning',
    description:
      "Started as one of Santa Cruz's first coworking spaces, fostering community among entrepreneurs and creators.",
  },
  {
    year: '2015',
    title: 'Growing the Community',
    description:
      'Expanded to support hundreds of members, hosting events and building lasting professional relationships.',
  },
  {
    year: '2023',
    title: 'The Hybrid Vision',
    description:
      'Reimagined as a coffee-forward space that welcomes everyone while maintaining our coworking roots.',
  },
  {
    year: '2024',
    title: 'Pop-Up Era',
    description:
      'Started operating pop-ups in San Francisco and Santa Cruz to build community and test our hybrid model.',
  },
  {
    year: '2025',
    title: 'Community Building',
    description: 'Continued doing pop-ups and events, launched NFT and fundraising efforts begin.',
  },
  {
    year: '2026',
    title: 'The Rebirth',
    description:
      'New Santa Cruz, CA space opening Spring 2026 with our perfected cafe-coworking hybrid model.',
  },
]

const team = [
  {
    name: 'Alex Chen',
    role: 'Founder & CEO',
    image: '/team/alex.jpg',
    bio: 'Started Citizen Space in 2006 with a vision of democratizing workspace access in San Francisco.',
  },
  {
    name: 'Maria Rodriguez',
    role: 'Head of Community',
    image: '/team/maria.jpg',
    bio: 'Former event organizer who joined in 2015 and has built our vibrant community programming.',
  },
  {
    name: 'James Kim',
    role: 'Coffee Director',
    image: '/team/james.jpg',
    bio: 'Award-winning barista who curates our coffee program and partners with local roasters.',
  },
]

const values = [
  {
    title: 'Collaboration',
    description:
      'We believe great work happens when people connect, share ideas, and build together across disciplines and backgrounds.',
  },
  {
    title: 'Openness',
    description:
      'Transparency in our operations, welcoming to all perspectives, and open to new ideas that strengthen our community.',
  },
  {
    title: 'Community',
    description:
      'Building genuine connections and fostering an environment where everyone feels they belong and can thrive.',
  },
  {
    title: 'Accessibility',
    description:
      "Quality workspace shouldn't be exclusive. We offer options from $2/hour to dedicated desks for everyone.",
  },
  {
    title: 'Sustainability',
    description:
      'Building a business that serves our community for decades while supporting local partners and responsible practices.',
  },
]

export default function AboutPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              Our Story
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Building Community Since 2006
            </h1>
            <p className="text-xl text-muted-foreground">
              From Santa Cruz's coworking pioneers to today's coffee-forward hybrid space, we've
              always believed that great work happens when people come together.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-16 text-center font-display text-3xl font-bold lg:text-4xl">
              Our Journey
            </h2>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex-shrink-0 md:w-32">
                    <Badge variant="outline" className="px-4 py-2 text-lg">
                      {item.year}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-3 font-display text-2xl font-semibold">{item.title}</h3>
                    <p className="text-lg text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            {/* Open Coworking Introduction */}
            <div className="mb-16 text-center">
              <Badge variant="secondary" className="mb-6">
                Open Coworking Movement
              </Badge>
              <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">
                Part of Something Bigger
              </h2>
              <div className="prose prose-lg mx-auto max-w-3xl text-muted-foreground">
                <p>
                  The members of this Community are engaged with and working on a model and approach
                  that we call <strong>Open Coworking</strong>. We are spaces all over the world, we
                  work in many different languages and our businesses all look very different. So
                  how can we all be part of one big community?
                </p>
                <p>
                  Here's how. We have all committed to the same core values that guide everything we
                  do:
                </p>
              </div>
            </div>

            <div className="mb-16 text-center">
              <h3 className="mb-6 font-display text-2xl font-bold lg:text-3xl">Our Core Values</h3>
              <p className="text-xl text-muted-foreground">
                These five principles shape our community and connect us to coworking spaces
                worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="font-display text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Local Application */}
            <div className="mt-16 text-center">
              <Card className="bg-muted/30">
                <CardContent className="p-8">
                  <h4 className="mb-4 font-display text-xl font-semibold">
                    How We Live These Values in Santa Cruz
                  </h4>
                  <p className="text-muted-foreground">
                    From our partnerships with local roasters and bakeries, to our flexible pricing
                    that welcomes everyone, to our commitment to building lasting community
                    connections— these values aren't just words on a wall. They're the foundation of
                    everything we do.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">Meet the Team</h2>
              <p className="text-xl text-muted-foreground">
                The people behind the space, dedicated to creating the best experience for our
                community.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <Avatar className="mx-auto mb-4 h-24 w-24">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback className="text-lg">
                        {member.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-display text-xl">{member.name}</CardTitle>
                    <p className="font-medium text-cs-blue">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-12 font-display text-3xl font-bold lg:text-4xl">In the Press</h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card>
                <CardContent className="p-8">
                  <blockquote className="mb-4 text-lg italic">
                    "Citizen Space represents the evolution of coworking—accessible,
                    community-driven, and coffee-forward."
                  </blockquote>
                  <footer className="text-muted-foreground">— SF Business Journal</footer>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <blockquote className="mb-4 text-lg italic">
                    "A perfect blend of productivity and community that welcomes everyone from
                    freelancers to established teams."
                  </blockquote>
                  <footer className="text-muted-foreground">— TechCrunch</footer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
