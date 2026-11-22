'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Tap-to-open section on phones; always open from `md` up, where there is room
 * to show everything. Native equivalent: Pressable + LayoutAnimation.
 */
export function Disclosure({
  title,
  icon,
  children,
  defaultOpen = false,
  className,
  style,
}: {
  title: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className={cn('border-b border-brand-hairline md:border-b-0', className)} style={style}>
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(o => !o)}
          className="flex min-h-[56px] w-full items-center gap-3 text-left text-[19px] font-bold text-brand-ink md:pointer-events-none md:min-h-0 md:text-[22px]"
        >
          {icon}
          <span className="flex-1">{title}</span>
          <ChevronDown
            aria-hidden
            className={cn(
              'h-5 w-5 text-brand-brick transition-transform md:hidden',
              open && 'rotate-180'
            )}
          />
        </button>
      </h3>
      <div id={id} className={cn('pb-5 md:block md:pb-0 md:pt-2', open ? 'block' : 'hidden')}>
        {children}
      </div>
    </div>
  )
}
