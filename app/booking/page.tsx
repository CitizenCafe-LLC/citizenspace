/**
 * Booking Page
 * Main booking wizard page with step-by-step flow
 */

'use client'

import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookingWizard } from '@/components/booking/BookingWizard'
import { useBookingStore } from '@/lib/stores/bookingStore'
import Link from 'next/link'
import { Smartphone, Sparkles, Calendar, Clock, Shield } from 'lucide-react'

export default function BookingPage() {
  const { resetBooking, setUserInfo } = useBookingStore()

  useEffect(() => {
    // Reset booking state when page loads
    resetBooking()

    // TODO: Fetch user info from auth context
    // For now, set demo values
    setUserInfo({
      isNftHolder: false, // Set to true if user has NFT
      isMember: false, // Set to true if user has membership
      creditBalance: 0, // Set to actual credit balance
    })
  }, [resetBooking, setUserInfo])

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              Book Your Space
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-5xl">
              Reserve Your <span className="gradient-text">Perfect Workspace</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose your ideal workspace and book instantly. From hot desks to private meeting
              rooms with real-time availability.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-cs-blue" />
                <span>Real-time Availability</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-cs-blue" />
                <span>Instant Confirmation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-cs-blue" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Promotion */}
      <section className="pb-12">
        <div className="container">
          <Card className="mx-auto max-w-4xl border-cs-blue/20 bg-gradient-to-r from-cs-blue/10 to-cs-sun/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Smartphone className="h-8 w-8 text-cs-blue" />
                  <div>
                    <h3 className="font-display text-lg font-semibold">Get Our Mobile App</h3>
                    <p className="text-sm text-muted-foreground">
                      Faster booking, push notifications, and in-seat cafe ordering
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href="/app">Download App</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* NFT Holder Promotion */}
      <section className="pb-12">
        <div className="container">
          <Card className="mx-auto max-w-4xl border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Sparkles className="h-8 w-8 text-amber-600" />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-amber-900">
                      NFT Holder Benefits
                    </h3>
                    <p className="text-sm text-amber-700">
                      Get 50% off all bookings instantly when you connect your wallet
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="border-amber-600 text-amber-900 hover:bg-amber-100">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Booking Wizard */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            <BookingWizard />
          </div>
        </div>
      </section>

      {/* Alternative Options */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">Other Options</h2>
              <p className="text-lg text-muted-foreground">
                Not ready to book? Try these flexible alternatives
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">Day Pass</h3>
                    <div className="text-3xl font-bold text-cs-sun mb-2">$25/day</div>
                    <p className="text-muted-foreground">
                      Full day access with 10% cafe discount and meeting room credits included.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/membership">Buy Day Pass</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">Schedule a Tour</h3>
                    <div className="text-3xl font-bold text-cs-blue mb-2">Free</div>
                    <p className="text-muted-foreground">
                      See our space in person before committing. Tours available daily.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contact">Book Tour</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
            <p className="text-muted-foreground mb-6">
              Have questions about booking or our spaces? We're here to help.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/faq">View FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}