import Link from 'next/link'
import { SITE } from '@/lib/site/content'

const COLUMNS = [
  {
    title: 'Spaces',
    links: [
      ['/workspaces#desks', 'Desks'],
      ['/workspaces#conference', 'Conference room'],
      ['/workspaces#studio', 'Content studio'],
      ['/membership', 'Membership'],
    ],
  },
  {
    title: 'Community',
    links: [
      ['/events', 'Events'],
      ['/cafe', 'Cafe menu'],
      ['/blog', 'Blog'],
      ['/gallery', 'Gallery'],
    ],
  },
  {
    title: 'Visit',
    links: [
      ['/location', 'Location'],
      ['/contact', 'Contact'],
      ['/about', 'About'],
      ['/faq', 'FAQ'],
    ],
  },
] as const

const eyebrow = 'm-0 text-[13px] font-bold uppercase tracking-[2.5px] text-brand-peach'

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-forest text-brand-bone">
      <div
        className="mx-auto flex max-w-[1280px] flex-col gap-10 px-5 pt-12 sm:px-8 md:gap-12 md:pt-16"
        style={{ paddingBottom: 'calc(var(--tabbar-space) + 2.5rem)' }}
      >
        <div className="flex flex-wrap justify-between gap-12">
          <div className="flex min-w-0 max-w-[400px] flex-[1_1_320px] flex-col gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logos/logo-on-dark.png"
              alt="Citizen Space · Santa Cruz Builder Lab"
              className="h-14 w-auto self-start"
            />
            <p className="m-0 text-[17px] leading-normal text-brand-mist">
              Where Santa Cruz builders work side by side, run the place together, and ship.
            </p>
            <p className={eyebrow}>819 Pacific Ave · Santa Cruz</p>
            <p className="m-0 text-sm text-brand-mist">
              Founding sales open {SITE.foundingSalesOpen} · Doors open {SITE.doorsOpen}
            </p>
            <div className="flex flex-col gap-1.5 border-t-[6px] border-brand-oak pt-3">
              <p className={eyebrow}>A public benefit corporation</p>
              <p className="m-0 text-sm leading-normal text-brand-mist">
                Our public benefit:{' '}
                {SITE.publicBenefit.charAt(0).toLowerCase() + SITE.publicBenefit.slice(1)}
              </p>
            </div>
          </div>
          <nav
            aria-label="Footer"
            className="grid min-w-0 flex-[2_1_560px] grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] sm:gap-8"
          >
            {COLUMNS.map(col => (
              <div key={col.title} className="flex flex-col gap-1">
                <p className={`${eyebrow} mb-2`}>{col.title}</p>
                {col.links.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex min-h-[44px] items-center text-brand-bone no-underline hover:underline md:min-h-[32px]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-[#2E5A4B] pt-6 text-sm text-brand-mist">
          <p className="m-0">© 2026 {SITE.legalName} · a public benefit corporation</p>
          <p className="m-0 flex gap-5">
            <Link href="/legal/terms" className="text-brand-mist">
              Terms
            </Link>
            <Link href="/legal/privacy" className="text-brand-mist">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
