import type { Metadata } from 'next'
import { Eyebrow, Section, H1, H2, RuleCard } from '@/components/site/ui'
import { CafeMenu } from '@/components/site/cafe-menu'
import { ZACHARYS_HOURS } from '@/lib/site/content'

export const metadata: Metadata = {
  title: 'Cafe: the member menu from Zachary’s, delivered to your desk',
  description:
    'Citizen Space members order breakfast and lunch from Zachary’s, downstairs at 819 Pacific Ave since 1985, and it comes up to their seat. Tue–Sun 7am–2:30pm.',
  alternates: { canonical: '/cafe' },
}

export default function CafePage() {
  return (
    <>
      <Section tone="forest" aria-labelledby="k-title" innerClassName="gap-10 pt-16 md:pt-20">
        <div className="flex max-w-[820px] flex-col gap-4">
          <Eyebrow onDark>Cafe · Kitchen pantry · Member menu</Eyebrow>
          <H1 id="k-title" onDark>
            Breakfast from downstairs, brought to your desk.
          </H1>
          <p className="m-0 text-[22px] leading-snug text-brand-mist">
            Zachary’s has cooked on this block since 1985, right below us at 819 Pacific. Order from
            the member menu here and it comes up to you in the space.
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-[15px] text-brand-mist">
            <span>
              <strong className="text-brand-bone">Kitchen hours</strong> · {ZACHARYS_HOURS}
            </span>
            <span>
              <strong className="text-brand-bone">Coffee bar</strong> · open to members whenever the
              space is
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          {[
            [
              '/brand/photos/14-kitchen-utility.jpg',
              'The kitchen pantry today: tile floor, old sink, exposed conduit',
              'Today.',
              'Tile floor, plumbing in place, wiring to tidy.',
            ],
            [
              '/brand/renderings/kitchen-pantry.jpg',
              'Rendering of the planned kitchen pantry: terracotta tile backsplash, oak cabinets, new sink and dishwasher, espresso machine, fridge, globe pendants and a chalkboard menu',
              'The plan.',
              'Terracotta tile, oak cabinets, a new sink and dishwasher, the coffee bar and a chalkboard menu.',
            ],
          ].map(([src, alt, lead, rest]) => (
            <figure key={src} className="m-0 flex min-w-0 flex-[1_1_380px] flex-col gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="w-full rounded-3xl object-cover"
                style={{ aspectRatio: '4 / 3' }}
              />
              <figcaption className="text-[15px] text-brand-mist">
                <strong className="text-brand-bone">{lead}</strong> {rest}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="menu" aria-labelledby="menu-h" className="scroll-mt-24" innerClassName="gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Eyebrow>The member menu · from Zachary’s</Eyebrow>
          <H2 id="menu-h" className="md:text-[56px]">
            Menu
          </H2>
          <p className="m-0 max-w-[640px] text-[17px] text-brand-muted">
            Everything homemade, from the three house breads to the sourdough pancakes. Add what you
            want, pick your seat, and send the order.
          </p>
        </div>
        <CafeMenu />
      </Section>

      <Section tone="bone" aria-labelledby="k-in" innerClassName="gap-10">
        <H2 id="k-in">The kitchen pantry</H2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
          <RuleCard color="#C8734F" title="Coffee bar">
            <p className="m-0 text-[17px] text-brand-muted">
              Espresso and drip for members, any time the space is open.
            </p>
          </RuleCard>
          <RuleCard color="#9E5640" title="New sink and dishwasher">
            <p className="m-0 text-[17px] text-brand-muted">Rinse it, load it, done.</p>
          </RuleCard>
          <RuleCard color="#1F3D33" title="Fridge">
            <p className="m-0 text-[17px] text-brand-muted">Bring lunch. Label it.</p>
          </RuleCard>
          <RuleCard color="#6F8063" title="On the bounty board">
            <p className="m-0 text-[17px] text-brand-muted">
              Restocking and the weekly clean, picked up by members for credits.
            </p>
          </RuleCard>
        </div>
      </Section>
    </>
  )
}
