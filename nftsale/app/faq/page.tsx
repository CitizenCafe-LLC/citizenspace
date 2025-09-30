'use client';

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const faqSections = [
  {
    title: 'NFTs & Memberships',
    faqs: [
      {
        question: "How does the 50% lifetime discount work?",
        answer: "When you hold a Founder NFT in your wallet, our membership system automatically detects it and applies a 50% discount to all monthly rates. The discount is permanently tied to the NFT - if you sell it, the new owner gets the discount. There are no expiration dates or renewal requirements."
      },
      {
        question: "Can I sell or transfer my Founder NFT?",
        answer: "Absolutely! Founder NFTs are standard ERC-721 tokens, which means you can sell them on marketplaces like OpenSea, transfer them to another wallet, or even gift them to someone. All membership benefits (including the 50% discount) transfer with the NFT to its new owner."
      },
      {
        question: "What if I lose access to my wallet?",
        answer: "If you lose access to your wallet, you'll lose access to your NFT and membership benefits. We recommend using a hardware wallet and backing up your seed phrase securely. We cannot recover lost wallets or transfer NFTs without the proper cryptographic signatures."
      },
      {
        question: "Why use NFTs instead of traditional memberships?",
        answer: "NFTs provide true ownership - you actually own your membership rather than just having an account that can be terminated. They're transferable, tradeable, and verifiable on-chain. Plus, they enable cool features like token-gated Discord access and automatic discount application."
      }
    ]
  },
  {
    title: 'Funding & Goals',
    faqs: [
      {
        question: "What happens if you don't reach the minimum goal?",
        answer: "If we don't raise at least $25,000 by our deadline, all NFT holders will receive full refunds. We're committed to only moving forward if we can deliver the quality space you deserve. Refunds would be processed automatically through our smart contract."
      },
      {
        question: "How will the funds be used?",
        answer: "Complete transparency: $25k minimum goes to paint/repairs, basic espresso setup, initial furniture, permits/insurance, and part-time staff. If we hit $50k stretch goal, we add phone booths, fiber Wi-Fi, commercial espresso equipment, ergonomic seating, and extended member hours."
      },
      {
        question: "Where are the funds held?",
        answer: "All funds are held in a multi-signature wallet that requires multiple team members to approve any expenditure. We'll provide monthly spending reports and receipts. Community members can view the wallet balance and transactions on-chain at any time."
      },
      {
        question: "What's the creator royalty for?",
        answer: "The 2.5% creator royalty on secondary sales helps fund ongoing operations and future locations. It's lower than most NFT projects and only applies to resales, not the initial mint. This helps ensure we can keep improving the space over time."
      }
    ]
  },
  {
    title: 'Technical & Setup',
    faqs: [
      {
        question: "Do I need crypto experience to participate?",
        answer: "Not at all! We provide step-by-step guides for setting up a wallet and minting your NFT. Our team offers personal onboarding calls for anyone new to crypto. We're also adding a credit card payment option soon for those who prefer traditional payments."
      },
      {
        question: "Which wallets are supported?",
        answer: "We support all major Ethereum wallets including MetaMask, Rainbow, Coinbase Wallet, WalletConnect-compatible wallets, and hardware wallets like Ledger. Our connection uses RainbowKit for the best user experience across all devices."
      },
      {
        question: "Why Ethereum mainnet instead of a cheaper chain?",
        answer: "Ethereum provides the most security and liquidity for NFTs. While gas fees are higher, it ensures your NFT will be valuable and tradeable long-term. We're exploring Layer 2 options like Base or Polygon for future drops to reduce costs."
      },
      {
        question: "What about gas fees?",
        answer: "Gas fees for minting are paid by you in addition to the 0.08 ETH mint price. We recommend minting during off-peak hours (evenings/weekends US time) when gas is typically lower. We'll post gas fee estimates on our Discord before major mint announcements."
      }
    ]
  },
  {
    title: 'Timeline & Operations',
    faqs: [
      {
        question: "When will Citizen Space actually open?",
        answer: "Our target is Q4 2024, but the exact timeline depends on permit approvals, space buildout, and which location we secure. We'll provide monthly progress updates and realistic timeline adjustments throughout the process."
      },
      {
        question: "What happens between now and opening?",
        answer: "We'll host monthly founder events, provide detailed progress updates, finalize our space selection, handle permits and buildout, and launch our Discord community. NFT holders get priority access to all events and exclusive behind-the-scenes updates."
      },
      {
        question: "How do I access member benefits before opening?",
        answer: "Pre-launch benefits include access to our token-gated Discord, priority RSVP for events, founder badge recognition, and input on space design decisions. Post-launch benefits include the 50% discount, priority booking, and members-only hours."
      },
      {
        question: "What if the space needs to relocate later?",
        answer: "Your NFT benefits apply to any official Citizen Space location. If we ever need to relocate, your membership transfers automatically. We're building a brand and community, not just a single physical space."
      }
    ]
  }
];

export default function FAQPage() {
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

          <div className="text-center mb-12">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-cs-espresso mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-cs-muted max-w-2xl mx-auto">
              Everything you need to know about NFT memberships, funding goals, wallets, 
              and the rebuilding process. Can't find your answer? Join our Discord!
            </p>
          </div>

          <div className="space-y-12">
            {faqSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="font-display text-2xl font-bold text-cs-espresso mb-6">
                  {section.title}
                </h2>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {section.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`section-${sectionIndex}-item-${faqIndex}`}
                      className="border border-cs-border rounded-2xl px-6 py-2 bg-cs-bg shadow-cs-card"
                    >
                      <AccordionTrigger className="text-left font-display font-semibold text-cs-espresso hover:no-underline hover:text-cs-blue transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-cs-muted leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 p-8 bg-cs-blue/5 rounded-2xl border border-cs-blue/20">
            <h3 className="font-display text-xl font-semibold text-cs-espresso mb-3">
              Still Have Questions?
            </h3>
            <p className="text-cs-muted mb-6">
              Join our Discord community for real-time answers and to connect with other founders.
              Our team is active daily and happy to help!
            </p>
            <Button 
              className="bg-cs-blue hover:bg-cs-blue/90"
              onClick={() => window.open('https://discord.gg/citizenspace', '_blank')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Join Discord Community
            </Button>
          </div>
        </div>
      </div>

    </main>
  );
}