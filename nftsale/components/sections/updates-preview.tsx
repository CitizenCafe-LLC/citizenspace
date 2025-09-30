"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const updates = [
  {
    id: 1,
    title: 'Space Tour: Inside the SoMa Loft Candidate',
    excerpt: 'We got exclusive access to photograph and measure the leading space candidate. The natural light and high ceilings exceeded our expectations...',
    date: 'March 10, 2024',
    author: 'Sarah Chen',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    category: 'Space Updates',
    featured: true,
  },
  {
    id: 2,
    title: 'Coffee Partnership: Local Roaster Collaboration',
    excerpt: 'Exciting news! We\'re partnering with Ritual Coffee Roasters to create a custom Citizen Space blend that captures the spirit of SF...',
    date: 'March 8, 2024',
    author: 'Mike Rodriguez',
    image: 'https://images.pexels.com/photos/302902/pexels-photo-302902.jpeg',
    category: 'Partnerships',
    featured: false,
  },
  {
    id: 3,
    title: 'Founder Spotlight: Meet Our Early Supporters',
    excerpt: 'This week we\'re highlighting three incredible founders who believed in our vision from day one. Their stories and insights have shaped...',
    date: 'March 5, 2024',
    author: 'Alex Kim',
    image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg',
    category: 'Community',
    featured: false,
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Space Updates': return 'bg-cs-blue text-white';
    case 'Partnerships': return 'bg-cs-sun text-cs-espresso';
    case 'Community': return 'bg-cs-apricot text-white';
    default: return 'bg-cs-muted text-white';
  }
};

export function UpdatesPreview() {
  const featuredUpdate = updates.find(update => update.featured);
  const otherUpdates = updates.filter(update => !update.featured);

  return (
    <section className="py-16 lg:py-24 bg-cs-caramel/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso mb-4">
            Latest Community Updates
          </h2>
          <p className="text-lg text-cs-muted max-w-2xl mx-auto">
            Stay in the loop with our progress, partnerships, and community highlights. Transparency is core to our mission.
          </p>
        </div>

        {featuredUpdate && (
          <div className="mb-12">
            <Card className="overflow-hidden shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300 max-w-4xl mx-auto">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredUpdate.image}
                    alt={featuredUpdate.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getCategoryColor(featuredUpdate.category)}>
                      {featuredUpdate.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-cs-success/20 text-cs-success">
                      Featured
                    </Badge>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-cs-espresso mb-4">
                    {featuredUpdate.title}
                  </h3>

                  <p className="text-cs-muted mb-6 leading-relaxed">
                    {featuredUpdate.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-cs-muted">
                      <Calendar className="h-4 w-4 mr-2" />
                      {featuredUpdate.date} • {featuredUpdate.author}
                    </div>
                    <Button variant="ghost" size="sm">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {otherUpdates.map((update) => (
            <Card key={update.id} className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300 cursor-pointer group">
              <div className="relative">
                <img
                  src={update.image}
                  alt={update.title}
                  className="w-full h-48 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  className={`absolute top-3 left-3 ${getCategoryColor(update.category)}`}
                >
                  {update.category}
                </Badge>
              </div>

              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold text-cs-espresso mb-3 group-hover:text-cs-blue transition-colors">
                  {update.title}
                </h3>

                <p className="text-cs-muted mb-4 text-sm leading-relaxed line-clamp-3">
                  {update.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-cs-muted">
                    <Calendar className="h-3 w-3 mr-1" />
                    {update.date}
                  </div>
                  <span className="text-xs text-cs-muted">{update.author}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/updates">
              View All Updates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}