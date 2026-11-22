import type { Metadata } from 'next'
import { Eyebrow, Section, H1, H2, Lead, ButtonLink, Photo } from '@/components/site/ui'

export const metadata: Metadata = {
  title: 'Events: Builder Night, Colearn classes and tours',
  description:
    'Builder Night every Monday, Colearn classes taught by members, and tours of 819 Pacific Ave before Citizen Space opens in March 2027.',
  alternates: { canonical: '/events' },
}

const EVENTS = [
  {
    month: 'Dec',
    day: '1',
    title: 'Founding sales open',
    body: 'The Founding 50 go on sale. $1,000 once, lowest rates for life.',
    href: '/membership',
    cta: 'Get on the list',
    primary: true,
  },
  {
    month: 'Every',
    day: 'Mon',
    title: 'Builder Night',
    body: 'Demos and building together. At Pleasure Pizza on Pacific Ave until our doors open.',
    href: '/contact',
    cta: 'Come by',
  },
  {
    month: 'Jan 2027',
    day: '1',
    title: 'Keys and early move-in',
    body: 'Pay a first installment in December or January and move in with the charter founders while we build out.',
    href: '/membership#join',
    cta: 'How it works',
  },
  {
    month: '2027',
    day: 'March',
    title: 'Opening day',
    body: 'Members move in. Founders get their member NFT key.',
    href: '/membership',
    cta: 'Join the Founding 50',
  },
  {
    month: 'Ongoing',
    day: 'By appt.',
    title: 'Tour 819 Pacific Ave',
    body: 'See the brick, the skylights and the fireplace before the build-out.',
    href: '/contact',
    cta: 'Book a tour',
  },
]

export default function EventsPage() {
  return (
    <>
      <Section innerClassName="flex-row flex-wrap items-center pb-16 md:pb-16">
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-4">
          <Eyebrow>Events</Eyebrow>
          <H1>Builder Night, classes and tours.</H1>
          <Lead>
            Most events start when doors open in March 2027. Here’s what’s on before then.
          </Lead>
        </div>
        <div className="min-w-0 flex-[1_1_480px]">
          <Photo
            src="/brand/photos/06-hallway-lounge.jpg"
            alt="Hallway lounge with the wood-plank wall where event posters will hang"
            priority
          />
        </div>
      </Section>

      <Section tone="bone" aria-labelledby="upcoming" innerClassName="gap-8">
        <H2 id="upcoming">Coming up</H2>
        <ul className="m-0 list-none p-0">
          {EVENTS.map((e, i) => (
            <li
              key={e.title}
              className={`flex items-start gap-4 border-t border-brand-hairline py-6 md:items-center md:gap-8 md:py-7 ${i === EVENTS.length - 1 ? 'border-b' : ''}`}
            >
              <div className="w-[76px] shrink-0 rounded-2xl bg-brand-paper px-1 py-2.5 text-center md:w-[120px] md:bg-transparent md:p-0 md:text-left">
                <Eyebrow className="text-[11px] tracking-[1.5px] md:text-[13px] md:tracking-[2.5px]">
                  {e.month}
                </Eyebrow>
                <p className="m-0 font-display text-[22px] font-semibold leading-tight md:text-[44px] md:leading-none">
                  {e.day}
                </p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-8">
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 mb-1.5 text-[19px] font-bold md:text-[22px]">{e.title}</h3>
                  <p className="m-0 text-base text-brand-muted md:text-[17px]">{e.body}</p>
                </div>
                <ButtonLink
                  href={e.href}
                  variant={e.primary ? 'brick' : 'outlineDark'}
                  className="min-h-[44px] self-start px-4 text-[15px] md:min-h-[48px] md:self-auto md:px-6 md:text-base"
                >
                  {e.cta}
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        tone="forest"
        aria-labelledby="host"
        innerClassName="flex-row flex-wrap items-center"
      >
        <div className="min-w-0 flex-[1_1_440px]">
          <Photo
            src="/brand/photos/12-conference-room.jpg"
            alt="Conference room with fireplace, a good room for small events"
          />
        </div>
        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
          <Eyebrow onDark>Colearn classes</Eyebrow>
          <H2 id="host" onDark>
            Members teach members.
          </H2>
          <p className="m-0 text-[17px] text-brand-mist">
            Got something to teach? Pitch a class or a talk for the fireplace room or the drop-in
            area.
          </p>
          <ButtonLink href="/contact" className="sm:self-start">
            Propose an event
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
