'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import {
  Send,
  MapPin,
  Clock,
  Phone as PhoneIcon,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Coffee,
  Building,
} from 'lucide-react'

const contactMethods = [
  {
    icon: PhoneIcon,
    title: 'Call Us',
    value: '(831) 295-1482',
    description: 'Mon-Fri 9am-6pm PST',
    action: 'tel:+18312951482',
  },
  {
    icon: Mail,
    title: 'Email Us',
    value: 'hello@citizenspace.com',
    description: 'We respond within 24 hours',
    action: 'mailto:hello@citizenspace.com',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: '420 Pacific Ave',
    description: 'Santa Cruz, CA 95060',
    action: '/location',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    value: 'Available during business hours',
    description: "Instant responses when we're online",
    action: '#',
  },
]

const inquiryTypes = [
  { value: 'general', label: 'General Question', icon: MessageSquare },
  { value: 'tour', label: 'Schedule a Tour', icon: Calendar },
  { value: 'membership', label: 'Membership Info', icon: Users },
  { value: 'events', label: 'Host an Event', icon: Coffee },
  { value: 'partnership', label: 'Partnership Opportunity', icon: Building },
  { value: 'press', label: 'Press & Media', icon: Send },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real app, this would send to your backend
    setTimeout(() => {
      setIsSubmitting(false)
      // Show success message
      alert("Thank you for your message! We'll get back to you soon.")
      setFormData({ name: '', email: '', topic: '', message: '' })
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Contact Us
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Let's <span className="gradient-text">Connect</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Have questions about membership, want to schedule a tour, or interested in
              partnerships? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-2xl font-bold">How to Reach Us</h2>
              <p className="text-lg text-muted-foreground">
                Choose the method that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="card-hover">
                  <CardContent className="p-6 text-center">
                    <method.icon className="mx-auto mb-3 h-8 w-8 text-cs-blue" />
                    <h3 className="mb-1 font-semibold">{method.title}</h3>
                    <p className="mb-1 font-medium text-cs-blue">{method.value}</p>
                    <p className="mb-4 text-sm text-muted-foreground">{method.description}</p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={method.action}>Connect</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="topic">What can we help you with? *</Label>
                    <Select
                      value={formData.topic}
                      onValueChange={value => handleInputChange('topic', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              <type.icon className="mr-2 h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={e => handleInputChange('message', e.target.value)}
                      placeholder="Tell us more about how we can help..."
                      required
                      rows={6}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="btn-primary w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Info Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center font-display text-xl">
                    <Clock className="mr-2 h-5 w-5 text-cs-blue" />
                    Hours & Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-semibold">Response Times</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• General inquiries: 24 hours</li>
                      <li>• Tour requests: Same day</li>
                      <li>• Press inquiries: 48 hours</li>
                      <li>• Urgent matters: Call us directly</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold">Office Hours</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                      <li>Saturday: 10:00 AM - 4:00 PM</li>
                      <li>Sunday: Closed for admin</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/booking">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Workspace
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/membership">
                      <Users className="mr-2 h-4 w-4" />
                      View Memberships
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/faq">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Check FAQ
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/location">
                      <MapPin className="mr-2 h-4 w-4" />
                      Get Directions
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Press & Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    For press inquiries, interviews, or media kit requests, please contact our media
                    team directly.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="mailto:press@citizenspace.com">press@citizenspace.com</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Location Quick Reference */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold">Come Visit Us</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              The best way to understand Citizen Space is to experience it yourself. Drop by anytime
              during cafe hours or schedule a guided tour.
            </p>

            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6 text-center">
                  <Coffee className="mx-auto mb-3 h-8 w-8 text-cs-sun" />
                  <h3 className="mb-2 font-semibold">Drop In</h3>
                  <p className="text-sm text-muted-foreground">
                    Visit our cafe anytime during business hours. No appointment needed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="mx-auto mb-3 h-8 w-8 text-cs-apricot" />
                  <h3 className="mb-2 font-semibold">Guided Tour</h3>
                  <p className="text-sm text-muted-foreground">
                    Book a 15-minute walkthrough to see the coworking zone and ask questions.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/location">Get Directions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
