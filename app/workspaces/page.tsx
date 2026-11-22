import type { Metadata } from 'next'
import { RoomPicker } from '@/components/site/room-picker'
import { Eyebrow, Section, H1, H2, Lead, RuleCard, ButtonLink, Photo } from '@/components/site/ui'
import { ZONES, SITE } from '@/lib/site/content'

export const metadata: Metadata = {
  title: 'Workspaces: hot desks, drop-in, conference room and podcast studio',
  description:
    'Coworking at 819 Pacific Ave, Santa Cruz: 8 hot desks, 12 drop-in seats, a conference room for 8 ($7/hr) and a content studio ($12/hr). Day pass $12, flex desk $124/mo.',
  alternates: { canonical: '/workspaces' },
}

const priceLine = 'm-0 font-display text-[44px] font-semibold leading-none'
const unit = 'font-sans text-[17px] font-normal text-brand-muted'

export default function WorkspacesPage() {
  return (
    <>
      <Section innerClassName="gap-4 pb-12 md:pb-12">
        <Eyebrow>Workspaces</Eyebrow>
        <H1 className="max-w-[860px]">Pick a room. Every one is on one floor.</H1>
        <Lead>
          {SITE.squareFeet.toLocaleString()} sq ft: 24 work seats, a conference room for 8 and a
          content studio. Tap a room to see it today and the plan for it.
        </Lead>
      </Section>

      <Section aria-label="Floor plan and room picker" innerClassName="pt-0 md:pt-0">
        <RoomPicker zones={ZONES} />
      </Section>

      <Section id="desks" tone="bone" aria-labelledby="desks-h" className="scroll-mt-24">
        <div className="flex max-w-[720px] flex-col gap-2">
          <Eyebrow>Desks</Eyebrow>
          <H2 id="desks-h">Three ways to sit down.</H2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
          <RuleCard color="#6F8063" title="Monthly flex desk">
            <p className={priceLine}>
              $124<span className={unit}> / month</span>
            </p>
            <p className="m-0 text-[17px] text-brand-muted">
              Any of 8 hot desks in the window room. Founding rate; typical Santa Cruz price $249.
            </p>
          </RuleCard>
          <RuleCard color="#1F3D33" title="Drop-in day pass">
            <p className={priceLine}>
              $12<span className={unit}> / day</span>
            </p>
            <p className="m-0 text-[17px] text-brand-muted">
              12 seats on two oak benches by the member board. Or 10 days a month for $74. Typical
              price $25 a day.
            </p>
          </RuleCard>
          <RuleCard color="#4E6A7E" title="Founding desk">
            <p className={priceLine}>
              $600<span className={unit}> / month</span>
            </p>
            <p className="m-0 text-[17px] text-brand-muted">
              The 4 resident desks in the main shared room, held by the charter founders. They bring
              their own desks and chairs.
            </p>
          </RuleCard>
        </div>
      </Section>

      <Section
        id="conference"
        aria-labelledby="conf-h"
        className="scroll-mt-24"
        innerClassName="flex-row flex-wrap items-center"
      >
        <div className="min-w-0 flex-[1.3_1_520px]">
          <Photo
            src="/brand/plan/room-01-conference.jpg"
            alt="Conference room plan: fireplace, teal wall, oak table for 8"
            ratio="16 / 9"
          />
        </div>
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          <Eyebrow>Conference room</Eyebrow>
          <H2 id="conf-h">The fireplace room.</H2>
          <p className="m-0 text-[17px] text-brand-muted">
            Seats 8 at one oak table. Skylight overhead, a screen on the back wall, French doors
            that close for sound. 167 sq ft.
          </p>
          <p className="m-0 text-[17px] font-bold">
            $7 / hour founding rate · typical Santa Cruz price $15
          </p>
          <ButtonLink href="/contact" variant="forest" className="self-start">
            Ask about booking
          </ButtonLink>
        </div>
      </Section>

      <Section
        id="studio"
        tone="forest"
        aria-labelledby="studio-h"
        className="scroll-mt-24"
        innerClassName="flex-row flex-wrap items-center"
      >
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          <Eyebrow onDark>Content studio</Eyebrow>
          <H2 id="studio-h" onDark>
            Book the studio by the hour.
          </H2>
          <p className="m-0 text-[17px] text-brand-mist">
            Podcast and video for up to 4, with a backdrop wall. Right next to the main shared room.
            118 sq ft.
          </p>
          <p className="m-0 text-[17px] font-bold">$12 / hour founding rate · typical price $25</p>
        </div>
        <div className="min-w-0 flex-[1.3_1_520px]">
          <Photo
            src="/brand/photos/08-red-wall-room-wide.jpg"
            alt="The room planned as the content studio, today: red accent wall and French doors"
          />
        </div>
      </Section>

      <Section aria-labelledby="inc-h">
        <H2 id="inc-h">Every seat comes with</H2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
          <RuleCard color="#9E5640" title="Two Cruzio lines">
            <p className="m-0 text-[17px] text-brand-muted">2 Gbps down, 400 Mbps up.</p>
          </RuleCard>
          <RuleCard color="#4F7A63" title="The hallway lounge">
            <p className="m-0 text-[17px] text-brand-muted">A couch at the window end.</p>
          </RuleCard>
          <RuleCard color="#C8734F" title="The kitchen pantry">
            <p className="m-0 text-[17px] text-brand-muted">Coffee, a fridge, a dishwasher.</p>
          </RuleCard>
          <RuleCard color="#B08A5E" title="A QR member key">
            <p className="m-0 text-[17px] text-brand-muted">
              Your phone opens the door. Members open and close; trusted members hold off-hours
              access.
            </p>
          </RuleCard>
        </div>
      </Section>
    </>
  )
}
