'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConnectWallet } from '@/components/site/connect-wallet'
import { BottomSheet } from '@/components/site/bottom-sheet'

export const NAV_LINKS = [
  { href: '/cafe', label: 'Cafe', note: 'Zachary’s member menu' },
  { href: '/workspaces', label: 'Workspaces', note: 'Desks, rooms and the studio' },
  { href: '/membership', label: 'Membership', note: 'The Founding 50 and prices' },
  { href: '/events', label: 'Events', note: 'Builder Night, classes, tours' },
  { href: '/gallery', label: 'Gallery', note: 'Photos of 819 Pacific' },
  { href: '/blog', label: 'Blog', note: 'Notes from the build-out' },
  { href: '/location', label: 'Location', note: '819 Pacific Ave' },
  { href: '/contact', label: 'Contact', note: 'Tours, questions, getting here' },
]

const SHEET_LINKS = [
  ...NAV_LINKS,
  { href: '/faq', label: 'FAQ', note: 'Answers about Citizen Space' },
]

export function Navigation() {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-brand-hairline bg-brand-paper/95 backdrop-blur">
      <div className="mx-auto flex min-h-[56px] max-w-[1280px] items-center justify-between gap-3 pl-4 pr-2 sm:px-8 md:min-h-[80px] md:gap-6">
        <Link href="/" aria-label="Citizen Space home" className="flex min-h-[44px] items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logos/logo-primary.png"
            alt="Citizen Space · Santa Cruz Builder Lab"
            className="h-8 w-auto md:h-12"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-[44px] items-center border-b-2 px-3 text-[15px] font-semibold no-underline',
                isActive(l.href)
                  ? 'border-brand-brick text-brand-brick'
                  : 'border-transparent text-brand-ink hover:text-brand-brick'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <ConnectWallet className="px-3 text-sm md:px-4 md:text-[15px]" />
          <Link
            href="/membership"
            className="hidden min-h-[44px] items-center whitespace-nowrap rounded-xl bg-brand-brick px-5 text-[15px] font-bold text-brand-bone no-underline hover:bg-[#87493A] md:inline-flex"
          >
            Founding 50
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-brand-ink lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      <BottomSheet
        open={open}
        label="Site menu"
        onClose={close}
        header={
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/brand/logos/logo-primary.png" alt="Citizen Space" className="h-7 w-auto" />
        }
      >
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="overflow-hidden rounded-2xl border border-brand-hairline bg-white"
        >
          {SHEET_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={cn(
                'flex min-h-[60px] items-center gap-3 px-4 py-2 no-underline',
                i > 0 && 'border-t border-[#EDE6DA]',
                isActive(l.href) ? 'text-brand-brick' : 'text-brand-ink'
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[17px] font-semibold">{l.label}</span>
                <span className="text-sm text-brand-muted">{l.note}</span>
              </span>
              <ChevronRight aria-hidden className="h-5 w-5 text-brand-muted" />
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2.5 py-4">
          <Link
            href="/membership"
            onClick={close}
            className="flex min-h-[52px] items-center justify-center rounded-xl bg-brand-brick text-[17px] font-bold text-brand-bone no-underline"
          >
            Join the Founding 50
          </Link>
          <ConnectWallet className="min-h-[52px] w-full text-[17px]" onOpen={close} />
          <p className="m-0 text-center text-sm text-brand-muted">
            Connect a crypto wallet to buy the member NFT key.
          </p>
        </div>
      </BottomSheet>
    </header>
  )
}
