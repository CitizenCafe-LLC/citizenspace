'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Native-style bottom sheet (iOS sheet / @gorhom/bottom-sheet on React Native).
 * Modal: focus moves in, Escape or the backdrop closes it, Tab stays inside,
 * and the page behind does not scroll. Rendered into <body> through a portal, because a
 * parent with backdrop-filter (the sticky header) would otherwise trap position: fixed.
 */
export function BottomSheet({
  open,
  label,
  onClose,
  children,
  header,
  className,
}: {
  open: boolean
  label: string
  onClose: () => void
  children: React.ReactNode
  header?: React.ReactNode
  className?: string
}) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const before = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('button, a, input, select, textarea')?.focus()
    return () => {
      document.body.style.overflow = overflow
      before?.focus?.()
    }
  }, [open])

  if (!open || typeof document === 'undefined') {
    return null
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panel.current) {
      return
    }
    const items = panel.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input, select, textarea'
    )
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      <div aria-hidden className="absolute inset-0 bg-brand-ink/50" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col rounded-t-[20px] bg-brand-paper pb-[calc(env(safe-area-inset-bottom)+16px)] text-brand-ink shadow-2xl',
          'md:max-w-[480px] md:rounded-[20px] md:pb-4',
          className
        )}
      >
        <div
          aria-hidden
          className="mx-auto mt-2 h-[5px] w-10 rounded-full bg-[#CFC5B6] md:hidden"
        />
        <div className="flex items-center justify-between gap-2 py-1 pl-5 pr-2">
          {header ?? <h2 className="m-0 font-display text-[26px] font-semibold">{label}</h2>}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-brand-ink"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
