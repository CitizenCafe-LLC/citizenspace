'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Coffee, CalendarDays, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

export const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/workspaces', label: 'Spaces', icon: LayoutGrid },
  { href: '/cafe', label: 'Cafe', icon: Coffee },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/membership', label: 'Join', icon: UserRound },
] as const

/** Phone-only bottom tab bar (React Navigation's bottom tabs, on the web). Hidden from `md` up. */
export function MobileTabBar() {
  const pathname = usePathname() ?? '/'
  const current = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-brand-hairline bg-brand-paper/95 px-1 pb-[calc(env(safe-area-inset-bottom)+4px)] pt-1.5 backdrop-blur md:hidden"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const on = current(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex min-h-[50px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold no-underline',
              on ? 'text-brand-brick' : 'text-brand-muted'
            )}
          >
            <Icon aria-hidden className="h-6 w-6" strokeWidth={on ? 2.2 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Space the tab bar takes at the bottom of a phone screen, for padding and sticky offsets. */
export const TAB_BAR_SPACE = 'calc(env(safe-area-inset-bottom) + 62px)'
