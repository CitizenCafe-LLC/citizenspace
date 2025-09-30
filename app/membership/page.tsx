import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  Check,
  X,
  Clock,
  Calendar,
  Users,
  Coffee,
  ArrowRight,
  Star,
  Printer,
  Shield,
  Wallet,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Membership Plans',
  description:
    'Choose the perfect membership plan for your work style. From hourly access to dedicated desks with 24/7 access.',
}

const plans = [
  {
    id: 'hourly',
    name: 'Hourly Access',
    price: '$2',
    period: 'per hour',
    description: 'Perfect for occasional visits and short work sessions',
    features: [
      'Pay as you go via app',
      'Access to coworking zone',
      'High-speed WiFi & power',
      'Printing available ($0.10/page)',
      'No commitment required',
    ],
    limitations: ['No meeting room credits', 'No locker access', 'Standard cafe pricing'],
    cta: 'Start Working',
    popular: false,
    color: 'cs-blue',
  },
  {
    id: 'day-pass',
    name: 'Day Pass',
    price: '$25',
    period: 'per day',
    description: 'Full day access with additional perks and savings',
    features: [
      'All-day workspace access',
      '10% off all cafe purchases',
      'Meeting room credits (2 hours)',
      'Free printing (25 pages)',
      'Valid until 10pm',
    ],
    limitations: ['No locker access', 'Limited meeting room credits'],
    cta: 'Buy Day Pass',
    popular: false,
    color: 'cs-sun',
  },
  {
    id: 'resident',
    name: 'Resident Desk',
    price: '$425',
    period: 'per month',
    description: 'Your own dedicated desk with 24/7 access and premium perks',
    features: [
      'Dedicated desk space',
      '24/7 building access',
      'Personal locker included',
      '20% off all cafe purchases',
      'Meeting room credits (8 hours)',
      'Free printing (100 pages)',
      'Guest day passes (2 per month)',
      'Priority event access',
    ],
    limitations: [],
    cta: 'Secure Your Desk',
    popular: true,
    color: 'cs-apricot',
  },
  {
    id: 'cafe-membership',
    name: 'Cafe Membership',
    price: '$150',
    period: 'per month',
    description: 'Flexible workspace access during business hours',
    features: [
      'Any available desk',
      '9am-5pm access Monday-Friday',
      '10% off all cafe purchases',
      'Meeting room credits (2 hours)',
      'Free printing (50 pages)',
      'Community event access',
      'Locker rental available',
    ],
    limitations: ['Business hours only', 'Limited meeting room credits'],
    cta: 'Join Cafe Plan',
    popular: false,
    color: 'cs-caramel',
  },
]

const comparisonFeatures = [
  {
    category: 'Access',
    features: [
      {
        name: 'Coworking Zone Access',
        hourly: true,
        dayPass: true,
        cafeMember: true,
        resident: true,
      },
      {
        name: '24/7 Building Access',
        hourly: false,
        dayPass: false,
        cafeMember: false,
        resident: true,
      },
      { name: 'Weekend Access', hourly: true, dayPass: true, cafeMember: false, resident: true },
      {
        name: 'Guest Privileges',
        hourly: false,
        dayPass: false,
        cafeMember: false,
        resident: '2/month',
      },
    ],
  },
  {
    category: 'Workspace',
    features: [
      { name: 'Hot Desk Access', hourly: true, dayPass: true, cafeMember: true, resident: true },
      { name: 'Dedicated Desk', hourly: false, dayPass: false, cafeMember: false, resident: true },
      {
        name: 'Personal Storage',
        hourly: false,
        dayPass: false,
        cafeMember: false,
        resident: 'Locker',
      },
      {
        name: 'Meeting Room Credits',
        hourly: '0 hours',
        dayPass: '0 hours',
        cafeMember: '2 hours',
        resident: '8 hours',
      },
    ],
  },
  {
    category: 'Perks',
    features: [
      { name: 'Cafe Discount', hourly: '0%', dayPass: '10%', cafeMember: '10%', resident: '20%' },
      {
        name: 'Free Printing',
        hourly: '0 pages',
        dayPass: '25 pages',
        cafeMember: '50 pages',
        resident: '100 pages',
      },
      { name: 'Event Priority', hourly: false, dayPass: false, cafeMember: false, resident: true },
      {
        name: 'Dedicated Support',
        hourly: false,
        dayPass: false,
        cafeMember: false,
        resident: false,
      },
    ],
  },
]

const faqs = [
  {
    question: 'Can I change my membership plan?',
    answer:
      'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens to unused meeting room credits?',
    answer:
      "Meeting room credits expire at the end of each month and don't roll over. We recommend booking in advance to make the most of your credits.",
  },
  {
    question: 'Is there a setup fee for memberships?',
    answer:
      "No setup fees for any membership plans. You'll only pay the monthly rate, and we'll have your space ready on day one.",
  },
  {
    question: 'Can I pause my membership?',
    answer:
      'Resident desk memberships can be paused for up to 3 months per year with 30 days notice. A small hold fee applies to reserve your space.',
  },
]

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-400" />
    )
  }
  return <span className="text-sm">{value}</span>
}

export default function MembershipPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Membership Plans
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Find Your <span className="gradient-text">Perfect Plan</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              From casual drop-ins to dedicated desks, choose the membership that fits your working
              style and budget. No long-term commitments required.
            </p>

            {/* NFT Benefits Callout */}
            <div className="mx-auto mb-8 max-w-2xl">
              <Card className="border-cs-blue/20 bg-gradient-to-r from-cs-blue/10 to-cs-sun/10">
                <CardContent className="p-6 text-center">
                  <Wallet className="mx-auto mb-3 h-8 w-8 text-cs-blue" />
                  <h3 className="mb-2 font-display text-lg font-semibold">NFT Holder Benefits</h3>
                  <p className="mb-4 text-muted-foreground">
                    Get <strong>50% off all workspace services</strong> and{' '}
                    <strong>10% off cafe items</strong> with our Founding Member NFT
                  </p>
                  <Button asChild variant="outline">
                    <Link href="#" target="_blank" rel="noopener noreferrer">
                      Purchase NFT
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'scale-105 border-2 border-primary shadow-lg' : 'border'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                    <Badge className="bg-cs-apricot text-white">
                      <Star className="mr-1 h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4 text-center">
                  <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-cs-blue">{plan.price}</div>
                    <div className="text-sm text-cs-blue">
                      {plan.id === 'resident'
                        ? '$225'
                        : plan.id === 'day-pass'
                          ? '$12.50'
                          : plan.id === 'hourly'
                            ? '$1.25'
                            : plan.id === 'cafe-membership'
                              ? '$75'
                              : 'Custom'}{' '}
                      NFT holders
                    </div>
                    <div className="text-sm text-muted-foreground">{plan.period}</div>
                  </div>
                  <CardDescription className="pt-2 text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="mb-3 font-semibold text-green-700">What's Included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm">
                          <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-semibold text-amber-700">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-start text-sm">
                            <X className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button asChild className="btn-primary w-full">
                    <Link href={plan.id === 'cafe-membership' ? '/booking' : '/booking'}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">
              Compare All Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Detailed breakdown of what's included with each membership level
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              {comparisonFeatures.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-8">
                  <h3 className="mb-4 font-display text-xl font-semibold text-cs-blue">
                    {category.category}
                  </h3>
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="p-4 text-left font-medium">Feature</th>
                              <th className="p-4 text-center font-medium">Hourly</th>
                              <th className="p-4 text-center font-medium">Day Pass</th>
                              <th className="p-4 text-center font-medium">Cafe Member</th>
                              <th className="p-4 text-center font-medium">Resident</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.features.map((feature, featureIndex) => (
                              <tr key={featureIndex} className="border-b last:border-0">
                                <td className="p-4 font-medium">{feature.name}</td>
                                <td className="p-4 text-center">
                                  <FeatureValue value={feature.hourly} />
                                </td>
                                <td className="p-4 text-center">
                                  <FeatureValue value={feature.dayPass} />
                                </td>
                                <td className="p-4 text-center">
                                  <FeatureValue value={feature.cafeMember} />
                                </td>
                                <td className="p-4 text-center">
                                  <FeatureValue value={feature.resident} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">Membership FAQ</h2>
              <p className="text-lg text-muted-foreground">
                Common questions about our membership plans and policies
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">
              Ready to Join Our Community?
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Start with a day pass, schedule a tour, or get our NFT for exclusive benefits
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/booking">Get Started Today</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <Wallet className="mr-2 h-5 w-5" />
                  Get 50% Off with NFT
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Schedule a Tour</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
