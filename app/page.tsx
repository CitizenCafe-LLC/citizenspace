import Link from 'next/link'
import { HeroCarousel } from '@/components/site/hero-carousel'
import {
  Eyebrow,
  Section,
  H1,
  H2,
  Lead,
  RuleCard,
  ButtonLink,
  Photo,
  usd,
} from '@/components/site/ui'
import { HERO_SLIDES, ZONES, MEMBERSHIP_RATES, SITE } from '@/lib/site/content'

const rate = (name: string) => MEMBERSHIP_RATES.find(r => r.name === name)!

export default function HomePage() {
  return (
    <>
      <section
        aria-label="Welcome"
        className="relative overflow-hidden bg-brand-forest text-brand-bone"
      >
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-14 px-4 pb-20 pt-16 sm:px-8 md:pt-20">
          <div className="relative z-10 flex min-w-0 flex-[1_1_420px] flex-col gap-6">
            <Eyebrow onDark>Santa Cruz Builder Lab · 819 Pacific Ave</Eyebrow>
            <H1 onDark className="md:text-[72px]">
              A home for Santa Cruz builders.
            </H1>
            <Lead onDark className="max-w-[480px]">
              Exposed brick, skylights, a gas fireplace and a chandelier. Run by the people who use
              it.
            </Lead>
            <div className="mt-2 flex flex-wrap gap-3">
              <ButtonLink href="/membership">Join the Founding 50</ButtonLink>
              <ButtonLink href="/contact" variant="outlineLight">
                Book a tour
              </ButtonLink>
            </div>
            <p className="m-0 mt-2 text-sm text-brand-mist">
              Founding sales open {SITE.foundingSalesOpen} · Doors open {SITE.doorsOpen}
            </p>
            <svg width="300" height="72" viewBox="0 0 300 72" aria-hidden className="mt-4">
              <rect x="0" y="16" width="160" height="40" rx="20" fill="#9E5640" />
              <rect x="120" y="28" width="120" height="40" rx="20" fill="#B08A5E" />
              <rect x="210" y="8" width="90" height="40" rx="20" fill="#6F8063" />
              {[16, 32, 48, 64].map(cx => (
                <circle key={cx} cx={cx} cy="4" r="4" fill="#E7B49B" />
              ))}
            </svg>
          </div>
          <div className="min-w-0 flex-[1.35_1_520px]">
            <HeroCarousel slides={HERO_SLIDES} />
          </div>
        </div>
      </section>

      <Section aria-labelledby="f50">
        <div className="flex max-w-[720px] flex-col gap-2">
          <Eyebrow>The Founding 50</Eyebrow>
          <H2 id="f50">Join early, move in early.</H2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
          <RuleCard color="#9E5640">
            <p className="m-0 font-display text-[56px] font-semibold leading-none">$1,000</p>
            <p className="m-0 text-[17px] text-brand-muted">Once, or 3 payments of $333.</p>
          </RuleCard>
          <RuleCard color="#1F3D33">
            <p className="m-0 font-display text-[56px] font-semibold leading-none">For life</p>
            <p className="m-0 text-[17px] text-brand-muted">
              Founding rates: about half of what other Santa Cruz spaces charge.
            </p>
          </RuleCard>
          <RuleCard color="#6F8063">
            <p className="m-0 font-display text-[56px] font-semibold leading-none">Only 50</p>
            <p className="m-0 text-[17px] text-brand-muted">Sales open {SITE.foundingSalesOpen}.</p>
          </RuleCard>
        </div>
        <div className="flex flex-col gap-3">
          <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6 rounded-3xl bg-brand-bone p-7">
            {[
              ['Day pass', usd(rate('Day pass').founding)],
              ['10-day flex', `${usd(rate('10-day flex').founding)}/mo`],
              ['Monthly flex desk', `${usd(rate('Monthly flex desk').founding)}/mo`],
              [
                'Virtual address + 2 day passes',
                `${usd(rate('Virtual address with 2 day passes').founding)}/mo`,
              ],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm text-brand-muted">{k}</dt>
                <dd className="m-0 mt-1 font-display text-[30px] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="m-0 text-sm text-brand-muted">
            Founding rates, for life. After the Founding 50 sell out, new members pay standard
            rates.
          </p>
        </div>
        <div>
          <ButtonLink href="/membership" variant="forest">
            See all rates
          </ButtonLink>
        </div>
      </Section>

      <Section tone="bone" aria-labelledby="rooms">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-[720px] flex-col gap-2">
            <Eyebrow>Room by room</Eyebrow>
            <H2 id="rooms">Seven rooms, one floor.</H2>
            <p className="m-0 text-[17px] text-brand-muted">
              Photos show the space today. Each room is planned out, down to the paint.
            </p>
          </div>
          <Link href="/workspaces" className="font-bold text-brand-brick">
            All workspaces →
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-6 gap-y-8">
          {ZONES.map(z => (
            <Link
              key={z.id}
              href={z.href}
              className="flex flex-col gap-3 text-brand-ink no-underline"
            >
              <Photo src={z.photo} alt={z.photoAlt} />
              <RuleCard color={z.color} title={z.name} className="pt-3">
                <p className="m-0 text-[15px] text-brand-muted">{z.meta}</p>
              </RuleCard>
            </Link>
          ))}
          <Link
            href="/workspaces"
            className="flex min-h-[260px] flex-col justify-between rounded-3xl bg-brand-forest p-7 text-brand-bone no-underline"
          >
            <Eyebrow onDark>Floor plan</Eyebrow>
            <span className="font-display text-[30px] font-semibold leading-tight">
              See the whole floor, furnished →
            </span>
          </Link>
        </div>
      </Section>

      <Section aria-labelledby="plan">
        <div className="flex max-w-[720px] flex-col gap-2">
          <Eyebrow>Today and the plan</Eyebrow>
          <H2 id="plan">We keep the brick. We fix the rest.</H2>
        </div>
        <div className="flex flex-wrap gap-6">
          <figure className="m-0 flex min-w-0 flex-[1_1_380px] flex-col gap-3">
            <Photo
              src="/brand/photos/12-conference-room.jpg"
              alt="Conference room today: patched grey walls, empty"
            />
            <figcaption className="text-sm text-brand-muted">
              <strong className="text-brand-ink">Today.</strong> The fireplace room, walls patched,
              nothing in it.
            </figcaption>
          </figure>
          <figure className="m-0 flex min-w-0 flex-[1.6_1_520px] flex-col gap-3">
            <Photo
              src="/brand/plan/room-01-conference.jpg"
              alt="Conference room plan: deep teal wall, skylight diffuser, oak table for 8, French doors"
              ratio="16 / 9"
            />
            <figcaption className="text-sm text-brand-muted">
              <strong className="text-brand-ink">The plan.</strong> Deep teal behind the fireplace,
              a skylight diffuser for calls, an oak table for 8.
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section tone="bone" aria-labelledby="run">
        <div className="flex max-w-[720px] flex-col gap-2">
          <Eyebrow>Run by the community</Eyebrow>
          <H2 id="run">Members open, close and care for the space.</H2>
          <p className="m-0 text-[17px] text-brand-muted">
            No paid staff. Pick an app. Help build the space.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
          <RuleCard color="#9E5640" title="Builder Night">
            <p className="m-0 text-[17px] text-brand-muted">
              Demos and building together. Mondays at Pleasure Pizza on Pacific Ave until doors
              open.
            </p>
          </RuleCard>
          <RuleCard color="#1F3D33" title="The bounty board">
            <p className="m-0 text-[17px] text-brand-muted">
              Pull an issue, ship it, earn credits toward your membership.
            </p>
          </RuleCard>
          <RuleCard color="#6F8063" title="Colearn classes">
            <p className="m-0 text-[17px] text-brand-muted">Members teach members.</p>
          </RuleCard>
          <RuleCard color="#B08A5E" title="Two Cruzio lines">
            <p className="m-0 text-[17px] text-brand-muted">2 Gbps down, 400 Mbps up.</p>
          </RuleCard>
        </div>
      </Section>

      <Section
        tone="forest"
        aria-labelledby="where"
        innerClassName="flex-row flex-wrap items-center"
      >
        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
          <Eyebrow onDark>819 Pacific Ave · Santa Cruz</Eyebrow>
          <H2 id="where" onDark>
            Downtown, on Pacific Ave.
          </H2>
          <p className="m-0 text-[17px] text-brand-mist">
            Questions? Talk to Toby. Or come see the space before doors open.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Book a tour</ButtonLink>
            <ButtonLink href="/location" variant="outlineLight">
              Get directions
            </ButtonLink>
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_440px]">
          <Photo
            src="/brand/photos/09-bay-window-corner.jpg"
            alt="Corner room with brick and a tall window on Pacific Ave"
          />
        </div>
      </Section>
    </>
  )
}
