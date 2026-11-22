'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Phone-only action bar pinned above the tab bar. It steps aside once the section
 * it points to (`hideWhenVisible`, e.g. "#join") scrolls into view.
 */
export function StickyCta({
  href,
  label,
  hideWhenVisible,
}: {
  href: string
  label: string
  hideWhenVisible?: string
}) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!hideWhenVisible || typeof IntersectionObserver === 'undefined') {
      return
    }
    const el = document.querySelector(hideWhenVisible)
    if (!el) {
      return
    }
    const io = new IntersectionObserver(([entry]) => setHidden(!!entry?.isIntersecting), {
      threshold: 0.05,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [hideWhenVisible])

  if (hidden) {
    return null
  }
  return (
    <div
      className="fixed inset-x-0 z-30 bg-gradient-to-t from-brand-paper via-brand-paper/90 to-transparent px-4 pb-2 pt-4 md:hidden"
      style={{ bottom: 'var(--tabbar-space)' }}
    >
      <Link
        href={href}
        className="flex min-h-[52px] items-center justify-center rounded-xl bg-brand-brick text-[17px] font-bold text-brand-bone no-underline shadow-[0_6px_18px_rgba(30,36,34,0.2)]"
      >
        {label}
      </Link>
    </div>
  )
}
