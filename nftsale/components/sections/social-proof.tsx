"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Quote } from 'lucide-react';

const backers = [
  { ens: 'sarah.eth', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', recent: true },
  { ens: 'mike.eth', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', recent: true },
  { ens: 'alexchen.eth', avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg', recent: false },
  { ens: 'designerjane.eth', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', recent: true },
  { ens: 'cryptodev.eth', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', recent: false },
  { ens: 'startupfunder.eth', avatar: 'https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg', recent: false },
  { ens: '0x1234...5678', avatar: null, recent: true },
  { ens: '0xabcd...efgh', avatar: null, recent: false },
];

const testimonials = [
  {
    quote: "Citizen Space was where I met my co-founder. The community there is unmatched—can't wait to see it rebuilt with this founder-first approach.",
    author: "Jessica Park",
    role: "Founder @ TechFlow",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
  },
  {
    quote: "The NFT membership model is genius. True ownership of your membership benefits? That's the future of community spaces.",
    author: "David Chen",
    role: "Web3 Developer",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
  },
  {
    quote: "I spent countless hours at the original Citizen Space. The transparent funding approach gives me confidence they'll rebuild something even better.",
    author: "Maria Rodriguez",
    role: "Designer @ Figma",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
  }
];

export function SocialProof() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso mb-4">
            Join 234 Founders Building the Future
          </h2>
          <p className="text-lg text-cs-muted max-w-2xl mx-auto">
            See who's already backing Citizen Space and hear from community alumni about why this matters.
          </p>
        </div>

        {/* Recent Backers */}
        <div className="mb-16">
          <h3 className="font-display text-xl font-semibold text-cs-espresso mb-6 text-center">
            Recent Backers
          </h3>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {backers.map((backer, index) => (
              <div key={index} className="flex items-center space-x-2 relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={backer.avatar || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-cs-apricot to-cs-blue text-white">
                    {backer.ens.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium text-cs-espresso">{backer.ens}</div>
                  {backer.recent && (
                    <Badge className="text-xs bg-cs-success text-white">New</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-cs-muted">
            + 226 more founders backing the project
          </p>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="font-display text-xl font-semibold text-cs-espresso mb-6 text-center">
            What Alumni Are Saying
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-cs-sun mb-4" />
                  <blockquote className="text-cs-muted mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-cs-apricot to-cs-blue text-white">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-cs-espresso">{testimonial.author}</div>
                      <div className="text-sm text-cs-muted">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-cs-espresso mb-2">234</div>
            <div className="text-sm text-cs-muted">Founder NFTs Minted</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-cs-espresso mb-2">12</div>
            <div className="text-sm text-cs-muted">Days Since Launch</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-cs-espresso mb-2">89%</div>
            <div className="text-sm text-cs-muted">Retention Rate</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-cs-espresso mb-2">4.9</div>
            <div className="text-sm text-cs-muted">Community Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}