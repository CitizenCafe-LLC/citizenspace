import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Heart, Coffee, Cake } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Partners',
  description: 'Meet the local San Francisco roasters, bakeries, and artisans who help create our authentic cafe experience.',
};

const partners = [
  {
    name: 'Four Barrel Coffee',
    type: 'Roaster',
    description: 'Mission-based roaster known for their meticulous approach to sourcing and roasting. We feature their house blend and rotating single origins.',
    established: '2008',
    location: 'Mission District',
    website: 'https://fourbarrelcoffee.com',
    specialty: 'Direct trade single origins',
    icon: Coffee,
  },
  {
    name: 'Arsicault Bakery',
    type: 'Bakery',
    description: 'Award-winning French bakery creating authentic croissants and pastries. Named best croissant in America by Bon Appétit.',
    established: '2016',
    location: 'Richmond District',
    website: 'https://arsicaultbakery.com',
    specialty: 'Traditional French pastries',
    icon: Cake,
  },
  {
    name: 'Ritual Coffee Roasters',
    type: 'Roaster',
    description: 'Pioneer of San Francisco\'s third-wave coffee movement. Their commitment to quality and sustainability aligns perfectly with our values.',
    established: '2005',
    location: 'Hayes Valley',
    website: 'https://ritualroasters.com',
    specialty: 'Seasonal espresso blends',
    icon: Coffee,
  },
  {
    name: 'The Mill',
    type: 'Bakery',
    description: 'Artisan bakery and cafe known for their famous thick toast and house-made everything. They supply our sourdough bread.',
    established: '2012',
    location: 'Divisadero',
    website: 'https://themillsf.com',
    specialty: 'Artisan sourdough bread',
    icon: Cake,
  },
];

const partnershipBenefits = [
  {
    title: 'Community Support',
    description: 'We prioritize local businesses to strengthen our neighborhood economy'
  },
  {
    title: 'Quality Guarantee',
    description: 'Every partner is chosen for their commitment to excellence and craft'
  },
  {
    title: 'Sustainable Practices',
    description: 'We work with businesses that share our values around sustainability'
  },
  {
    title: 'Fresh Daily',
    description: 'Short supply chains mean everything arrives fresh and at peak quality'
  }
];

export default function PartnersPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Local Partnerships
            </Badge>
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Made with{' '}
              <span className="gradient-text">Local Love</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Every cup and bite supports local San Francisco businesses. 
              Meet the artisans and craftspeople who help create our authentic cafe experience.
            </p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {partners.map((partner, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <partner.icon className="h-8 w-8 text-primary" />
                    </div>
                    <Badge variant="outline">{partner.type}</Badge>
                  </div>
                  <CardTitle className="font-display text-2xl">{partner.name}</CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Est. {partner.established}</span>
                    <span>{partner.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{partner.description}</p>
                  <div>
                    <h4 className="font-semibold mb-2">Specialty:</h4>
                    <p className="text-sm text-muted-foreground">{partner.specialty}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={partner.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Why We Partner Locally
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Supporting local businesses isn't just good for our community—it ensures 
              the highest quality and freshest products for our customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnershipBenefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <Heart className="h-8 w-8 text-cs-sun mb-2" />
                  <CardTitle className="font-display text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Taste the Difference
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience the quality and care that comes from working with 
              Santa Cruz's finest local producers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/cafe/menu">View Our Menu</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/location">Visit Our Cafe</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}