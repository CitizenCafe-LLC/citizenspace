import { Car, Bus, Bike } from 'lucide-react'
import { Eyebrow, Section, H2 } from './ui'
import { Disclosure } from './disclosure'

/** Parking, bus and bike details for 819 Pacific Ave. Sources: City of Santa Cruz Parking Services, Santa Cruz METRO. */
export function GettingHere() {
  const list = 'm-0 list-disc pl-5 text-base leading-relaxed text-brand-muted'
  return (
    <Section id="getting-here" tone="bone" aria-labelledby="gh" className="scroll-mt-24">
      <div className="flex max-w-[720px] flex-col gap-2">
        <Eyebrow>819 Pacific Ave · Downtown Santa Cruz</Eyebrow>
        <H2 id="gh">Getting here</H2>
      </div>
      <div className="grid grid-cols-1 border-t border-brand-hairline md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] md:gap-x-8 md:gap-y-10 md:border-0">
        <Disclosure
          title="Parking"
          defaultOpen={false}
          icon={<Car aria-hidden className="h-6 w-6 shrink-0" style={{ color: '#9E5640' }} />}
          className="md:border-t-[6px] md:pt-5"
          style={{ borderTopColor: '#9E5640' }}
        >
          <p className="m-0 text-[17px] text-brand-muted">
            No private parking. Use the city’s downtown meters, lots and garages.
          </p>
          <ul className={list}>
            <li>
              Meters run 8am–8pm every day, free on city holidays. Pay with a card, cash or the
              ParkMobile app.
            </li>
            <li>Free lots have a 3-hour limit, Mon–Sat 8am–6pm. No limit on Sundays.</li>
            <li>
              Staying all day: Locust Garage (124 Locust St) or Soquel/Front Garage (601 Front St).
            </li>
            <li>
              Close by: the Cedar/Cathcart lot (610 Cedar St). The South Pacific Ave lot (902
              Pacific Ave) is public on weekends.
            </li>
            <li>Members who work downtown can get a city garage permit, $75 a month.</li>
          </ul>
        </Disclosure>
        <Disclosure
          title="Bus"
          defaultOpen={false}
          icon={<Bus aria-hidden className="h-6 w-6 shrink-0" style={{ color: '#1F3D33' }} />}
          className="md:border-t-[6px] md:pt-5"
          style={{ borderTopColor: '#1F3D33' }}
        >
          <p className="m-0 text-[17px] text-brand-muted">
            Santa Cruz METRO runs countywide routes plus the Highway 17 Express to San Jose.
          </p>
          <ul className={list}>
            <li>
              While Pacific Station (920 Pacific Ave) is rebuilt, buses stop at the River Front
              Transit Center: curbside on Front St, Soquel Ave and River St.
            </li>
            <li>That’s a short walk up Pacific to our door.</li>
            <li>
              Plan a trip at{' '}
              <a href="https://scmtd.com" className="text-brand-brick">
                scmtd.com
              </a>
              .
            </li>
          </ul>
        </Disclosure>
        <Disclosure
          title="Bike"
          defaultOpen={true}
          icon={<Bike aria-hidden className="h-6 w-6 shrink-0" style={{ color: '#6F8063' }} />}
          className="md:border-t-[6px] md:pt-5"
          style={{ borderTopColor: '#6F8063' }}
        >
          <p className="m-0 text-[17px] text-brand-muted">
            There’s no bike storage inside the suite, so lock up outside.
          </p>
          <ul className={list}>
            <li>Racks line Pacific Ave and the side streets downtown.</li>
            <li>
              Smart bike lockers sit in downtown garages and lots. Rent by the hour with a BikeLink
              card or a Santa Cruz ParkCard. Find them at{' '}
              <a href="https://www.bikelink.org/map" className="text-brand-brick">
                bikelink.org/map
              </a>
              .
            </li>
            <li>
              Downtown workers can get free bike locker and bike share credits through GO Santa
              Cruz.
            </li>
          </ul>
        </Disclosure>
      </div>
    </Section>
  )
}
