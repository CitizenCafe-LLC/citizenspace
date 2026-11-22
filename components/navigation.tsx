'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const NAV_LINKS = [
  { href: '/cafe', label: 'Cafe' },
  { href: '/workspaces', label: 'Workspaces' },
  { href: '/membership', label: 'Membership' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/location', label: 'Location' },
  { href: '/contact', label: 'Contact' },
]

export function Navigation() {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b border-brand-hairline bg-brand-paper/95 backdrop-blur">
      <div className="mx-auto flex min-h-[80px] max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-8">
        <Link href="/" aria-label="Citizen Space home" className="flex min-h-[44px] items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logos/logo-primary.png"
            alt="Citizen Space · Santa Cruz Builder Lab"
            className="h-10 w-auto md:h-12"
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

        <div className="flex items-center gap-2">
          <Link
            href="/membership"
            className="hidden min-h-[44px] items-center rounded-xl bg-brand-brick px-5 text-[15px] font-bold text-brand-bone no-underline hover:bg-[#87493A] sm:inline-flex"
          >
            Join the Founding 50
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-brand-ink lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-brand-hairline bg-brand-paper px-4 pb-4 lg:hidden"
        >
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={cn(
                'flex min-h-[48px] items-center text-lg font-semibold no-underline',
                isActive(l.href) ? 'text-brand-brick' : 'text-brand-ink'
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/membership"
            onClick={() => setOpen(false)}
            className="mt-2 flex min-h-[48px] items-center justify-center rounded-xl bg-brand-brick font-bold text-brand-bone no-underline"
          >
            Join the Founding 50
          </Link>
        </nav>
      )}
    </header>
  )
}
