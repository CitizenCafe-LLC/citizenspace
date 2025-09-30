'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const updates = [
  {
    id: 1,
    title: 'Space Tour: Inside the old FlowerBar Space',
    excerpt: 'We got exclusive access to photograph and measure the leading space candidate. The natural light and high ceilings exceeded our expectations, and the location puts us right in the heart of Santa Cruz\'s startup ecosystem.',
    content: 'Full update content would go here...',
    date: 'October 1, 2025',
    author: 'Karsten Wade',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    category: 'Space Updates',
  },
  {
    id: 2,
    title: 'Coffee Partnership: Local Roaster Collaboration',
    excerpt: 'Exciting news! We\'re partnering with Ritual Coffee Roasters to create a custom Citizen Space blend that captures the spirit of SF innovation and community.',
    content: 'Full update content would go here...',
    date: 'October 1, 2025',
    author: 'Karsten Wade',
    image: 'https://images.pexels.com/photos/302902/pexels-photo-302902.jpeg',
    category: 'Partnerships',
  },
  {
    id: 3,
    title: 'Founder Spotlight: Meet Our Early Supporters',
    excerpt: 'This week we\'re highlighting three incredible founders who believed in our vision from day one. Their stories and insights have shaped our approach to building the perfect coworking space.',
    content: 'Full update content would go here...',
    date: 'October 1, 2025',
    author: 'Karsten Wade',
    image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg',
    category: 'Community',
  },
  {
    id: 4,
    title: 'Funding Milestone: 75% to Minimum Goal',
    excerpt: 'Amazing progress this week! We\'ve reached 75% of our minimum funding goal thanks to incredible community support. Here\'s what we\'ve learned and what comes next.',
    content: 'Full update content would go here...',
    date: 'October 1, 2025',
    author: 'Karsten Wade',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
    category: 'Fundraising',
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Space Updates': return 'bg-cs-blue text-white';
    case 'Partnerships': return 'bg-cs-sun text-cs-espresso';
    case 'Community': return 'bg-cs-apricot text-white';
    case 'Fundraising': return 'bg-cs-success text-white';
    default: return 'bg-cs-muted text-white';
  }
};

export default function UpdatesPage() {
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
              Community Updates
            </h1>
            <p className="text-lg text-cs-muted max-w-2xl mx-auto">
              Stay informed about our progress, partnerships, and community highlights. 
              Transparency is at the core of everything we do.
            </p>
          </div>

          <div className="space-y-8">
            {updates.map((update) => (
              <Card key={update.id} className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={update.image}
                      alt={update.title}
                      className="w-full h-48 md:h-full object-cover rounded-l-2xl"
                    />
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getCategoryColor(update.category)}>
                        {update.category}
                      </Badge>
                      <div className="flex items-center text-sm text-cs-muted">
                        <Calendar className="h-4 w-4 mr-2" />
                        {update.date}
                      </div>
                    </div>

                    <h2 className="font-display text-2xl font-bold text-cs-espresso mb-4">
                      {update.title}
                    </h2>

                    <p className="text-cs-muted mb-6 leading-relaxed">
                      {update.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-cs-muted">By {update.author}</span>
                      <Button variant="ghost" size="sm">
                        Read Full Update
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

    </main>
  );
}