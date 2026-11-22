'use client'

import { useState } from 'react'

/** Posts to the existing /api/newsletter route. */
export function NewsletterForm() {
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle')
  return (
    <form
      aria-label="Newsletter signup"
      className="flex min-w-0 flex-[1_1_420px] flex-wrap items-end gap-3"
      onSubmit={async e => {
        e.preventDefault()
        const email = new FormData(e.currentTarget).get('email')
        try {
          const res = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
          setState(res.ok ? 'sent' : 'error')
        } catch {
          setState('error')
        }
      }}
    >
      <label className="flex min-w-0 flex-[1_1_240px] flex-col gap-1.5 text-sm font-bold text-brand-bone">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-[48px] rounded-xl border-0 bg-brand-bone px-3.5 text-[17px] font-normal text-brand-ink"
        />
      </label>
      <button
        type="submit"
        className="min-h-[48px] rounded-xl bg-brand-brick px-6 text-base font-bold text-brand-bone"
      >
        Subscribe
      </button>
      {state === 'sent' && (
        <p role="status" className="m-0 w-full text-brand-mist">
          You’re in. See you in your inbox.
        </p>
      )}
      {state === 'error' && (
        <p role="alert" className="m-0 w-full text-brand-peach">
          That didn’t go through. Try again in a minute.
        </p>
      )}
    </form>
  )
}
