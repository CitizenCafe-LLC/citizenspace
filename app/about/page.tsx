import { Eyebrow, Section, H1, H2, Lead, ButtonLink, RuleCard } from '@/components/site/ui'
import { BRAND } from '@/lib/site/content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Citizen Space began in San Francisco in 2006, grown out of the Bay Area’s original coworking scene. We own the original brand and are reopening it in Santa Cruz at 819 Pacific Ave.',
}

const timeline = [
  {
    year: '2005',
    title: 'Where it started',
    description:
      'Brad Neuberg, Chris Messina and Tara Hunt are part of the Bay Area’s first coworking scene, starting with Spiral Muse and continuing through The Hat Factory.',
  },
  {
    year: '2006',
    title: 'Citizen Space, San Francisco',
    description:
      'That same group founds Citizen Space — Brad Neuberg a founding member, Chris Messina and Tara Hunt founding it as its own space.',
  },
  {
    year: '2011',
    title: 'The brand changes hands',
    description: 'Toby Morning acquires the Citizen Space brand and the citizenspace.us domain.',
  },
  {
    year: '2012',
    title: 'Connections SF',
    description:
      'Toby Morning and Ralph Bahna co-found Connections SF, a coworking space inside Club Quarters’ San Francisco hotel. Bahna is also the founder of Club Quarters Hotels.',
  },
  {
    year: '2026',
    title: 'Santa Cruz',
    description:
      'Citizen Space reopens at 819 Pacific Ave, Santa Cruz. Founding sales open December 1, 2026.',
  },
  {
    year: '2027',
    title: 'Doors open',
    description: 'Charter founders move in January. Doors open to everyone in March.',
  },
]

export default function AboutPage() {
  return (
    <div className="py-12">
      {/* Hero */}
      <Section className="pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Our story</Eyebrow>
          <H1>A Santa Cruz home for a name with real history.</H1>
          <Lead className="mx-auto">
            Citizen Space isn’t a new brand borrowing an old name. It’s the original San Francisco
            coworking space, under the same ownership since 2011, reopening in Santa Cruz.
          </Lead>
        </div>
      </Section>

      {/* Timeline */}
      <Section className="bg-brand-bone py-20">
        <div className="mx-auto max-w-3xl">
          <H2 className="mb-16 text-center">Where the name comes from</H2>
          <div className="space-y-12">
            {timeline.map(item => (
              <div key={item.year} className="flex flex-col items-start gap-6 md:flex-row">
                <div className="flex-shrink-0 md:w-24">
                  <span className="inline-block rounded-full bg-brand-forest px-4 py-1 text-sm font-bold text-brand-bone">
                    {item.year}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 font-display text-xl font-semibold text-brand-ink">
                    {item.title}
                  </h3>
                  <p className="text-brand-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* The lineage */}
      <Section className="py-20">
        <div className="mx-auto max-w-3xl">
          <H2 className="mb-10 text-center">The people behind the name</H2>
          <div className="space-y-8">
            <RuleCard color={BRAND.forest} title="Same scene, same people">
              <p className="text-brand-muted">
                Citizen Space grew out of the Bay Area’s original coworking scene — Spiral Muse,
                then The Hat Factory, then Citizen Space itself in 2006. Brad Neuberg was a
                founding member; Chris Messina and Tara Hunt founded Citizen Space as its own
                space. It’s the same throughline, not three unrelated ventures.
              </p>
            </RuleCard>
            <RuleCard color={BRAND.brick} title="The brand, the same one">
              <p className="text-brand-muted">
                Toby Morning acquired the Citizen Space brand and the citizenspace.us domain in
                2011. This Santa Cruz space, opening at 819 Pacific Ave, is that same brand under
                that same ownership — reopening, not reusing a name.
              </p>
            </RuleCard>
            <RuleCard color={BRAND.moss} title="The hashtag">
              <p className="text-brand-muted">
                Chris Messina, Citizen Space’s co-founder, proposed the hashtag convention on
                Twitter in 2007 — a year after Citizen Space opened, and part of the same
                scene that built this space in the first place.
              </p>
            </RuleCard>
            <RuleCard color={BRAND.oak} title="Connections SF">
              <p className="text-brand-muted">
                In 2012, Toby Morning co-founded Connections SF with Ralph Bahna, one of the first
                coworking spaces built inside a hotel — the Club Quarters hotel in San Francisco.
                Bahna was the founder of Club Quarters Hotels. Connections SF carried the same idea
                Citizen Space started — shared, flexible workspace — into a hotel setting.
              </p>
            </RuleCard>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-brand-forest py-20">
        <div className="mx-auto max-w-3xl text-center">
          <H2 className="mb-6 text-brand-bone">Join the next chapter.</H2>
          <p className="mb-8 text-lg text-brand-mist">
            Founding sales open December 1, 2026. Doors open March 2027.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <ButtonLink href="/membership" variant="brick">
              Join the Founding 50
            </ButtonLink>
            <ButtonLink href="/contact" variant="outlineLight">
              Talk to Toby
            </ButtonLink>
          </div>
        </div>
      </Section>
    </div>
  )
}
