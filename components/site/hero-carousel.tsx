'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = { src: string; title: string; line: string; alt: string }

export function HeroCarousel({
  slides,
  intervalMs = 5000,
}: {
  slides: Slide[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = slides.length
  const go = (i: number) => setIndex(((i % n) + n) % n)

  useEffect(() => {
    if (paused || n < 2) {
      return
    }
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      return
    }
    const t = setInterval(() => setIndex(i => (i + 1) % n), intervalMs)
    return () => clearInterval(t)
  }, [paused, n, intervalMs])

  const current = slides[index]!

  return (
    <div
      className="flex flex-col gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Photos of 819 Pacific Ave"
        className="relative overflow-hidden rounded-3xl bg-[#2A4A3F]"
        style={{ aspectRatio: '4 / 3' }}
      >
        {slides.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            aria-hidden={i !== index}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3">
          <p
            aria-live="polite"
            className="m-0 max-w-[420px] rounded-xl bg-brand-bone px-3.5 py-2.5 text-sm leading-snug text-brand-ink"
          >
            <strong className="font-bold">{current.title}</strong>
            <br />
            {current.line}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(index - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bone text-brand-forest"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(index + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bone text-brand-forest"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5" aria-label="Choose a photo">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show ${s.title}`}
            aria-pressed={i === index}
            onClick={() => go(i)}
            className="flex h-11 min-w-[44px] flex-1 items-center"
          >
            <span
              className="block h-1.5 w-full rounded-full"
              style={{ background: i === index ? '#E7B49B' : 'rgba(240,234,224,0.35)' }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
