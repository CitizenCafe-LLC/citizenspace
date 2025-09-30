import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Smartphone,
  Download,
  Calendar,
  Coffee,
  MapPin,
  Zap,
  Bell,
  CreditCard,
  QrCode,
  ArrowRight,
  Apple,
  Play,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mobile App',
  description:
    'Download the Citizen Space app for iOS and Android. Book desks, order coffee from your seat, and manage your membership on the go.',
}

const appFeatures = [
  {
    icon: Calendar,
    title: 'Instant Booking',
    description: 'Reserve desks and meeting rooms with real-time availability',
    details: ['See available spots live', 'Book up to 30 days ahead', 'One-tap rebooking'],
  },
  {
    icon: Coffee,
    title: 'In-Seat Ordering',
    description: 'Order cafe items delivered directly to your workspace',
    details: ['Full menu access', 'Delivery to your desk', 'Member discounts applied'],
  },
  {
    icon: MapPin,
    title: 'Space Navigation',
    description: 'Find your reserved desk and locate amenities easily',
    details: ['Interactive floor plans', 'Find meeting rooms', 'Locate facilities'],
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Manage membership, add credits, and track spending',
    details: ['Auto-billing setup', 'Payment history', 'Usage analytics'],
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Stay updated on events, space availability, and orders',
    details: ['Event reminders', 'Order status updates', 'Space alerts'],
  },
  {
    icon: QrCode,
    title: 'Quick Access',
    description: 'QR code entry and contactless check-in',
    details: ['Fast door access', 'No physical cards needed', 'Guest management'],
  },
]

const screenshots = [
  {
    title: 'Book Your Space',
    description: 'See real-time availability and reserve desks instantly',
    image: '/app/booking-screen.jpg',
  },
  {
    title: 'Order from Your Seat',
    description: 'Browse the menu and get cafe items delivered to your desk',
    image: '/app/ordering-screen.jpg',
  },
  {
    title: 'Manage Everything',
    description: 'Track usage, manage payments, and view upcoming bookings',
    image: '/app/dashboard-screen.jpg',
  },
]

const permissions = [
  {
    permission: 'Location Services',
    reason: 'Find nearby Citizen Space locations and enable quick check-in',
    required: false,
  },
  {
    permission: 'Camera',
    reason: 'Scan QR codes for quick access and payments',
    required: false,
  },
  {
    permission: 'Notifications',
    reason: 'Receive booking confirmations and order updates',
    required: false,
  },
  {
    permission: 'Biometric Authentication',
    reason: 'Secure and convenient app access with Face ID or Touch ID',
    required: false,
  },
]

export default function AppPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Mobile App
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Your Workspace in <span className="gradient-text">Your Pocket</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Book desks, order coffee from your seat, and manage your membership with our powerful
              mobile app. Available for iOS and Android.
            </p>

            {/* Download Buttons */}
            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="btn-primary">
                <Apple className="mr-2 h-5 w-5" />
                Download for iOS
              </Button>
              <Button size="lg" variant="outline">
                <Play className="mr-2 h-5 w-5" />
                Download for Android
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Free download • No subscription required • Works with all membership plans
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">
                Everything You Need
              </h2>
              <p className="text-lg text-muted-foreground">
                Designed to make your Citizen Space experience seamless and productive
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {appFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <feature.icon className="mb-3 h-8 w-8 text-cs-blue" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm">
                          <ArrowRight className="mr-2 h-3 w-3 text-cs-blue" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold lg:text-4xl">See It in Action</h2>
              <p className="text-lg text-muted-foreground">
                A glimpse of the app's intuitive interface and powerful features
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-6 flex aspect-[9/16] max-w-sm items-center justify-center rounded-2xl bg-muted">
                    <Smartphone className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold">{screenshot.title}</h3>
                  <p className="text-muted-foreground">{screenshot.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold">Why Download the App?</h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Zap className="mb-3 h-8 w-8 text-cs-sun" />
                  <CardTitle>Faster Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Book desks 3x faster than the web interface. Optimized for mobile with offline
                    capabilities and instant sync.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Bell className="mb-3 h-8 w-8 text-cs-apricot" />
                  <CardTitle>Smart Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get notified when your favorite desks open up, your order is ready, or events
                    are starting.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <QrCode className="mb-3 h-8 w-8 text-cs-caramel" />
                  <CardTitle>Contactless Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Skip the front desk with QR code entry. Your phone becomes your key to the
                    space.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Download className="mb-3 h-8 w-8 text-cs-blue" />
                  <CardTitle>Offline Capability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    View your bookings and access key features even when connectivity is spotty.
                    Syncs when you're back online.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Permissions */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold">Privacy & Permissions</h2>
              <p className="text-lg text-muted-foreground">
                We respect your privacy and only request permissions that enhance your experience
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left">Permission</th>
                        <th className="p-4 text-left">Why We Need It</th>
                        <th className="p-4 text-left">Required?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((permission, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="p-4 font-semibold">{permission.permission}</td>
                          <td className="p-4 text-muted-foreground">{permission.reason}</td>
                          <td className="p-4">
                            <Badge variant={permission.required ? 'destructive' : 'secondary'}>
                              {permission.required ? 'Required' : 'Optional'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800">
                <strong>Privacy First:</strong> All permissions are optional and can be managed in
                your phone's settings. The app works without any permissions, though some features
                may be limited.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-display text-3xl font-bold lg:text-4xl">Download Today</h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Join thousands of members already using the app to enhance their Citizen Space
              experience
            </p>

            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="btn-primary">
                <Apple className="mr-2 h-5 w-5" />
                App Store
              </Button>
              <Button size="lg" variant="outline">
                <Play className="mr-2 h-5 w-5" />
                Google Play
              </Button>
            </div>

            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">Don't have a membership yet?</p>
              <Button asChild variant="outline">
                <Link href="/membership">
                  See Membership Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
