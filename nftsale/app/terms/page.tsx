'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
              Terms of Service
            </h1>
            
            <p className="text-lg text-cs-muted mb-8">
              <strong>Last Updated:</strong> March 1, 2024
            </p>

            <div className="space-y-8 text-cs-muted leading-relaxed">
              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By participating in the Citizen Space NFT mint and using our services, you agree to these Terms of Service. 
                  If you do not agree to these terms, please do not participate in the mint or use our services.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  2. Utility NFT Disclaimer
                </h2>
                <p>
                  Citizen Space Founder NFTs are utility tokens that provide access to membership benefits and discounts. 
                  They are not investment vehicles, securities, or collectibles. The primary purpose is to grant membership 
                  rights and community access.
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>NFTs provide lifetime 50% discount on memberships when space opens</li>
                  <li>Benefits are contingent on successful funding and space establishment</li>
                  <li>No guarantee of investment returns or appreciation in value</li>
                  <li>Utility may change based on operational requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  3. Funding Goals and Refund Policy
                </h2>
                <p>
                  Our fundraising has clear goals and refund policies:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Minimum goal: $25,000 to establish basic operations</li>
                  <li>Stretch goal: $50,000 to unlock premium features</li>
                  <li>If minimum goal is not met by deadline, all NFT holders receive full refunds</li>
                  <li>Refunds processed automatically through smart contract</li>
                  <li>No refunds if minimum goal is achieved, regardless of stretch goal status</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  4. Membership Benefits and Terms
                </h2>
                <p>
                  NFT holders receive the following benefits upon space opening:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>50% discount on all monthly membership rates</li>
                  <li>Priority booking for meeting rooms and event spaces</li>
                  <li>Access to members-only hours (if stretch goal met)</li>
                  <li>Founder recognition and special community status</li>
                  <li>Access to token-gated Discord and exclusive events</li>
                </ul>
                <p className="mt-4">
                  Benefits are tied to NFT ownership and transfer with the token. Standard coworking 
                  space rules and policies apply to all members.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  5. Timeline and Operational Disclaimers
                </h2>
                <p>
                  Space opening timeline is estimated for Q4 2024 but may change due to:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Permit approval delays</li>
                  <li>Construction and buildout timeline</li>
                  <li>Space acquisition negotiations</li>
                  <li>Regulatory requirements</li>
                </ul>
                <p className="mt-4">
                  We commit to monthly progress updates and transparent communication about any delays.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  6. Technical Terms
                </h2>
                <p>
                  NFTs are issued on Ethereum mainnet as ERC-721 tokens:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Smart contract code is immutable once deployed</li>
                  <li>2.5% creator royalty applies to secondary sales</li>
                  <li>Blockchain transactions are final and irreversible</li>
                  <li>You are responsible for wallet security and backup</li>
                  <li>We cannot recover lost wallets or reverse transactions</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  7. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, Citizen Space and its team members are not liable for:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Delays in space opening beyond our control</li>
                  <li>Changes in utility or benefits due to operational requirements</li>
                  <li>Lost wallets, compromised private keys, or user error</li>
                  <li>Fluctuations in ETH value or gas fees</li>
                  <li>Third-party service disruptions (Ethereum network, Discord, etc.)</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  8. Changes to Terms
                </h2>
                <p>
                  We may update these terms as needed for legal compliance or operational changes. 
                  Material changes will be communicated to the community via Discord and email. 
                  Continued use of services after changes indicates acceptance.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl font-semibold text-cs-espresso mb-4">
                  9. Contact Information
                </h2>
                <p>
                  For questions about these terms or our services, contact us at:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                  <li>Email: legal@citizenspace.co</li>
                  <li>Discord: discord.gg/citizenspace</li>
                  <li>Address: San Francisco, CA (specific address provided upon space opening)</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}