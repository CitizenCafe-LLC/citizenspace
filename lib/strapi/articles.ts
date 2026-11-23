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
    4,
    {
      featured: true,
      tags: ['Founding 50', 'pricing', 'membership'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: '## $1,000, once\n\nThe Founding 50 is a one-time fee, capped at 50 people, for a spot at 819 Pacific Ave before anyone else can buy one. Pay it in full or in 3 monthly payments of $333. Either way, once it’s paid you’re on founding rates for life — not an introductory rate that expires, not a discount code. The number on your membership never goes up.',
        },
        {
          __component: 'shared.key-facts',
          title: 'What founding rates actually mean',
          items: [
            { label: 'Day pass', value: '$12 founding · $25 typical' },
            { label: 'Monthly flex desk', value: '$124 founding · $249 typical' },
            { label: '10-day flex', value: '$74 founding · $149 typical' },
            { label: 'Conference room', value: '$7/hr founding · $15/hr typical' },
          ],
        },
        {
          __component: 'shared.rich-text',
          body: '## About half of everywhere else\n\nWe priced every founding rate against the lowest local listing we could find — Cruzioworks for the day pass and rooms, Pacific Workplaces for flex and virtual office. Founding rates land close to half of those. That gap doesn’t close later; it’s the whole point of paying early.',
        },
        {
          __component: 'shared.rich-text',
          body: '## The member NFT key\n\nYour $1,000 (or your third $333 payment) mints a membership NFT. It’s not an investment and it carries no profit share — it’s your door key and your membership pass, shown as a QR code on your phone. Lose your phone, and support can reissue it to a new wallet without losing your founding rate.',
        },
        {
          __component: 'shared.cta',
          heading: 'Only 50 spots.',
          body: 'Founding sales open December 1, 2026.',
          buttonLabel: 'Join the Founding 50',
          buttonUrl: '/membership',
        },
      ],
    }
  ),
  sample(
    '819-pacific-empty',
    'building-819-pacific',
    '819 Pacific, empty',
    'A walk through every room before we touch it: brick, skylights and a gas fireplace.',
    '/brand/photos/02-main-shared-room.jpg',
    '2026-12-04',
    5,
    {
      tags: ['819 Pacific Ave', 'walkthrough', 'before photos'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'Before any of it gets built out, here is 819 Pacific Ave exactly as we found it: patched walls, bare carpet, and the bones that made us sign the lease.',
        },
        {
          __component: 'shared.media',
          file: { src: '/brand/photos/01-passthrough-to-conference.jpg', alt: 'Passthrough into the future conference room' },
          caption: 'The passthrough into what becomes the conference room — French doors already hung, just unpainted.',
        },
        {
          __component: 'shared.rich-text',
          body: '## The main room\n\nExposed brick on two walls, a skylight running the length of the ceiling, and an arched chalkboard built into the brick itself. This is the main shared room: four founding desks go in under the Pacific Ave window, and the chalkboard becomes the founders’ planning wall.',
        },
        {
          __component: 'shared.media',
          file: { src: '/brand/photos/02-main-shared-room.jpg', alt: 'Main shared room, empty' },
          caption: 'Afternoon light across the brick. Nothing in this photo is staying except the brick and the skylight.',
        },
        {
          __component: 'shared.rich-text',
          body: '## The fireplace room\n\nA white brick fireplace, a second skylight, and French doors that actually close — the only fully enclosed room in the space. It’s loud enough outside that this is the only room we’re making a conference room instead of open desks.',
        },
        {
          __component: 'shared.media',
          file: { src: '/brand/photos/12-conference-room.jpg', alt: 'Fireplace room before conversion to conference room' },
          caption: 'The fireplace stays. Everything else in this room is rebuilt for a table of 8.',
        },
        {
          __component: 'shared.rich-text',
          body: '## What stays, what doesn’t\n\nBrick, skylights, the fireplace and the chalkboard stay — the building did the hard part for us 60 years ago. Everything else, paint, carpet, the kitchen plumbing, gets touched between now and March. "Seven Drafts of One Floor Plan" has the room-by-room plan for what replaces what you see here.',
        },
      ],
    }
  ),
  sample(
    'colors-that-suit-the-brick',
    'building-819-pacific',
    'Picking colors that suit the brick',
    'Three palettes tested against the walls, and why forest, moss and oak won.',
    '/brand/plan/room-01-conference.jpg',
    '2026-12-08',
    4,
    {
      tags: ['design', 'brick', 'palette'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'Exposed brick is the one thing every room shares, and the one thing we weren’t willing to paint over. That ruled out most of the first palette we tried.',
        },
        {
          __component: 'shared.rich-text',
          body: '## What we tried first\n\nThe first pass leaned cool: slate grays and a cold blue meant to contrast the warm brick. It photographed fine but felt wrong to stand in — like the room was arguing with its own walls. The second pass went the other way, warm terracotta on terracotta, and just disappeared into the brick instead of framing it.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Forest, moss and oak\n\nThe winning palette doesn’t fight the brick or copy it — it reads as a different material sitting next to it. Deep forest green on the conference room walls behind the fireplace. Moss on the panel walls in the smaller offices. Oak tones on trim and the built-ins. All three hold their own under the skylights without washing out in direct afternoon sun, which killed at least one color we liked on paper.',
        },
        {
          __component: 'shared.media',
          file: { src: '/brand/plan/room-01-conference.jpg', alt: 'Conference room plan showing the forest-green palette' },
          caption: 'Deep forest behind the fireplace, oak on the table and trim.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Where it shows up\n\nYou can see the palette already in the room renderings on this blog and in the gallery — the conference room’s teal-leaning deep green, the drop-in area’s warmer wood tones. It’s the same logic behind the site’s own brand colors: paper, bone and forest, picked to sit next to real photos of the brick without clashing.',
        },
      ],
    }
  ),
  sample(
    'why-there-is-no-paid-staff',
    'how-it-runs',
    'Why there is no paid staff',
    'Members open, close and care for the space. Here is how that works day to day.',
    '/brand/photos/10-drop-in-area.jpg',
    '2026-12-11',
    5,
    {
      tags: ['how it runs', 'member-run'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'Citizen Space has no front desk, no manager, and no one on payroll to unlock the door in the morning. That’s not a budget decision — it’s the model.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Who actually opens the door\n\nTrusted members hold off-hours access and take turns opening and closing. Every member signs a code of conduct when they join, and the same handful of house rules — clean up after yourself, respect booked rooms, lock up if you’re last out — cover almost everything that would otherwise need a manager to enforce.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Where the work goes instead\n\nWithout a staff line, founding rates stay close to half of what other Santa Cruz spaces charge for the same square footage and the same internet speed. The bounty board — paid tasks members pick up for credits toward their own membership — covers the jobs a front desk would normally do: restocking the kitchen, running the Monday opening checklist, fixing a sticky door.',
        },
        {
          __component: 'shared.rich-text',
          body: '## What this isn’t\n\nIt isn’t unsupervised. It’s 24 seats and people who signed up to be there, running a space they have a direct stake in keeping clean and working. If something breaks, a member posts it, another member picks it up off the bounty board, and it gets fixed days faster than waiting on a property manager’s schedule.',
        },
      ],
    }
  ),
  sample(
    'how-the-bounty-board-works',
    'how-it-runs',
    'How the bounty board works',
    'Pull an issue, ship it, earn credits toward your membership.',
    '/brand/photos/03-hot-desks.jpg',
    '2026-12-15',
    3,
    {
      tags: ['bounty board', 'credits', 'how it runs'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'The bounty board is a screen on the wall listing paid tasks members can pick up, posted as GitHub issues. Pull one, ship it, and the credit comes off your next membership payment.',
        },
        {
          __component: 'shared.rich-text',
          body: '## What ends up on the board\n\nAnything that keeps the space running but doesn’t need a property manager: restocking the kitchen pantry, running the Monday-morning opening checklist before Builder Night, fixing a door that’s sticking, updating the floor-plan page when a room changes. Some of it is physical, some of it is code — this website’s own backlog of open gaps runs the same way.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Why credits, not cash\n\nPaying in membership credit instead of cash keeps the bounty board doing what it’s for: lowering the real cost of being a member, the same way founding rates do. A $25 task knocks $25 off your next invoice. It adds up the same way a part-time job would, without turning Citizen Space into an employer.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Who can pull a bounty\n\nAny member, from day one. You don’t need seniority or a particular membership tier — you need to actually do the task and mark it done. The board is first-come on open issues, and anyone can post a new one if something needs fixing that isn’t listed yet.',
        },
      ],
    }
  ),
  sample(
    'breakfast-from-downstairs',
    'santa-cruz',
    'Breakfast from downstairs',
    'Zachary’s has cooked on this block since 1985. Now members can order to their desk.',
    '/brand/renderings/kitchen-pantry.jpg',
    '2026-12-18',
    3,
    {
      tags: ['Zachary’s', 'cafe', 'Santa Cruz'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'Zachary’s has served breakfast and lunch at 819 Pacific Ave since 1985 — longer than most of our members have been alive. We’re the floor above it, not a separate business trying to compete with it.',
        },
        {
          __component: 'shared.rich-text',
          body: '## The member menu\n\nMembers order from Zachary’s member menu directly on the Citizen Space site, and Zachary’s brings it up the stairs — Tuesday through Sunday, 7am to 2:30pm. No delivery app, no delivery fee, no cold food riding in someone’s car for twenty minutes. It comes from one floor down.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Why this, instead of our own kitchen\n\nBuilding a commercial kitchen into 1,385 square feet would have eaten space we’d rather give to desks and the conference room, and it would have put us in competition with a restaurant that’s fed this block for forty years. Partnering with Zachary’s gets members fed better than a coworking kitchenette ever would, and keeps the business downstairs exactly where it belongs.',
        },
        {
          __component: 'shared.rich-text',
          body: '## What’s still ours\n\nThe kitchen pantry upstairs — new sink, new dishwasher, a fridge and a coffee bar — handles coffee, snacks and anything members bring themselves. Zachary’s is for a real breakfast or lunch without leaving your desk.',
        },
      ],
    }
  ),
  sample(
    'a-public-benefit-corporation',
    'santa-cruz',
    'A public benefit corporation for Santa Cruz builders',
    'Why Citizen Space is a PBC, and where the profits go from 2027.',
    '/brand/photos/09-bay-window-corner.jpg',
    '2026-12-22',
    6,
    {
      tags: ['PBC', 'public benefit corporation', 'Santa Cruz'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'Citizen Space, PBC is incorporated as a public benefit corporation, not a standard C-corp. That’s a legal structure, not a marketing line — it changes what the company is actually required to optimize for.',
        },
        {
          __component: 'shared.rich-text',
          body: '## What a PBC actually means\n\nA standard corporation’s board answers to shareholder returns, full stop. A public benefit corporation is legally required to balance shareholder interest against a stated public benefit — in our case, the Santa Cruz founder economy: the builders, freelancers and small teams a membership-funded space is built to support.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Where the profit goes, starting 2027\n\nOnce the doors open in March 2027 and the space is running at capacity, profit doesn’t just accrue to outside investors. It gets invested back into the member companies working out of 819 Pacific Ave — the same founders paying founding rates to be there in the first place. The exact mechanism is still being finalized before doors open; this blog will cover it in detail once it’s locked.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Why this, and why now\n\nFounding members are paying $1,000 up front, over a year before the space exists, on the promise of lowest-rates-for-life. A PBC structure is the legal commitment that the company answering to is "pay the founders back," not "maximize return for whoever bought in first."',
        },
      ],
    }
  ),
  sample(
    'meet-the-charter-founders',
    'builder-profiles',
    'Meet the charter founders',
    'The four builders taking the keys on January 1.',
    '/brand/photos/06-hallway-lounge.jpg',
    '2027-01-01',
    7,
    {
      tags: ['charter founders', 'builder profiles'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'Four of the Founding 50 paid their first installment early enough to move in with the build-out itself, ahead of the March opening. We’ll introduce each of them here as the space comes together around them.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Why charter founders, specifically\n\nAnyone in the Founding 50 gets the same lowest-rate-for-life membership. What makes the charter founders different is timing: pay your first installment in December or January, and you’re working out of 819 Pacific Ave during the January build-out itself, not waiting for doors to open in March. Four founding desks sit in the main shared room specifically for this.',
        },
        {
          __component: 'shared.rich-text',
          body: '## This post will grow\n\nWe’re holding this post for the charter founders themselves to tell their own story — who they are, what they’re building, why they signed up before there was a space to see. Check back as each profile goes up.',
        },
      ],
    }
  ),
  sample(
    'builder-night-monday-by-monday',
    'builder-night',
    'Builder Night, Monday by Monday',
    'Demos and building together at Pleasure Pizza, until the doors open.',
    '/brand/photos/12-conference-room.jpg',
    '2027-01-06',
    4,
    {
      tags: ['Builder Night', 'events', 'Pleasure Pizza'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'Builder Night doesn’t wait for a building. Every Monday, Santa Cruz builders meet at Pleasure Pizza on Pacific Ave to demo what they shipped that week and build alongside each other.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Why it started before the space did\n\nThe Founding 50 opened sales December 1, 2026, over a year before 819 Pacific Ave opens its doors. Builder Night is how the community meets and stays connected in the meantime — the same people who’ll be running the space together in March are already showing up every Monday.',
        },
        {
          __component: 'shared.rich-text',
          body: '## What actually happens\n\nNo set agenda beyond showing up with something to show. Some weeks it’s a demo of what someone shipped that week, some weeks it’s just builders working side by side on laptops over pizza. It’s the same format we plan to keep running once we have our own common area to host it in.',
        },
        {
          __component: 'shared.rich-text',
          body: '## After the doors open\n\nOnce 819 Pacific Ave is open, Builder Night moves into the space itself, booked through the same common area members already use for Colearn classes and workshops. Until then: Mondays, Pleasure Pizza, Pacific Ave.',
        },
      ],
    }
  ),
  sample(
    'two-cruzio-lines',
    'building-819-pacific',
    'Two Cruzio lines, 2 gigs down',
    'Why the internet was the first thing we turned on.',
    '/brand/photos/08-red-wall-room-wide.jpg',
    '2027-01-12',
    3,
    {
      tags: ['internet', 'Cruzio', '819 Pacific Ave'],
      blocks: [
        {
          __component: 'shared.rich-text',
          body: 'Before the paint, before the desks arrived, before anything else got touched, we got two Cruzio lines run into 819 Pacific Ave: 2 Gbps down, 400 Mbps up. Everything else in the build-out can wait a week. The internet couldn’t.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Why two lines, not one\n\nOne gigabit line is fast enough for almost anything a single person does. It is not fast enough for 24 work seats on video calls at the same time, someone recording in the content studio, and a conference room screen-sharing, all at once. Two separate Cruzio lines mean a problem on one doesn’t take the whole space offline — the second line keeps everyone working while the first gets fixed.',
        },
        {
          __component: 'shared.rich-text',
          body: '## Why Cruzio\n\nCruzio is Santa Cruz’s own internet provider, not a national ISP routing a support ticket through three states. When a line goes down at 819 Pacific Ave, the people fixing it are a few blocks away, not a call center in another time zone.',
        },
        {
          __component: 'shared.rich-text',
          body: '## What this actually buys members\n\n2 Gbps down and 400 Mbps up, available to every seat in the space, from the hot desks to the content studio. It’s the single biggest reason founding members compare Citizen Space favorably to working from a cafe or a home connection shared with a household.',
        },
      ],
    }
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
