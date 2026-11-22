import Link from 'next/link'
import { Eyebrow, Section, H1, Lead, RuleCard, Photo } from '@/components/site/ui'
import { ContactForm } from '@/components/site/contact-form'
import { GettingHere } from '@/components/site/getting-here'

export default function ContactPage() {
  return (
    <>
      <Section innerClassName="flex-row flex-wrap items-center pb-12 md:pb-12">
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-4">
          <Eyebrow>Contact</Eyebrow>
          <H1>Questions? Talk to Toby.</H1>
          <Lead>Ask about founding memberships, book a tour or pitch an event.</Lead>
        </div>
        <div className="min-w-0 flex-[1_1_420px]">
          <Photo
            src="/brand/photos/05-french-doors-anteroom.jpg"
            alt="Glass French doors opening into the conference room"
            priority
          />
        </div>
      </Section>

      <Section
        aria-label="Contact form"
        innerClassName="flex-row flex-wrap items-start pt-0 md:pt-0"
      >
        <ContactForm />
        <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-8">
          <RuleCard color="#1F3D33" title="Visit">
            <p className="m-0 text-[17px] text-brand-muted">
              819 Pacific Ave, Santa Cruz. Tours by appointment until doors open.
            </p>
            <Link href="/location" className="font-bold text-brand-brick">
              Directions →
            </Link>
          </RuleCard>
          <RuleCard color="#9E5640" title="Founding 50">
            <p className="m-0 text-[17px] text-brand-muted">
              $1,000 once. Sales open December 1, 2026.
            </p>
            <Link href="/membership" className="font-bold text-brand-brick">
              How it works →
            </Link>
          </RuleCard>
          <RuleCard color="#6F8063" title="Say hi in person">
            <p className="m-0 text-[17px] text-brand-muted">
              Builder Night, every Monday at Pleasure Pizza on Pacific Ave.
            </p>
            <Link href="/events" className="font-bold text-brand-brick">
              Events →
            </Link>
          </RuleCard>
        </aside>
      </Section>

      <GettingHere />
    </>
  )
}
