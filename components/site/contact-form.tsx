'use client'

import { useState } from 'react'

const field =
  'min-h-[48px] rounded-xl border border-brand-hairline bg-brand-paper px-3.5 text-[17px] font-normal'
const TOPICS = [
  'Founding 50',
  'Book a tour',
  'Studio or conference room',
  'Host an event',
  'Sponsorship',
  'Something else',
]

/** Posts to /api/contact (existing route) and shows a success state instead of the old browser alert. */
export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  return (
    <form
      aria-label="Send a message"
      className="grid min-w-0 flex-[1.6_1_520px] grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 rounded-3xl bg-brand-bone p-8"
      onSubmit={async e => {
        e.preventDefault()
        setState('sending')
        const data = Object.fromEntries(new FormData(e.currentTarget))
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          setState(res.ok ? 'sent' : 'error')
        } catch {
          setState('error')
        }
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Name
        <input name="name" type="text" autoComplete="name" required className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Email
        <input name="email" type="email" autoComplete="email" required className={field} />
      </label>
      <label className="col-span-full flex flex-col gap-1.5 text-sm font-bold">
        What’s it about?
        <select name="topic" className={field}>
          {TOPICS.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="col-span-full flex flex-col gap-1.5 text-sm font-bold">
        Message
        <textarea name="message" rows={6} required className={`${field} py-3`} />
      </label>
      <div className="col-span-full flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === 'sending'}
          className="min-h-[48px] rounded-xl bg-brand-brick px-7 font-bold text-brand-bone disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        {state === 'sent' && (
          <p role="status" className="m-0 text-brand-forest">
            Thanks. Toby will get back to you soon.
          </p>
        )}
        {state === 'error' && (
          <p role="alert" className="m-0 text-brand-brick">
            That didn’t send. Try again, or catch us at Builder Night on Monday.
          </p>
        )}
      </div>
    </form>
  )
}
