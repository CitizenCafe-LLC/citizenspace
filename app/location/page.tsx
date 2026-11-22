import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow, Section, H1, H2, Lead, RuleCard, ButtonLink, Photo } from '@/components/site/ui'
import { SITE } from '@/lib/site/content'

export const metadata: Metadata = {
  title: 'Location: 819 Pacific Ave, downtown Santa Cruz',
  description:
    'Citizen Space is at 819 Pacific Ave, Santa Cruz, CA 95060, upstairs from Zachary’s. Parking, bus and bike details.',
  alternates: { canonical: '/location' },
}

const MAP_SRC = 'https://www.google.com/maps?q=819+Pacific+Ave,+Santa+Cruz,+CA+95060&output=embed'

export default function LocationPage() {
  return (
    <>
      <Section innerClassName="gap-4 pb-12 md:pb-12">
        <Eyebrow>Location</Eyebrow>
        <H1>819 Pacific Ave, Santa Cruz.</H1>
        <Lead>Downtown, with the brick wall and the tall windows on Pacific Ave.</Lead>
      </Section>

      <Section
        aria-label="Address and map"
        innerClassName="flex-row flex-wrap items-stretch gap-6 pt-0 md:pt-0"
      >
        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-5 rounded-3xl bg-brand-bone p-8">
          <RuleCard color="#9E5640" title="Address" className="pt-4">
            <address className="text-[17px] not-italic leading-normal">
              Citizen Space
              <br />
              {SITE.address.street}
              <br />
              {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}
            </address>
          </RuleCard>
          <RuleCard color="#1F3D33" title="Dates" className="pt-4">
            <p className="m-0 text-[17px] text-brand-muted">
              Founding sales open {SITE.foundingSalesOpen}.<br />
              Doors open {SITE.doorsOpen}.
            </p>
          </RuleCard>
          <RuleCard color="#6F8063" title="Getting here" className="pt-4">
            <p className="m-0 text-[17px] text-brand-muted">
              City meters, lots and garages nearby. Buses at the River Front Transit Center. Bike
              racks on Pacific Ave; no bike storage inside.
            </p>
            <Link href="/contact#getting-here" className="font-bold text-brand-brick">
              Parking, bus and bike details →
            </Link>
          </RuleCard>
          <ButtonLink
            href="https://maps.google.com/?q=819+Pacific+Ave+Santa+Cruz+CA"
            variant="forest"
            className="self-start"
          >
            Open in Google Maps
          </ButtonLink>
        </div>
        <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-6">
          <iframe
            title="Map of 819 Pacific Ave, Santa Cruz"
            src={MAP_SRC}
            className="min-h-[360px] w-full flex-1 rounded-3xl border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <Photo
            src="/brand/photos/09-bay-window-corner.jpg"
            alt="Corner room with brick and a tall window on Pacific Ave"
            ratio="16 / 9"
          />
        </div>
      </Section>

      <Section
        tone="bone"
        aria-labelledby="a11y"
        innerClassName="flex-row flex-wrap items-center justify-between gap-8 py-20 md:py-20"
      >
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-2">
          <H2 id="a11y" className="md:text-[30px]">
            Access
          </H2>
          <p className="m-0 text-[17px] text-brand-muted">
            Members get in with a QR member key on their phone, no cards. Need to know something
            specific about access before you visit? Talk to Toby.
          </p>
        </div>
        <ButtonLink href="/contact" variant="outlineDark">
          Talk to Toby
        </ButtonLink>
      </Section>
    </>
  )
}
