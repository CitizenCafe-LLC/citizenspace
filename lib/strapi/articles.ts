/**
 * Strapi 5 client for the blog.
 *
 * Content types (see docs/STRAPI_BLOG.md):
 *   article  { title, slug, excerpt, cover, category, author, tags, series, featured, readingTime, blocks, seo }
 *   category { name, slug, description, color }
 *   author   { name, slug, role, avatar, bio }
 *
 * Set STRAPI_URL (and STRAPI_TOKEN for drafts or private APIs). Without STRAPI_URL the
 * site renders SAMPLE_ARTICLES so the blog works before the CMS is live.
 */

export type ArticleBlock =
  | { __component: 'shared.rich-text'; body: string }
  | { __component: 'shared.media'; file: { src: string; alt: string }; caption?: string }
  | {
      __component: 'shared.media-compare'
      before: { src: string; alt: string }
      after: { src: string; alt: string }
      caption?: string
    }
  | { __component: 'shared.quote'; body: string; author?: string }
  | { __component: 'shared.key-facts'; title?: string; items: { label: string; value: string }[] }
  | {
      __component: 'shared.cta'
      heading: string
      body?: string
      buttonLabel: string
      buttonUrl: string
    }

export type Article = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  readingTime: number
  featured: boolean
  cover: { src: string; alt: string }
  category: { name: string; slug: string; color: string }
  author: { name: string; role: string; avatar: string; bio?: string }
  tags: string[]
  blocks: ArticleBlock[]
}

export type ArticleList = { articles: Article[]; page: number; pageCount: number; total: number }

export const CATEGORIES = [
  { name: 'Building 819 Pacific', slug: 'building-819-pacific', color: '#1F3D33' },
  { name: 'Founding 50', slug: 'founding-50', color: '#9E5640' },
  { name: 'Builder profiles', slug: 'builder-profiles', color: '#4E6A7E' },
  { name: 'Builder Night', slug: 'builder-night', color: '#B08A5E' },
  { name: 'How it runs', slug: 'how-it-runs', color: '#6F8063' },
  { name: 'Santa Cruz', slug: 'santa-cruz', color: '#C8734F' },
]

const cat = (slug: string) => CATEGORIES.find(c => c.slug === slug)!
const TOBY = { name: 'Toby Morning', role: 'Founder', avatar: '/brand/logos/logo-badge.png' }

const sample = (
  slug: string,
  category: string,
  title: string,
  excerpt: string,
  cover: string,
  publishedAt: string,
  readingTime: number,
  extra: Partial<Article> = {}
): Article => ({
  slug,
  title,
  excerpt,
  publishedAt,
  readingTime,
  featured: false,
  cover: { src: cover, alt: title },
  category: cat(category),
  author: TOBY,
  tags: [],
  blocks: [{ __component: 'shared.rich-text', body: excerpt }],
  ...extra,
})

export const SAMPLE_ARTICLES: Article[] = [
  sample(
    'seven-drafts-of-one-floor-plan',
    'building-819-pacific',
    'Seven drafts of one floor plan',
    'How 1,385 sq ft on Pacific Ave became 24 work seats, a conference room for 8 and a content studio, one draft at a time.',
    '/brand/renderings/cutaway-v7.jpg',
    '2026-12-01',
    6,
    {
      featured: true,
      tags: ['floor plan', '819 Pacific Ave', 'build-out'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: '## Starting from the walls\n\nThe first draft was a schematic drawn straight from the floor-plan dimensions: boxes for rooms, circles for chairs, a label on every wall. It answered one question. Does a coworking space fit in 1,385 square feet on Pacific Ave, with exposed brick on two sides and skylights overhead?\n\nIt did, barely. Then the drafts started.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Where the conference room went\n\nThe fireplace room is the only room that’s fully enclosed, so it became the conference room. French doors close it off for sound, a skylight lights the table, and the white brick fireplace stays.',
        },
        {
          __component: 'shared.media-compare',
          before: { src: '/brand/photos/12-conference-room.jpg', alt: 'Conference room today' },
          after: { src: '/brand/plan/room-01-conference.jpg', alt: 'Conference room plan' },
          caption: 'Today, and the plan: deep teal behind the fireplace and an oak table for 8.',
        },
        {
          __component: 'shared.quote',
          body: 'We keep the brick. We fix the rest.',
          author: 'The rule for every draft',
        },
        {
          __component: 'shared.rich-text',
          body: '## A kitchen by the door\n\nThe old break room already had plumbing, so it stayed the kitchen pantry: an updated sink, a new dishwasher, a fridge and a coffee bar.',
        },
        {
          __component: 'shared.media',
          file: {
            src: '/brand/renderings/kitchen-pantry.jpg',
            alt: 'Rendering of the planned kitchen pantry',
          },
          caption: 'The planned kitchen pantry.',
        },
        {
          __component: 'shared.rich-text',
          body: '## The founders’ room\n\nEarly drafts packed six dedicated desks into the main shared room. But the door into the content studio is a wide pair of French doors, and the desks blocked it. The room now holds just the 4 founding desks, with a couch under the Pacific Ave window.',
        },
        {
          __component: 'shared.key-facts',
          title: 'The final numbers',
          items: [
            { label: 'Total', value: '1,385 sq ft' },
            { label: 'Hot desks', value: '8' },
            { label: 'Drop-in seats', value: '12' },
            { label: 'Founding desks', value: '4' },
            { label: 'Conference room', value: 'Seats 8' },
            { label: 'Content studio', value: '4 seats' },
          ],
        },
        {
          __component: 'shared.cta',
          heading: 'Claim one of the 24 seats early.',
          body: 'The Founding 50: $1,000 once, or 3 payments of $333. Lowest rates for life.',
          buttonLabel: 'Join the Founding 50',
          buttonUrl: '/membership',
        },
      ],
    }
  ),
  sample(
    'what-1000-buys-you',
    'founding-50',
    'What $1,000 buys you, for life',
    'The Founding 50, the 3 × $333 plan, and why founding rates stay about half of market.',
    '/brand/logos/sticker-founding-50.png',
    '2026-12-01',
    4
  ),
  sample(
    '819-pacific-empty',
    'building-819-pacific',
    '819 Pacific, empty',
    'A walk through every room before we touch it: brick, skylights and a gas fireplace.',
    '/brand/photos/02-main-shared-room.jpg',
    '2026-12-04',
    5
  ),
  sample(
    'colors-that-suit-the-brick',
    'building-819-pacific',
    'Picking colors that suit the brick',
    'Three palettes tested against the walls, and why forest, moss and oak won.',
    '/brand/plan/room-01-conference.jpg',
    '2026-12-08',
    4
  ),
  sample(
    'why-there-is-no-paid-staff',
    'how-it-runs',
    'Why there is no paid staff',
    'Members open, close and care for the space. Here is how that works day to day.',
    '/brand/photos/10-drop-in-area.jpg',
    '2026-12-11',
    5
  ),
  sample(
    'how-the-bounty-board-works',
    'how-it-runs',
    'How the bounty board works',
    'Pull an issue, ship it, earn credits toward your membership.',
    '/brand/photos/03-hot-desks.jpg',
    '2026-12-15',
    3
  ),
  sample(
    'breakfast-from-downstairs',
    'santa-cruz',
    'Breakfast from downstairs',
    'Zachary’s has cooked on this block since 1985. Now members can order to their desk.',
    '/brand/renderings/kitchen-pantry.jpg',
    '2026-12-18',
    3
  ),
  sample(
    'a-public-benefit-corporation',
    'santa-cruz',
    'A public benefit corporation for Santa Cruz builders',
    'Why Citizen Space is a PBC, and where the profits go from 2027.',
    '/brand/photos/09-bay-window-corner.jpg',
    '2026-12-22',
    6
  ),
  sample(
    'meet-the-charter-founders',
    'builder-profiles',
    'Meet the charter founders',
    'The four builders taking the keys on January 1.',
    '/brand/photos/06-hallway-lounge.jpg',
    '2027-01-01',
    7
  ),
  sample(
    'builder-night-monday-by-monday',
    'builder-night',
    'Builder Night, Monday by Monday',
    'Demos and building together at Pleasure Pizza, until the doors open.',
    '/brand/photos/12-conference-room.jpg',
    '2027-01-06',
    4
  ),
  sample(
    'two-cruzio-lines',
    'building-819-pacific',
    'Two Cruzio lines, 2 gigs down',
    'Why the internet was the first thing we turned on.',
    '/brand/photos/08-red-wall-room-wide.jpg',
    '2027-01-12',
    3
  ),
]

type Raw = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const abs = (url: string | undefined, base: string) =>
  !url ? '' : /^https?:\/\//.test(url) ? url : `${base.replace(/\/$/, '')}${url}`

export function mapStrapiArticle(raw: Raw, base: string): Article {
  const media = (m: Raw | undefined, alt: string) => ({
    src: abs(m?.url, base),
    alt: m?.alternativeText || alt,
  })
  const blocks: ArticleBlock[] = (raw.blocks ?? []).map((b: Raw) => {
    switch (b.__component) {
      case 'shared.media':
        return { ...b, file: media(b.file, b.caption ?? '') }
      case 'shared.media-compare':
        return { ...b, before: media(b.before, 'Before'), after: media(b.after, 'After') }
      default:
        return b
    }
  })
  return {
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt ?? '',
    publishedAt: raw.publishedAt,
    readingTime: raw.readingTime ?? 1,
    featured: !!raw.featured,
    cover: media(raw.cover, raw.title),
    category: {
      name: raw.category?.name ?? '',
      slug: raw.category?.slug ?? '',
      color: raw.category?.color ?? '#1F3D33',
    },
    author: {
      name: raw.author?.name ?? 'Citizen Space',
      role: raw.author?.role ?? '',
      avatar: abs(raw.author?.avatar?.url, base) || '/brand/logos/logo-badge.png',
      bio: raw.author?.bio,
    },
    tags: (raw.tags ?? []).map((t: Raw) => t.name),
    blocks,
  }
}

export function articlesQuery(
  opts: { page?: number; pageSize?: number; category?: string; slug?: string; q?: string } = {}
) {
  const p = new URLSearchParams()
  p.set('sort[0]', 'publishedAt:desc')
  p.set('populate[cover]', 'true')
  p.set('populate[category]', 'true')
  p.set('populate[tags]', 'true')
  p.set('populate[author][populate][avatar]', 'true')
  if (opts.slug) {
    p.set('filters[slug][$eq]', opts.slug)
    p.set('populate[blocks][populate]', '*')
  }
  if (opts.category) {
    p.set('filters[category][slug][$eq]', opts.category)
  }
  if (opts.q) {
    p.set('filters[$or][0][title][$containsi]', opts.q)
    p.set('filters[$or][1][excerpt][$containsi]', opts.q)
  }
  p.set('pagination[page]', String(opts.page ?? 1))
  p.set('pagination[pageSize]', String(opts.pageSize ?? 9))
  return p.toString()
}

async function strapiFetch(query: string): Promise<Raw> {
  const base = process.env.STRAPI_URL!
  const res = await fetch(`${base.replace(/\/$/, '')}/api/articles?${query}`, {
    headers: process.env.STRAPI_TOKEN
      ? { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` }
      : {},
    next: { revalidate: 300, tags: ['articles'] },
  } as RequestInit)
  if (!res.ok) {
    throw new Error(`Strapi responded ${res.status}`)
  }
  return res.json()
}

export async function getArticles(
  opts: { page?: number; pageSize?: number; category?: string; q?: string } = {}
): Promise<ArticleList> {
  const base = process.env.STRAPI_URL
  if (!base) {
    const q = opts.q?.trim().toLowerCase()
    const all = SAMPLE_ARTICLES.filter(
      a =>
        (!opts.category || a.category.slug === opts.category) &&
        (!q || `${a.title} ${a.excerpt}`.toLowerCase().includes(q))
    )
    return { articles: all, page: 1, pageCount: 1, total: all.length }
  }
  const json = await strapiFetch(articlesQuery(opts))
  const pg = json.meta?.pagination ?? {}
  return {
    articles: (json.data ?? []).map((r: Raw) => mapStrapiArticle(r, base)),
    page: pg.page ?? 1,
    pageCount: pg.pageCount ?? 1,
    total: pg.total ?? 0,
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const base = process.env.STRAPI_URL
  if (!base) {
    return SAMPLE_ARTICLES.find(a => a.slug === slug) ?? null
  }
  const json = await strapiFetch(articlesQuery({ slug, pageSize: 1 }))
  const raw = json.data?.[0]
  return raw ? mapStrapiArticle(raw, base) : null
}

export const formatDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
