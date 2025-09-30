'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  Search,
  CircleHelp as HelpCircle,
  Coffee,
  Users,
  CreditCard,
  Settings,
  MessageCircle,
} from 'lucide-react'
import type { Metadata } from 'next'

const faqCategories = [
  { id: 'all', name: 'All Questions', icon: HelpCircle },
  { id: 'membership', name: 'Membership', icon: CreditCard },
  { id: 'workspace', name: 'Workspace', icon: Users },
  { id: 'cafe', name: 'Cafe', icon: Coffee },
  { id: 'policies', name: 'Policies', icon: Settings },
]

const faqs = [
  // Membership
  {
    id: 1,
    category: 'membership',
    question: 'What are the NFT holder benefits?',
    answer:
      'NFT holders who connect their wallet to the Citizen Space platform receive 50% off all workspace services and 10% off cafe items. This includes: $1.25/hour (vs $2.50), $12.50/day pass (vs $25), $75/month cafe membership (vs $150), and $212.50/month resident desk (vs $425). Plus 10% off all food and drinks. This exclusive benefit is our way of rewarding founding community supporters who help fund our Santa Cruz build.',
  },
  {
    id: 2,
    category: 'membership',
    question: 'How do I connect my wallet to get NFT benefits?',
    answer:
      'Use the "Connect Wallet" button in the top navigation or on any booking page. We support all major wallets through WalletConnect. Once connected, your NFT holder discounts will automatically apply to all workspace bookings and cafe purchases.',
  },
  {
    id: 3,
    category: 'membership',
    question: "What's the difference between a day pass and hourly access?",
    answer:
      'Hourly access is $2.50/hour ($1.25 for NFT holders) with no minimum commitment - perfect for short sessions. A day pass is $25 ($12.50 for NFT holders) and gives you all-day access plus 10% off cafe purchases and 2 hours of meeting room credits.',
  },
  {
    id: 4,
    category: 'membership',
    question: 'Can I cancel my membership anytime?',
    answer:
      'Yes! All memberships can be cancelled with 30 days notice. No cancellation fees or long-term commitments required.',
  },
  {
    id: 5,
    category: 'membership',
    question: 'Do you offer student discounts?',
    answer:
      'We offer 20% off all membership plans for students with valid ID. Contact us to set up your student membership.',
  },
  {
    id: 6,
    category: 'membership',
    question: "What happens if I don't use all my meeting room credits?",
    answer:
      "Meeting room credits expire at the end of each month and don't roll over. We recommend booking meeting rooms in advance to make the most of your included credits.",
  },

  // Workspace
  {
    id: 7,
    category: 'workspace',
    question: 'Is Wi-Fi included and how fast is it?',
    answer:
      'Yes! We provide complimentary gigabit fiber internet with backup connections. The network is optimized for video calls and large file uploads.',
  },
  {
    id: 8,
    category: 'workspace',
    question: 'Are there power outlets at every seat?',
    answer:
      'Absolutely. Every desk has power outlets and USB-C charging ports. No need to hunt for power or bring extension cords.',
  },
  {
    id: 9,
    category: 'workspace',
    question: 'Can I make phone calls in the space?',
    answer:
      'We have designated phone booths for private calls. In the main workspace, please keep calls brief and consider stepping outside for longer conversations.',
  },
  {
    id: 10,
    category: 'workspace',
    question: 'How do I reserve a specific desk or meeting room?',
    answer:
      'Use our mobile app or website to reserve desks up to 24 hours in advance. Meeting rooms can be booked up to 30 days ahead for members.',
  },

  // Cafe
  {
    id: 11,
    category: 'cafe',
    question: 'Can I bring outside food and drinks?',
    answer:
      "You're welcome to bring outside food, but we ask that you don't bring outside coffee or beverages to support our cafe partners.",
  },
  {
    id: 12,
    category: 'cafe',
    question: 'Do you accommodate dietary restrictions?',
    answer:
      'Yes! We have vegetarian, vegan, and gluten-free options clearly marked. Our staff can help with specific allergies or dietary needs.',
  },
  {
    id: 13,
    category: 'cafe',
    question: 'Can I order food and drinks from my desk?',
    answer:
      "Yes! Our mobile app lets you order from your seat and we'll deliver to your workspace. Available during cafe hours.",
  },
  {
    id: 14,
    category: 'cafe',
    question: 'What coffee do you serve?',
    answer:
      'We partner with local SF roasters including Four Barrel Coffee and Ritual Coffee Roasters. We rotate single origins and always have our house blend available.',
  },

  // Policies
  {
    id: 15,
    category: 'policies',
    question: 'Are pets allowed?',
    answer:
      'Service animals are always welcome. Well-behaved pets are allowed in the cafe area but not in the coworking zone due to allergies and space considerations.',
  },
  {
    id: 16,
    category: 'policies',
    question: 'What are your quiet hours?',
    answer:
      'We maintain quiet workspace standards throughout the day. Certain areas are designated for collaboration, while others are for focused work.',
  },
  {
    id: 17,
    category: 'policies',
    question: 'Can I host a meeting or event at Citizen Space?',
    answer:
      'Yes! Members can book meeting rooms for client meetings. For larger events or workshops, contact us to discuss options and pricing.',
  },
  {
    id: 18,
    category: 'policies',
    question: "What's your policy on overnight stays?",
    answer:
      'The space is not intended for overnight stays. Members with 24/7 access can work late, but sleeping in the space is not permitted.',
  },
  {
    id: 19,
    category: 'policies',
    question: 'Is there a dress code?',
    answer:
      'No formal dress code! We want you to be comfortable. Just keep it appropriate for a professional environment.',
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Frequently Asked Questions
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              How Can We <span className="gradient-text">Help You?</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Find answers to common questions about membership, workspace policies, cafe offerings,
              and everything else you need to know.
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="mb-12 grid w-full grid-cols-2 lg:grid-cols-5">
                {faqCategories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2"
                  >
                    <category.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {faqCategories.map(category => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="space-y-4">
                    {filteredFaqs.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 font-semibold">No questions found</h3>
                          <p className="text-muted-foreground">
                            Try adjusting your search or browse other categories.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <Accordion type="single" collapsible className="space-y-4">
                        {filteredFaqs.map(faq => (
                          <AccordionItem key={faq.id} value={faq.id.toString()}>
                            <Card>
                              <AccordionTrigger className="p-6 hover:no-underline">
                                <div className="text-left">
                                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-6">
                                <div className="border-t pt-4">
                                  <p className="leading-relaxed text-muted-foreground">
                                    {faq.answer}
                                  </p>
                                </div>
                              </AccordionContent>
                            </Card>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold">Still Have Questions?</h2>
              <p className="text-lg text-muted-foreground">
                We're here to help! Get in touch or visit us in person.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="card-hover">
                <CardHeader className="text-center">
                  <MessageCircle className="mx-auto mb-2 h-8 w-8 text-cs-blue" />
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>Send us your question directly</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild className="btn-primary">
                    <Link href="/contact">Send Message</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader className="text-center">
                  <Coffee className="mx-auto mb-2 h-8 w-8 text-cs-sun" />
                  <CardTitle>Visit Us</CardTitle>
                  <CardDescription>Come see the space in person</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline">
                    <Link href="/location">Get Directions</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader className="text-center">
                  <Users className="mx-auto mb-2 h-8 w-8 text-cs-apricot" />
                  <CardTitle>Schedule Tour</CardTitle>
                  <CardDescription>Book a guided walkthrough</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline">
                    <Link href="/contact">Book Tour</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
