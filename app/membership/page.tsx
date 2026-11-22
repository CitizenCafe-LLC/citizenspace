import type { Metadata } from 'next'
import { Eyebrow, Section, H1, H2, RuleCard, ButtonLink, usd } from '@/components/site/ui'
import {
  MEMBERSHIP_RATES,
  HOURLY_RATES,
  RATE_SOURCES,
  SPONSOR_TIERS,
  SITE,
} from '@/lib/site/content'
import { FoundingSignup } from '@/components/site/founding-signup'

export const metadata: Metadata = {
  title: 'Membership and pricing: the Founding 50',
  description:
    'Citizen Space founding rates: $12 day pass, $74/mo 10-day flex, $124/mo flex desk, $39/mo virtual address. Founding 50: $1,000 once or 3 × $333, lowest rates for life.',
  alternates: { canonical: '/membership' },
}

const HOURLY_COLORS = ['#2E5E63', '#1F2A36', '#4F7A63', '#B08A5E']

export default function MembershipPage() {
  return (
    <>
      <Section
        tone="forest"
        aria-labelledby="m-title"
        innerClassName="flex-row flex-wrap items-center"
      >
        <div className="flex min-w-0 flex-[1.3_1_480px] flex-col gap-5">
          <Eyebrow onDark>Membership · The Founding 50</Eyebrow>
          <H1 id="m-title" onDark>
            $1,000 once. Lowest rates for life.
          </H1>
          <p className="m-0 max-w-[560px] text-[22px] leading-snug text-brand-mist">
            Only 50 spots. Can’t do $1,000 up front? Pay 3 payments of $333, then you’re on founding
            rates for life.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="#join">Claim your founding spot</ButtonLink>
            <ButtonLink href="#rates" variant="outlineLight">
              See the rates
            </ButtonLink>
          </div>
          <p className="m-0 text-sm text-brand-mist">
            Sales open {SITE.foundingSalesOpen} · Doors open {SITE.doorsOpen}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logos/sticker-founding-50.png"
          alt="Founding 50 sticker"
          className="w-full max-w-[320px] flex-[0_1_320px]"
        />
      </Section>

      <Section aria-labelledby="f-what">
        <div className="flex max-w-[720px] flex-col gap-2">
          <Eyebrow>What founding members get</Eyebrow>
          <H2 id="f-what">Join early, move in early.</H2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
          <RuleCard color="#9E5640" title="Lifetime founding rates">
            <p className="m-0 text-[17px] text-brand-muted">
              About half of what other Santa Cruz spaces charge, for as long as you’re a member.
            </p>
          </RuleCard>
          <RuleCard color="#1F3D33" title="Your member NFT key">
            <p className="m-0 text-[17px] text-brand-muted">
              Scan your QR code and you’re in. It’s your membership pass, not an investment, with no
              profit share.
            </p>
          </RuleCard>
          <RuleCard color="#C49A4A" title="Founding perks">
            <p className="m-0 text-[17px] text-brand-muted">
              First pick of events and studio time, and your name on the founding wall.
            </p>
          </RuleCard>
          <RuleCard color="#6F8063" title="Move in in January">
            <p className="m-0 text-[17px] text-brand-muted">
              Pay a first installment in December or January and move in with the charter founders
              while we build out.
            </p>
          </RuleCard>
        </div>
      </Section>

      <Section
        id="rates"
        tone="bone"
        aria-labelledby="rates-h"
        className="scroll-mt-24"
        innerClassName="gap-10"
      >
        <div className="flex max-w-[760px] flex-col gap-2">
          <Eyebrow>Pricing</Eyebrow>
          <H2 id="rates-h">Founding rates vs. standard rates</H2>
          <p className="m-0 text-[17px] text-brand-muted">
            After the Founding 50 sell out, new members pay standard rates.
          </p>
        </div>
        <div className="overflow-x-auto rounded-3xl bg-brand-paper px-7 py-2">
          <table className="w-full min-w-[600px] border-collapse text-[17px]">
            <thead>
              <tr className="text-left text-[13px] uppercase tracking-[2.5px]">
                <th
                  scope="col"
                  className="border-b-2 border-brand-ink pb-3.5 pr-3 pt-5 text-brand-muted"
                >
                  Membership
                </th>
                <th
                  scope="col"
                  className="border-b-2 border-brand-ink px-3 pb-3.5 pt-5 text-brand-brick"
                >
                  Founding rate, for life
                </th>
                <th
                  scope="col"
                  className="border-b-2 border-brand-ink pb-3.5 pl-3 pt-5 text-brand-muted"
                >
                  Typical Santa Cruz price
                </th>
              </tr>
            </thead>
            <tbody>
              {MEMBERSHIP_RATES.map((r, i) => (
                <tr
                  key={r.name}
                  className={
                    i < MEMBERSHIP_RATES.length - 1 ? 'border-b border-brand-hairline' : ''
                  }
                >
                  <th scope="row" className="py-4 pr-3 text-left font-semibold">
                    {r.name}
                  </th>
                  <td className="px-3 py-4 font-display text-[26px] font-semibold">
                    {usd(r.founding)}
                    {r.unit}
                  </td>
                  <td className="py-4 pl-3 text-brand-muted">
                    {usd(r.typical)}
                    {r.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
          {HOURLY_RATES.map((r, i) => (
            <RuleCard
              key={r.name}
              color={HOURLY_COLORS[i] ?? '#1F3D33'}
              title={r.name}
              className="pt-4"
            >
              <p className="m-0 font-display text-[30px] font-semibold">
                {usd(r.founding)}
                {r.unit === '/hr' ? '/hr' : ''}
              </p>
              <p className="m-0 text-[15px] text-brand-muted">
                {r.unit === '/hr' ? `Typical ${usd(r.typical)}.` : 'Per signature.'} {r.note}
              </p>
            </RuleCard>
          ))}
        </div>
        <p className="m-0 text-sm leading-normal text-brand-muted">
          {RATE_SOURCES} The 4 resident desks in the main shared room are held by the charter
          founders at $600 a month.
        </p>
      </Section>

      <Section aria-labelledby="sp" innerClassName="gap-10">
        <div className="flex max-w-[760px] flex-col gap-2">
          <Eyebrow>For local companies</Eyebrow>
          <H2 id="sp">Founding sponsors</H2>
          <p className="m-0 text-[17px] text-brand-muted">
            Sponsor spots are in addition to the Founding 50. Sponsors are seen by everyone who
            comes through: members, Builder Night crowds, workshop guests.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
          {SPONSOR_TIERS.map(t => (
            <RuleCard
              key={t.name}
              color={t.color}
              title={
                <>
                  {t.name}
                  {t.limit && (
                    <span className="text-sm font-semibold text-brand-brick"> · {t.limit}</span>
                  )}
                </>
              }
            >
              <p className="m-0 font-display text-[44px] font-semibold leading-none">
                {usd(t.price)}
              </p>
              <p className="m-0 text-[17px] text-brand-muted">{t.perks}</p>
            </RuleCard>
          ))}
        </div>
        <p className="m-0 text-sm text-brand-muted">
          Rooms on offer: the content studio, the conference room and the main shared room.
        </p>
      </Section>

      <Section id="join" tone="bone" aria-labelledby="how" className="scroll-mt-24">
        <H2 id="how">From founding to opening day</H2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8 p-0">
          {(
            [
              [
                SITE.foundingSalesOpen,
                'Founding 50 go on sale',
                'Pay your first installment now to move in early.',
              ],
              [SITE.keys, 'We get the keys', 'Early members move in while we build out.'],
              [
                SITE.doorsOpen,
                'Opening day',
                'Members move in. Founders get their member NFT key.',
              ],
              ['After 50', 'Standard rates apply', 'Founding spots close for good.'],
            ] as const
          ).map(([when, title, body]) => (
            <li key={title} className="flex flex-col gap-2">
              <Eyebrow>{when}</Eyebrow>
              <h3 className="m-0 text-[22px] font-bold">{title}</h3>
              <p className="m-0 text-[17px] text-brand-muted">{body}</p>
            </li>
          ))}
        </ol>
        <FoundingSignup />
      </Section>
    </>
  )
}
