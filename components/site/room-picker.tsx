'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Zone } from '@/lib/site/content'

export function RoomPicker({ zones, initial = 'conference' }: { zones: Zone[]; initial?: string }) {
  const [picked, setPicked] = useState(initial)
  const sel = (zones.find(z => z.id === picked) ?? zones[0])!

  return (
    <div className="flex flex-wrap items-start gap-8">
      <div className="flex min-w-0 flex-[1.5_1_560px] flex-col gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/renderings/cutaway-v7.jpg"
          alt="Furnished cutaway of 819 Pacific Ave showing every room, color-coded"
          className="w-full rounded-3xl bg-brand-bone object-cover"
          style={{ aspectRatio: '16 / 9' }}
        />
        <div role="group" aria-label="Rooms" className="flex flex-wrap gap-2">
          {zones.map(z => (
            <button
              key={z.id}
              type="button"
              aria-pressed={z.id === sel.id}
              onClick={() => setPicked(z.id)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 px-3.5 text-[15px] font-semibold text-brand-ink"
              style={{
                borderColor: z.id === sel.id ? '#1E2422' : '#D8CFC2',
                background: z.id === sel.id ? '#F0EAE0' : '#FAF7F1',
              }}
            >
              <span aria-hidden className="h-3 w-3 rounded-[5px]" style={{ background: z.color }} />
              {z.name}
            </button>
          ))}
        </div>
      </div>
      <article
        aria-live="polite"
        className="flex min-w-0 flex-[1_1_380px] flex-col gap-4 rounded-3xl bg-brand-bone p-7"
      >
        <div className="h-1.5 rounded-full" style={{ background: sel.color }} />
        <p className="m-0 text-[13px] font-bold uppercase tracking-[2.5px] text-brand-brick">
          {sel.meta}
        </p>
        <h2 className="m-0 font-display text-[30px] font-semibold leading-tight">{sel.name}</h2>
        <p className="m-0 text-[17px] leading-normal text-brand-muted">{sel.summary}</p>
        <figure className="m-0 flex flex-col gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sel.photo}
            alt={sel.photoAlt}
            className="w-full rounded-3xl object-cover"
            style={{ aspectRatio: '4 / 3' }}
          />
          <figcaption className="text-sm text-brand-muted">Today, before the build-out.</figcaption>
        </figure>
        {sel.plan && (
          <figure className="m-0 flex flex-col gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sel.plan}
              alt={`${sel.name} plan with the planned changes pinned`}
              className="w-full rounded-3xl bg-brand-paper object-cover"
              style={{ aspectRatio: '16 / 9' }}
            />
            <figcaption className="text-sm text-brand-muted">The plan for this room.</figcaption>
          </figure>
        )}
        <Link
          href={sel.href}
          className="inline-flex min-h-[48px] items-center self-start rounded-xl bg-brand-forest px-6 font-bold text-brand-bone no-underline"
        >
          {sel.cta}
        </Link>
      </article>
    </div>
  )
}
