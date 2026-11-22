'use client'

import { useState } from 'react'
import { Share } from 'lucide-react'

/** Opens the phone’s native share sheet (Web Share API); falls back to copying the link. */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }
      await navigator.clipboard?.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // The person closed the share sheet; nothing to do.
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? 'Link copied' : 'Share this post'}
      className="ml-auto flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-xl px-2 text-[15px] font-bold text-brand-forest"
    >
      <Share aria-hidden className="h-5 w-5" />
      <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
    </button>
  )
}
