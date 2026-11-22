import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Eyebrow, Section, H1, H2, Lead, ButtonLink } from '@/components/site/ui'
import { FAQ_GROUPS, FACTS } from '@/lib/site/content'
import { faqPageJsonLd, jsonLdScript } from '@/lib/site/jsonld'

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

      <section aria-labelledby="facts" className="bg-brand-paper pb-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="flex flex-col gap-5 rounded-3xl bg-brand-forest p-8 text-brand-bone">
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

      <Section
        aria-label="Questions and answers"
        innerClassName="flex-row flex-wrap items-start pt-0 md:pt-0"
      >
        <nav
          aria-label="FAQ topics"
          className="flex min-w-0 flex-[1_1_220px] flex-col gap-1 lg:sticky lg:top-28"
        >
          <p className="m-0 mb-2 text-[13px] font-bold uppercase tracking-[2.5px] text-brand-muted">
            Topics
          </p>
          {FAQ_GROUPS.map(g => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="flex min-h-[44px] items-center border-l-[6px] pl-3 text-base font-semibold text-brand-ink no-underline"
              style={{ borderLeftColor: g.color }}
            >
              {g.title}
            </a>
          ))}
        </nav>
        <div className="flex min-w-0 flex-[999_1_640px] flex-col gap-14">
          {FAQ_GROUPS.map(g => (
            <section key={g.id} id={g.id} className="flex scroll-mt-28 flex-col gap-1">
              <h2
                className="m-0 mb-3 border-t-[6px] pt-4 font-display text-[30px] font-semibold leading-tight"
                style={{ borderTopColor: g.color }}
              >
                {g.title}
              </h2>
              {g.items.map(qa => (
                <details key={qa.question} className="group border-b border-brand-hairline">
                  <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-[19px] font-bold [&::-webkit-details-marker]:hidden">
                    {qa.question}
                    <Plus
                      aria-hidden
                      className="h-6 w-6 shrink-0 text-brand-brick transition-transform group-open:rotate-45"
                    />
                  </summary>
                  <p className="m-0 mb-5 max-w-[760px] text-[17px] leading-relaxed text-brand-muted">
                    {qa.answer}
                  </p>
                </details>
              ))}
            </section>
          ))}
        </div>
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
        <ButtonLink href="/contact">Ask us</ButtonLink>
      </Section>
    </>
  )
}
