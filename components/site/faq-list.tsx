'use client'

import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import type { FaqGroup } from '@/lib/site/content'

/**
 * The FAQ as tap-to-open answers with a search box. Everything renders on the server
 * too, so crawlers and answer engines see every question (the FAQPage JSON-LD is in the page).
 * Phones get topic chips that stick under the top bar; desktops keep the side list.
 */
export function FaqList({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = useMemo(
    () =>
      groups
        .map(g => ({
          ...g,
          items: q
            ? g.items.filter(i => `${i.question} ${i.answer}`.toLowerCase().includes(q))
            : g.items,
        }))
        .filter(g => g.items.length > 0),
    [groups, q]
  )
  const count = shown.reduce((n, g) => n + g.items.length, 0)
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className="flex flex-row flex-wrap items-start gap-5 md:gap-12">
      <div className="flex w-full flex-col gap-3">
        <label className="flex min-h-[52px] items-center gap-3 rounded-xl bg-brand-bone px-4 md:max-w-[560px]">
          <Search aria-hidden className="h-5 w-5 text-brand-muted" />
          <span className="sr-only">Search questions</span>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${total} questions`}
            className="min-h-[44px] flex-1 border-0 bg-transparent text-[17px] text-brand-ink outline-none placeholder:text-brand-muted"
          />
        </label>
        {q && (
          <p role="status" className="m-0 text-[15px] text-brand-muted">
            {count === 0
              ? `No questions match “${query.trim()}”. Try another word, or ask us.`
              : `${count} of ${total} questions`}
          </p>
        )}
      </div>

      <nav
        aria-label="FAQ topics"
        className="scrollbar-none sticky top-14 z-20 -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto bg-brand-paper px-4 py-2.5 sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 md:static md:mx-0 md:w-auto md:min-w-0 md:flex-[1_1_220px] md:flex-col md:gap-1 md:overflow-visible md:p-0 lg:sticky lg:top-28"
      >
        <p className="m-0 mb-2 hidden text-[13px] font-bold uppercase tracking-[2.5px] text-brand-muted md:block">
          Topics
        </p>
        {shown.map(g => (
          <a
            key={g.id}
            href={`#${g.id}`}
            className="flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-full border border-brand-hairline bg-white px-4 text-[15px] font-semibold text-brand-ink no-underline md:min-h-[44px] md:whitespace-normal md:rounded-none md:border-0 md:border-l-[6px] md:bg-transparent md:pl-3 md:text-base"
            style={{ borderLeftColor: g.color }}
          >
            {g.title}
          </a>
        ))}
      </nav>

      <div className="flex min-w-0 flex-[999_1_640px] flex-col gap-10 md:gap-14">
        {shown.map(g => (
          <section key={g.id} id={g.id} className="flex scroll-mt-32 flex-col gap-1">
            <h2
              className="m-0 mb-3 border-t-[6px] pt-4 font-display text-[26px] font-semibold leading-tight md:text-[30px]"
              style={{ borderTopColor: g.color }}
            >
              {g.title}
            </h2>
            {g.items.map(qa => (
              <details key={qa.question} className="group border-b border-brand-hairline">
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-[17px] font-bold md:text-[19px] [&::-webkit-details-marker]:hidden">
                  {qa.question}
                  <Plus
                    aria-hidden
                    className="h-6 w-6 shrink-0 text-brand-brick transition-transform group-open:rotate-45"
                  />
                </summary>
                <p className="m-0 mb-5 max-w-[760px] text-[17px] leading-relaxed text-brand-muted">
                  {qa.answer}
                </p>
              </details>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
