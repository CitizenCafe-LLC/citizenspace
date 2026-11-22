import type { Metadata } from 'next'
import { Eyebrow, Section, H1, H2, Lead, ButtonLink } from '@/components/site/ui'
import { FAQ_GROUPS, FACTS } from '@/lib/site/content'
import { faqPageJsonLd, jsonLdScript } from '@/lib/site/jsonld'
import { FaqList } from '@/components/site/faq-list'

export const metadata: Metadata = {
  title: 'FAQ: coworking in Santa Cruz, prices, the Founding 50 and getting here',
  description:
    'Answers about Citizen Space at 819 Pacific Ave: affordable coworking in Santa Cruz, $12 day passes, $124/mo desks, podcast studio and meeting room rates, parking, food and Builder Night.',
  alternates: { canonical: '/faq' },
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqPageJsonLd(FAQ_GROUPS))}
      />

      <Section innerClassName="gap-4 pb-12 md:pb-12">
        <Eyebrow>FAQ</Eyebrow>
        <H1>Questions about Citizen Space</H1>
        <Lead className="max-w-[760px]">
          Coworking at 819 Pacific Ave in downtown Santa Cruz: prices, the Founding 50, getting
          here, food and how the space runs.
        </Lead>
      </Section>

      <section aria-labelledby="facts" className="bg-brand-paper pb-10 md:pb-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="flex flex-col gap-5 rounded-3xl bg-brand-forest p-5 text-brand-bone md:p-8">
            <h2 id="facts" className="m-0 font-display text-[30px] font-semibold text-brand-bone">
              Citizen Space at a glance
            </h2>
            <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-8 gap-y-5">
              {FACTS.map(([k, v]) => (
                <div key={k} className="border-t border-[#2E5A4B] pt-3">
                  <dt className="text-[13px] font-bold uppercase tracking-[2.5px] text-brand-peach">
                    {k}
                  </dt>
                  <dd className="m-0 mt-1.5 text-[17px] leading-snug text-brand-bone">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Section aria-label="Questions and answers" innerClassName="pt-0 md:pt-0">
        <FaqList groups={FAQ_GROUPS} />
      </Section>

      <Section
        tone="bone"
        aria-labelledby="ask"
        innerClassName="flex-row flex-wrap items-center justify-between gap-6 py-20 md:py-20"
      >
        <div className="flex flex-col gap-2">
          <H2 id="ask">Still have a question?</H2>
          <p className="m-0 text-[17px] text-brand-muted">
            Talk to Toby, or come to Builder Night on a Monday.
          </p>
        </div>
        <ButtonLink href="/contact" className="w-full sm:w-auto">
          Ask us
        </ButtonLink>
      </Section>
    </>
  )
}
