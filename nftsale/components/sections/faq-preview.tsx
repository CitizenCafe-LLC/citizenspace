"use client";

import { Button } from '@/components/ui/button';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: "How does the 50% lifetime discount work?",
    answer: "When you hold a Founder NFT, our membership system automatically applies a 50% discount to all monthly rates. The discount is tied to wallet ownership and verified on-chain. If you sell the NFT, the new owner gets the discount."
  },
  {
    question: "What happens if you don't reach the minimum goal?",
    answer: "If we don't raise at least $25,000, all NFT holders will receive full refunds. We're committed to transparency and won't move forward unless we can deliver the quality space you deserve."
  },
  {
    question: "Can I sell or transfer my Founder NFT?",
    answer: "Yes! Founder NFTs are standard ERC-721 tokens, meaning you can sell them on OpenSea or transfer them to another wallet. The lifetime discount and benefits transfer with the NFT to its new owner."
  },
  {
    question: "Do I need crypto experience to participate?",
    answer: "Not at all! We'll help you set up a wallet and guide you through the minting process. We're also adding a credit card option soon for those who prefer traditional payment methods."
  },
  {
    question: "When will Citizen Space actually open?",
    answer: "Our target is late 2024, but the exact timeline depends on permitting, buildout, and which space we secure. We'll provide monthly updates throughout the process."
  }
];

export function FAQPreview() {
  return (
    <section className="py-16 lg:py-24 bg-cs-blue/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-cs-espresso mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-cs-muted max-w-2xl mx-auto">
            Get answers to the most common questions about NFT memberships, funding goals, and the rebuilding process.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
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

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/faq">
              View All FAQs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}