"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Twitter, MessageCircle, Share2, Mail, CircleCheck as CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const socialLinks = [
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://twitter.com/intent/tweet?text=Help%20rebuild%20Citizen%20Space%20-%20SF%27s%20coffee%20%2B%20coworking%20community!%20Mint%20a%20Founder%20NFT%20for%20lifetime%2050%25%20off%20%2B%20exclusive%20perks&url=https://citizenspace.co',
    color: 'hover:bg-blue-500 hover:text-white',
  },
  {
    name: 'Discord',
    icon: MessageCircle,
    url: 'https://discord.gg/citizenspace',
    color: 'hover:bg-indigo-500 hover:text-white',
  },
  {
    name: 'Copy Link',
    icon: Copy,
    url: '',
    color: 'hover:bg-cs-blue hover:text-white',
  }
];

export function EmailCapture() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      // Call our API to store the email
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          walletAddress: null, // Can be added if user is connected
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Thanks for joining our newsletter!');
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = (platform: string, url: string) => {
    if (platform === 'Copy Link') {
      navigator.clipboard.writeText('https://citizenspace.co');
      toast.success('Link copied to clipboard!');
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-cs-apricot/5 via-cs-sun/5 to-cs-blue/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-cs-card hover:shadow-cs-hover transition-shadow duration-300">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso">
                    Stay Updated on Our Progress
                  </h2>
                  <p className="text-lg text-cs-muted max-w-2xl mx-auto">
                    Get monthly updates on our space search, funding progress, and exclusive invites to founder events.
                  </p>
                </div>

                {!isSubmitted ? (
                  <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-cs-blue hover:bg-cs-blue/90"
                      >
                        {isSubmitting ? 'Joining...' : 'Join Newsletter'}
                      </Button>
                    </div>
                    <p className="text-xs text-cs-muted mt-2">
                      No spam, just monthly updates. Unsubscribe anytime.
                    </p>
                  </form>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <CheckCircle2 className="h-12 w-12 text-cs-success" />
                    <div>
                      <h3 className="font-semibold text-lg text-cs-espresso">Thanks for joining!</h3>
                      <p className="text-cs-muted">You'll receive our next update in your inbox.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 justify-center">
                    <div className="h-px bg-cs-border flex-1"></div>
                    <span className="text-sm text-cs-muted">Share with friends</span>
                    <div className="h-px bg-cs-border flex-1"></div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    {socialLinks.map((link) => (
                      <Button
                        key={link.name}
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(link.name, link.url)}
                        className={`${link.color} transition-all duration-200`}
                      >
                        <link.icon className="h-4 w-4 mr-2" />
                        {link.name}
                      </Button>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-cs-muted">
                      Help us reach more founders by sharing our mission
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}