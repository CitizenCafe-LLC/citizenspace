import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Users, 
  Shield, 
  Settings, 
  Key,
  ArrowRight,
  CheckCircle,
  Calendar,
  Coffee
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Pods',
  description: 'Dedicated private spaces for growing teams. Monthly commitments with custom setups and exclusive amenities.',
};

const podSizes = [
  {
    name: 'Startup Pod',
    capacity: '4-6 people',
    features: [
      'Open collaboration area',
      'Private meeting nook',
      'Custom storage solutions',
      'Team branding options',
      'Dedicated coffee station'
    ],
    ideal: 'Small teams, early-stage startups',
    pricing: 'Starting at $1,200/month'
  },
  {
    name: 'Growth Pod',
    capacity: '6-8 people',
    features: [
      'Multiple work zones',
      'Private meeting room',
      'Executive desk options',
      'Team whiteboard walls',
      'Premium furniture'
    ],
    ideal: 'Established teams, creative agencies',
    pricing: 'Starting at $1,800/month'
  },
  {
    name: 'Enterprise Pod',
    capacity: '8-12 people',
    features: [
      'Private entrance option',
      'Multiple meeting spaces',
      'Reception area',
      'Custom build-out',
      'Dedicated support'
    ],
    ideal: 'Large teams, satellite offices',
    pricing: 'Custom pricing'
  }
];

const benefits = [
  {
    icon: Key,
    title: '24/7 Access',
    description: 'Your team has round-the-clock access to your dedicated space'
  },
  {
    icon: Settings,
    title: 'Custom Setup',
    description: 'Configure the space to match your team\'s workflow and culture'
  },
  {
    icon: Shield,
    title: 'Complete Privacy',
    description: 'Enclosed spaces with soundproofing for confidential work'
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Admin tools to manage access, bookings, and team preferences'
  },
  {
    icon: Calendar,
    title: 'Included Meeting Credits',
    description: 'Generous monthly allowance for additional meeting room usage'
  },
  {
    icon: Coffee,
    title: 'Cafe Credits',
    description: 'Monthly allowance for team coffee, meals, and catering'
  }
];

const process = [
  {
    step: 1,
    title: 'Discovery Call',
    description: 'We discuss your team\'s needs, size, and workspace requirements'
  },
  {
    step: 2,
    title: 'Space Tour',
    description: 'Visit available pod spaces and see customization options'
  },
  {
    step: 3,
    title: 'Custom Proposal',
    description: 'Receive a tailored proposal with pricing and setup timeline'
  },
  {
    step: 4,
    title: 'Move In',
    description: 'We handle the setup so your team can start working immediately'
  }
];

const testimonials = [
  {
    quote: "Having our own pod has been game-changing. We have the privacy we need for client work while still being part of the coworking community.",
    author: "Sarah Kim",
    role: "Creative Director, Pixel Studio",
    teamSize: "6 people"
  },
  {
    quote: "The custom setup process was seamless. They understood our workflow and created a space that actually improves how we collaborate.",
    author: "Marcus Rodriguez",
    role: "VP Engineering, DataFlow",
    teamSize: "8 people"
  }
];

export default function TeamPodsPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Team Pods
            </Badge>
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Your Team's{' '}
              <span className="gradient-text">Private Workspace</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Dedicated, customizable spaces for growing teams. Enjoy the benefits of coworking 
              with the privacy and control of your own office space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/contact">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/location">Tour the Space</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pod Sizes */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Find Your Perfect Size
            </h2>
            <p className="text-lg text-muted-foreground">
              From startup teams to enterprise satellite offices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {podSizes.map((pod, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="text-center mb-4">
                    <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-display text-xl">{pod.name}</CardTitle>
                    <p className="text-muted-foreground">{pod.capacity}</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-cs-blue font-semibold">
                      {pod.pricing}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Includes:</h4>
                    <ul className="space-y-1">
                      {pod.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Ideal for:</h4>
                    <p className="text-sm text-muted-foreground">{pod.ideal}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Why Choose a Team Pod?
            </h2>
            <p className="text-lg text-muted-foreground">
              All the benefits of coworking plus the privacy and customization your team needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <benefit.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From consultation to move-in, we make the process seamless
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-cs-blue/10 w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-cs-blue">{step.step}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              What Teams Are Saying
            </h2>
            <p className="text-lg text-muted-foreground">
              Success stories from teams who made Citizen Space their home
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <blockquote className="text-lg italic mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <footer>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                    <div className="text-muted-foreground text-sm">{testimonial.teamSize}</div>
                  </footer>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What's the minimum commitment?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Team pods require a minimum 3-month commitment. We offer flexible terms 
                    after the initial period with 30-day notice for changes.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Can we customize the space?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Absolutely! We work with your team to configure furniture, add branding, 
                    and create the optimal layout for your workflow. Some structural changes may require approval.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>What happens if our team grows?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We can help you upgrade to a larger pod or add satellite desks. Our flexible 
                    approach means we can adapt as your team evolves.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cs-blue/10 to-cs-sun/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Ready to Give Your Team a Home?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Schedule a consultation to discuss your team's needs and see available pod spaces
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/contact">Schedule Consultation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/membership">Compare All Options</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}