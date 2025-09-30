import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Citizen Space services, detailing how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="py-12">
      <section className="pb-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            
            <Badge variant="secondary" className="mb-6">Legal</Badge>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: January 1, 2024
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  This Privacy Policy describes how Citizen Space ("we," "us," or "our") 
                  collects, uses, and shares information about you when you use our services, 
                  including our coworking facilities, cafe, website, and mobile application.
                </p>
                <p>
                  We are committed to protecting your privacy and handling your personal 
                  information responsibly. This policy explains your privacy rights and 
                  how the law protects you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h4>2.1 Information You Provide</h4>
                <ul>
                  <li>Account information: name, email address, phone number</li>
                  <li>Payment information: billing address, payment method details</li>
                  <li>Profile information: profile photo, preferences, emergency contact</li>
                  <li>Communications: messages, feedback, support requests</li>
                </ul>
                
                <h4>2.2 Information Automatically Collected</h4>
                <ul>
                  <li>Usage data: how you interact with our services</li>
                  <li>Device information: IP address, browser type, operating system</li>
                  <li>Location data: approximate location when using our services</li>
                  <li>Access logs: entry/exit times, areas accessed</li>
                </ul>
                
                <h4>2.3 Information from Third Parties</h4>
                <ul>
                  <li>Payment processors: transaction confirmations</li>
                  <li>Social media: if you connect social accounts</li>
                  <li>Analytics services: aggregated usage statistics</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>We use your information to:</p>
                <ul>
                  <li>Provide and improve our coworking and cafe services</li>
                  <li>Process payments and manage your membership</li>
                  <li>Communicate with you about services, events, and updates</li>
                  <li>Ensure facility security and safety</li>
                  <li>Personalize your experience</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and abuse</li>
                </ul>
                
                <h4>Legal Bases for Processing (EU Users)</h4>
                <ul>
                  <li><strong>Performance of contract:</strong> To provide services you've requested</li>
                  <li><strong>Legitimate interests:</strong> To operate and improve our business</li>
                  <li><strong>Legal compliance:</strong> To meet regulatory requirements</li>
                  <li><strong>Consent:</strong> For marketing communications (where required)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Information Sharing</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>We may share your information with:</p>
                
                <h4>4.1 Service Providers</h4>
                <ul>
                  <li>Payment processors (Stripe)</li>
                  <li>Email service providers</li>
                  <li>Analytics services (PostHog)</li>
                  <li>Cloud hosting providers</li>
                </ul>
                
                <h4>4.2 Legal Requirements</h4>
                <p>
                  We may disclose your information if required by law, court order, 
                  or government request, or to protect our rights and safety.
                </p>
                
                <h4>4.3 Business Transfers</h4>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your 
                  information may be transferred to the new entity.
                </p>
                
                <h4>4.4 With Your Consent</h4>
                <p>
                  We may share your information for other purposes with your explicit consent.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>We implement appropriate technical and organizational measures to protect your data:</p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>
                <p>
                  While we strive to protect your personal information, no security 
                  system is impenetrable, and we cannot guarantee the security of our systems 100%.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h4>6.1 Account Management</h4>
                <ul>
                  <li>Update your profile information anytime</li>
                  <li>Change email preferences</li>
                  <li>Delete your account (subject to legal requirements)</li>
                </ul>
                
                <h4>6.2 Marketing Communications</h4>
                <ul>
                  <li>Unsubscribe from emails using the link in messages</li>
                  <li>Manage preferences in your account settings</li>
                  <li>Contact us to opt out of other communications</li>
                </ul>
                
                <h4>6.3 Data Protection Rights (EU/UK Users)</h4>
                <ul>
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate information</li>
                  <li><strong>Erasure:</strong> Request deletion of your data</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                </ul>
                
                <h4>6.4 California Privacy Rights (CCPA)</h4>
                <p>California residents have additional rights including:</p>
                <ul>
                  <li>Right to know what personal information is collected</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information</li>
                  <li>Right to non-discrimination for exercising these rights</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h4>7.1 Types of Cookies</h4>
                <ul>
                  <li><strong>Essential:</strong> Required for basic functionality</li>
                  <li><strong>Analytics:</strong> Help us understand usage patterns</li>
                  <li><strong>Functional:</strong> Remember your preferences</li>
                  <li><strong>Marketing:</strong> Personalize advertisements (with consent)</li>
                </ul>
                
                <h4>7.2 Managing Cookies</h4>
                <p>
                  You can control cookies through your browser settings. Note that 
                  disabling certain cookies may limit functionality of our services.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>We retain your information for as long as necessary to:</p>
                <ul>
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain business records</li>
                </ul>
                <p>
                  Account information is typically retained for 7 years after account 
                  closure. Usage logs and analytics data are retained for 2 years.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. International Transfers</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Your information may be processed in countries other than your residence. 
                  We ensure appropriate safeguards are in place through:
                </p>
                <ul>
                  <li>Standard contractual clauses</li>
                  <li>Adequacy decisions by relevant authorities</li>
                  <li>Certification schemes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Our services are not directed to individuals under 18. We do not 
                  knowingly collect personal information from children under 18. 
                  If we become aware that we have collected personal information 
                  from a child under 18, we will delete it promptly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  We may update this Privacy Policy from time to time. We will notify 
                  you of material changes by email or by posting a notice on our website. 
                  Your continued use of our services after changes take effect constitutes 
                  acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  If you have questions about this Privacy Policy or want to exercise 
                  your rights, please contact us:
                </p>
                <ul>
                  <li><strong>Email:</strong> privacy@citizenspace.com</li>
                  <li><strong>Phone:</strong> (831) 295-1482</li>
                  <li><strong>Mail:</strong> 420 Pacific Ave, Santa Cruz, CA 95060</li>
                </ul>
                
                <p>
                  <strong>EU Representative:</strong> For EU-related inquiries, 
                  contact our Data Protection Officer at dpo@citizenspace.com
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  );
}