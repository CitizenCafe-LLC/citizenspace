"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { MapPin, Square, Wifi, Coffee, Car } from 'lucide-react';

const spaces = [
  {
    id: 1,
    name: 'SoMa Loft Space',
    neighborhood: 'South of Market',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
    size: '3,200 sq ft',
    pros: ['High ceilings', 'Natural light', 'Loading dock', 'Ground floor'],
    features: ['wifi', 'parking', 'coffee'],
    status: 'Under Review',
  },
  {
    id: 2,
    name: 'FiDi Heritage Building',
    neighborhood: 'Financial District',
    image: 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg',
    size: '2,800 sq ft',
    pros: ['Historic charm', 'Central location', 'Transit access', 'Exposed brick'],
    features: ['wifi', 'coffee'],
    status: 'In Negotiation',
  },
  {
    id: 3,
    name: 'Mission Creative Hub',
    neighborhood: 'Mission District',
    image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg',
    size: '4,100 sq ft',
    pros: ['Creative community', 'Flexible layout', 'Street art', 'Food scene'],
    features: ['wifi', 'parking', 'coffee'],
    status: 'Exploring',
  },
];

const getFeatureIcon = (feature: string) => {
  switch (feature) {
    case 'wifi': return <Wifi className="h-4 w-4" />;
    case 'parking': return <Car className="h-4 w-4" />;
    case 'coffee': return <Coffee className="h-4 w-4" />;
    default: return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Negotiation': return 'bg-cs-success text-white';
    case 'Under Review': return 'bg-cs-sun text-cs-espresso';
    default: return 'bg-cs-muted text-white';
  }
};

export function PotentialSpaces() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso mb-4">
            Potential Spaces
          </h2>
          <p className="text-lg text-cs-muted max-w-2xl mx-auto">
            We're scouting these prime San Francisco locations for the perfect balance of community, accessibility, and that special coffeehouse vibe.
          </p>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {spaces.map((space) => (
              <CarouselItem key={space.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={space.image}
                      alt={space.name}
                      className="w-full h-48 object-cover rounded-t-2xl"
                    />
                    <Badge 
                      className={`absolute top-3 right-3 ${getStatusColor(space.status)}`}
                    >
                      {space.status}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-cs-espresso mb-2">
                        {space.name}
                      </h3>
                      <div className="flex items-center text-cs-muted text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {space.neighborhood}
                      </div>
                      <div className="flex items-center text-cs-muted text-sm">
                        <Square className="h-4 w-4 mr-1" />
                        {space.size}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-cs-espresso mb-2">Key Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {space.pros.map((pro, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs bg-cs-border text-cs-muted"
                            >
                              {pro}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-2">
                        {space.features.map((feature) => (
                          <div 
                            key={feature}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-cs-sun/20 text-cs-espresso"
                          >
                            {getFeatureIcon(feature)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="text-center mt-8">
          <p className="text-sm text-cs-muted">
            Have a space suggestion? <a href="mailto:hello@citizenspace.co" className="text-cs-blue hover:underline">Let us know</a>
          </p>
        </div>
      </div>
    </section>
  );
}