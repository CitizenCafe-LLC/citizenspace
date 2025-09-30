import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Citizen Space coworking and cafe services.',
}

export default function TermsPage() {
  return (
    <div className="py-12">
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>

            <Badge variant="secondary" className="mb-6">
              Legal
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-5xl">Terms of Service</h1>
            <p className="mb-8 text-lg text-muted-foreground">Last updated: January 1, 2024</p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  By accessing or using Citizen Space services, including our coworking facilities,
                  cafe, website, and mobile application, you agree to be bound by these Terms of
                  Service ("Terms"). If you disagree with any part of these terms, you may not
                  access our services.
                </p>
                <p>
                  These Terms apply to all visitors, users, and customers of Citizen Space services,
                  whether you are a casual visitor, day pass holder, or member.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Description of Services</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>Citizen Space provides:</p>
                <ul>
                  <li>Coworking spaces including hot desks, dedicated desks, and meeting rooms</li>
                  <li>Cafe services including food and beverages</li>
                  <li>Community events and workshops</li>
                  <li>Meeting room rentals</li>
                  <li>Digital services through our website and mobile application</li>
                </ul>
                <p>
                  Services are subject to availability and may be modified, suspended, or
                  discontinued at any time without prior notice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Membership and Access</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h4>3.1 Membership Plans</h4>
                <p>
                  We offer various membership plans with different access levels and benefits.
                  Membership details, pricing, and terms are available on our website and subject to
                  change.
                </p>

                <h4>3.2 Access Cards and Security</h4>
                <p>
                  Members receive access credentials (physical cards or digital keys) that must not
                  be shared, duplicated, or transferred. Lost or stolen access credentials must be
                  reported immediately.
                </p>

                <h4>3.3 Guest Policies</h4>
                <p>
                  Members may bring guests subject to availability and applicable fees. Members are
                  responsible for their guests' conduct and compliance with these Terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Facility Use and Conduct</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h4>4.1 Acceptable Use</h4>
                <p>Users must:</p>
                <ul>
                  <li>Respect other users and maintain a professional atmosphere</li>
                  <li>Keep noise levels appropriate for a shared workspace</li>
                  <li>Clean up after themselves and respect shared spaces</li>
                  <li>Follow posted facility rules and staff instructions</li>
                  <li>Use facilities only for lawful purposes</li>
                </ul>

                <h4>4.2 Prohibited Activities</h4>
                <p>The following are strictly prohibited:</p>
                <ul>
                  <li>Illegal activities or conduct</li>
                  <li>Harassment, discrimination, or threatening behavior</li>
                  <li>Excessive noise or disruptive behavior</li>
                  <li>Smoking or vaping anywhere on the premises</li>
                  <li>Sleeping overnight in the facility</li>
                  <li>Bringing pets (except service animals)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h4>5.1 Membership Fees</h4>
                <p>
                  Membership fees are due monthly in advance and are non-refundable unless otherwise
                  specified. Prices are subject to change with 30 days notice.
                </p>

                <h4>5.2 Additional Services</h4>
                <p>
                  Charges for meeting rooms, printing, cafe purchases, and other services are billed
                  separately and are due immediately upon use.
                </p>

                <h4>5.3 Late Payments</h4>
                <p>
                  Late payments may result in access suspension. A late fee may apply for payments
                  more than 5 days overdue.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Cancellation and Refunds</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h4>6.1 Membership Cancellation</h4>
                <p>
                  Memberships may be cancelled with 30 days written notice. No refunds for partial
                  months unless required by law.
                </p>

                <h4>6.2 Day Pass Refunds</h4>
                <p>
                  Day passes are non-refundable once activated. Unused day passes may be refunded
                  within 30 days of purchase.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Citizen Space is not liable for any indirect, incidental, special, consequential,
                  or punitive damages, including loss of data, profits, or business interruption.
                </p>
                <p>
                  Users are responsible for their personal belongings. Citizen Space provides no
                  warranty against theft, damage, or loss of personal property.
                </p>
                <p>
                  Our total liability shall not exceed the amount paid by the user in the 12 months
                  preceding the claim.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use,
                  and protect your information when you use our services. By using our services, you
                  agree to the collection and use of information in accordance with our Privacy
                  Policy.
                </p>
                <p>
                  <Link href="/legal/privacy" className="text-cs-blue hover:underline">
                    Read our Privacy Policy
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be effective
                  immediately upon posting on our website. Continued use of our services constitutes
                  acceptance of the modified Terms.
                </p>
                <p>
                  Significant changes will be communicated via email to members and posted
                  prominently on our website.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <ul>
                  <li>Email: legal@citizenspace.com</li>
                  <li>Phone: (831) 295-1482</li>
                  <li>Address: 420 Pacific Ave, Santa Cruz, CA 95060</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
