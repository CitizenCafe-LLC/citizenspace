'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cs-bg">
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="prose prose-cs max-w-none">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-cs-espresso mb-8">
              Privacy Policy
            </h1>
            
            <p className="text-lg text-cs-muted mb-8">
              <strong>Last Updated:</strong> March 1, 2024
            </p>

            <div className="space-y-8 text-cs-muted leading-relaxed">
              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  1. Information We Collect
                </h2>
                <p>
                  We collect minimal information necessary to provide our services:
                </p>
                
                <h3 className="font-semibold text-cs-espresso mb-2 mt-4">Wallet Information</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Ethereum wallet addresses for NFT minting and membership verification</li>
                  <li>Transaction hashes for mint confirmations</li>
                  <li>NFT ownership status for benefit verification</li>
                </ul>

                <h3 className="font-semibold text-cs-espresso mb-2 mt-4">Contact Information</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Email addresses (when voluntarily provided for newsletter)</li>
                  <li>Discord usernames (when joining community)</li>
                  <li>Event RSVP information (through third-party platforms)</li>
                </ul>

                <h3 className="font-semibold text-cs-espresso mb-2 mt-4">Usage Analytics</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Website interactions and page views (via Vercel Analytics)</li>
                  <li>Anonymized user behavior patterns</li>
                  <li>Device and browser information for optimization</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  2. How We Use Information
                </h2>
                <p>
                  Your information is used solely for legitimate business purposes:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Verifying NFT ownership for membership benefits</li>
                  <li>Sending project updates and community communications</li>
                  <li>Processing event RSVPs and community management</li>
                  <li>Improving website performance and user experience</li>
                  <li>Legal compliance and operational requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  3. Blockchain and Public Data
                </h2>
                <p>
                  Important considerations about blockchain privacy:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Ethereum transactions are permanently public and immutable</li>
                  <li>NFT ownership and transfers are visible on block explorers</li>
                  <li>Wallet addresses can be linked to your identity through various means</li>
                  <li>We cannot delete or modify blockchain transaction history</li>
                  <li>Consider using a separate wallet if you prefer pseudonymity</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  4. Third-Party Services
                </h2>
                <p>
                  We integrate with several third-party services that have their own privacy policies:
                </p>
                
                <h3 className="font-semibold text-cs-espresso mb-2 mt-4">Essential Services</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Alchemy/Infura: Ethereum RPC access for blockchain interactions</li>
                  <li>WalletConnect: Wallet connection infrastructure</li>
                  <li>Discord: Community platform with separate privacy policy</li>
                </ul>

                <h3 className="font-semibold text-cs-espresso mb-2 mt-4">Analytics & Events</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Vercel Analytics: Website performance and usage statistics</li>
                  <li>PostHog: User behavior analysis (anonymized)</li>
                  <li>Luma: Event management and RSVP handling</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  5. Data Sharing and Disclosure
                </h2>
                <p>
                  We do not sell or rent your personal information. We may share data only in these situations:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>With service providers necessary for operations (hosting, analytics)</li>
                  <li>When required by law or legal process</li>
                  <li>To protect our rights or prevent illegal activity</li>
                  <li>With your explicit consent for specific purposes</li>
                  <li>In connection with business transfers (acquisition, merger, etc.)</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  6. Data Security
                </h2>
                <p>
                  We implement reasonable security measures to protect your information:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Encrypted data transmission (HTTPS/TLS)</li>
                  <li>Secure hosting infrastructure</li>
                  <li>Limited access to personal information</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Multi-signature wallet security for funds</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission or storage is 100% secure. You use our services at your own risk.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  7. Your Rights and Choices
                </h2>
                <p>
                  You have several options regarding your personal information:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Unsubscribe from emails using provided links</li>
                  <li>Leave Discord community at any time</li>
                  <li>Use different wallet addresses for privacy</li>
                  <li>Request deletion of voluntarily provided information</li>
                  <li>Contact us to correct inaccurate information</li>
                </ul>
                <p className="mt-4">
                  Note: We cannot modify blockchain records or delete NFT ownership history.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  8. International Users
                </h2>
                <p>
                  Citizen Space operates from the United States. If you're accessing our services from outside the US:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Your information may be transferred to and stored in the US</li>
                  <li>US privacy laws will apply to your information</li>
                  <li>By using our services, you consent to this transfer</li>
                  <li>We comply with applicable international privacy regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  9. Children's Privacy
                </h2>
                <p>
                  Our services are not intended for users under 18 years old. We do not knowingly collect 
                  personal information from children. If you're a parent who believes we've collected your 
                  child's information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  10. Changes to Privacy Policy
                </h2>
                <p>
                  We may update this privacy policy as our services evolve. Material changes will be 
                  communicated via email and Discord. The "Last Updated" date reflects the most recent changes.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  11. Contact Us
                </h2>
                <p>
                  Questions about this privacy policy or our data practices?
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Email: privacy@citizenspace.co</li>
                  <li>Discord: discord.gg/citizenspace</li>
                  <li>Mail: Citizen Space Privacy, San Francisco, CA (address updated upon space opening)</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}