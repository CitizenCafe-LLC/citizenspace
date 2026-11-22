import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow, Section, H1, H2, Lead, Photo } from '@/components/site/ui'
import { getArticles, CATEGORIES, formatDate } from '@/lib/strapi/articles'
import { NewsletterForm } from '@/components/site/newsletter-form'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Blog: building 819 Pacific, in public',
  description:
    'Builder profiles, Builder Night recaps and every step of Citizen Space’s move into 819 Pacific Ave, Santa Cruz.',
  alternates: { canonical: '/blog' },
}

export const revalidate = 300

const SERIES = [
  ['Part 1 · Dec 2026', 'Founding sales open', '#9E5640'],
  ['Part 2 · Jan 2027', 'We get the keys', '#1F3D33'],
  ['Part 3 · Feb 2027', 'Paint, light and the studio', '#6F8063'],
  ['Part 4 · Mar 2027', 'Opening day', '#B08A5E'],
]

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const category = CATEGORIES.some(c => c.slug === searchParams.category)
    ? searchParams.category
    : undefined
  const page = Math.max(1, Number(searchParams.page) || 1)
  const { articles, pageCount } = await getArticles({ category, page, pageSize: 12 })
  const featured = !category && page === 1 ? articles.find(a => a.featured) : undefined
  const list = featured ? articles.filter(a => a !== featured) : articles
  const href = (p: { category?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (p.category) {
      q.set('category', p.category)
    }
    if (p.page && p.page > 1) {
      q.set('page', String(p.page))
    }
    const s = q.toString()
    return s ? `/blog?${s}` : '/blog'
  }

  return (
    <>
      <Section innerClassName="flex-row flex-wrap items-end justify-between gap-8 pb-10 md:pb-10">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-4">
          <Eyebrow>Stories from the space</Eyebrow>
          <H1 className="max-w-[860px]">Building 819 Pacific, in public.</H1>
          <Lead>
            Builder profiles, Builder Night recaps, and every step of the move into our permanent
            home.
          </Lead>
        </div>
      </Section>

      <section aria-label="Categories" className="bg-brand-paper">
        <div className="mx-auto flex max-w-[1280px] flex-wrap gap-2 px-4 pb-10 sm:px-8">
          {[{ name: 'All posts', slug: undefined, color: '#1E2422' }, ...CATEGORIES].map(c => {
            const active = c.slug === category
            return (
              <Link
                key={c.name}
                href={href({ category: c.slug })}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 px-4 text-[15px] font-semibold no-underline',
                  active
                    ? 'border-brand-forest bg-brand-forest text-brand-bone'
                    : 'border-brand-hairline bg-brand-paper text-brand-ink'
                )}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: c.color }}
                />
                {c.name}
              </Link>
            )
          })}
        </div>
      </section>

      {featured && (
        <section aria-label="Featured post" className="bg-brand-paper">
          <div className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-8">
            <Link
              href={`/blog/${featured.slug}`}
              className="flex flex-wrap items-center gap-10 rounded-3xl bg-brand-bone p-6 text-brand-ink no-underline"
            >
              <div className="min-w-0 flex-[1.4_1_520px]">
                <Photo src={featured.cover.src} alt={featured.cover.alt} ratio="16 / 9" priority />
              </div>
              <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-3.5 py-2 pr-2">
                <Eyebrow>
                  Featured ·{' '}
                  <span style={{ color: featured.category.color }}>{featured.category.name}</span>
                </Eyebrow>
                <h2 className="m-0 font-display text-[36px] font-semibold leading-[1.08] md:text-[44px]">
                  {featured.title}
                </h2>
                <p className="m-0 text-[17px] text-brand-muted">{featured.excerpt}</p>
                <p className="m-0 text-[15px] text-brand-muted">
                  <strong className="text-brand-ink">{featured.author.name}</strong> ·{' '}
                  {formatDate(featured.publishedAt)} · {featured.readingTime} min read
                </p>
                <span className="font-bold text-brand-brick">Read the story →</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <Section aria-labelledby="latest" innerClassName="gap-8 pt-0 md:pt-0">
        <H2 id="latest" className="md:text-[30px]">
          {category ? CATEGORIES.find(c => c.slug === category)!.name : 'Latest posts'}
        </H2>
        {list.length === 0 ? (
          <p className="m-0 text-[17px] text-brand-muted">
            No posts here yet. Check back soon, or subscribe below.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-x-7 gap-y-12">
            {list.map(a => (
              <article key={a.slug} className="flex flex-col gap-3.5">
                <Link href={`/blog/${a.slug}`} className="block">
                  <Photo src={a.cover.src} alt={a.cover.alt} ratio="3 / 2" />
                </Link>
                <div
                  className="flex flex-col gap-2 border-t-[6px] pt-3.5"
                  style={{ borderTopColor: a.category.color }}
                >
                  <Eyebrow>{a.category.name}</Eyebrow>
                  <h3 className="m-0 text-[22px] font-bold leading-tight">
                    <Link
                      href={`/blog/${a.slug}`}
                      className="text-brand-ink no-underline hover:text-brand-brick"
                    >
                      {a.title}
                    </Link>
                  </h3>
                  <p className="m-0 text-base text-brand-muted">{a.excerpt}</p>
                  <p className="m-0 mt-1 text-sm text-brand-muted">
                    {formatDate(a.publishedAt)} · {a.readingTime} min read
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
        {pageCount > 1 && (
          <nav aria-label="Pagination" className="flex justify-center gap-2 pt-4">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={href({ category, page: p })}
                aria-current={p === page ? 'page' : undefined}
                className={cn(
                  'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl font-bold no-underline',
                  p === page
                    ? 'bg-brand-forest text-brand-bone'
                    : 'border border-brand-hairline text-brand-ink'
                )}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </Section>

      <Section tone="bone" aria-labelledby="series" innerClassName="gap-8">
        <div className="flex max-w-[720px] flex-col gap-2">
          <Eyebrow>A series · Building 819 Pacific</Eyebrow>
          <H2 id="series">From keys to opening day</H2>
          <p className="m-0 text-[17px] text-brand-muted">
            One post per milestone, December through March.
          </p>
        </div>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 p-0">
          {SERIES.map(([when, title, color]) => (
            <li key={title} className="border-t-[6px] pt-3.5" style={{ borderTopColor: color }}>
              <p className="m-0 text-[13px] font-bold uppercase tracking-[2.5px] text-brand-muted">
                {when}
              </p>
              <p className="m-0 mt-1.5 text-[19px] font-bold">{title}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        tone="forest"
        aria-labelledby="nl"
        innerClassName="flex-row flex-wrap items-end justify-between gap-8 py-20 md:py-20"
      >
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-2">
          <H2 id="nl" onDark>
            Get new posts by email.
          </H2>
          <p className="m-0 text-[17px] text-brand-mist">
            Founding sales, Builder Night and the move. About once a month.
          </p>
        </div>
        <NewsletterForm />
      </Section>
    </>
  )
}
