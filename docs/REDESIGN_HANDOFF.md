# Citizen Space redesign: handoff for Claude Code

Branch `feat/citizen-space-redesign` rebuilds the public site from the **Citizen Space Website Layout** design canvas
(claude.ai artifact) using the **Citizen Space** design system (Fraunces + DM Sans, paper/bone/forest/brick tokens,
6px top-rule cards, zone colors for rooms).

## What changed

| Route | File | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | Rotating photo hero (`HeroCarousel`), Founding 50, room cards, today vs. plan, community, location |
| `/workspaces` | `app/workspaces/page.tsx` | Interactive floor-plan room picker (`RoomPicker`), `#desks`, `#conference`, `#studio` |
| `/workspaces/{desks,meeting-rooms,communications-pods}` | redirects | → `/workspaces#desks`, `#conference`, `#studio` |
| `/workspaces/team-pods` | redirect | → `/membership` (team pods aren’t in the 819 Pacific plan) |
| `/membership` | `app/membership/page.tsx` | Founding vs. standard rates, hourly rates, sponsor tiers, timeline, sign-up |
| `/events` | `app/events/page.tsx` | Real dates only (founding sale, Builder Night, keys, opening, tours). The old 2024 sample events are gone |
| `/gallery` | `app/gallery/page.tsx` | 15 real photos, large, caption below |
| `/blog`, `/blog/[slug]` | `app/blog/**` | Strapi-backed (see below), category filter, featured post, pagination, block renderer, BlogPosting JSON-LD |
| `/location` | `app/location/page.tsx` | Address card, Google Maps embed, access |
| `/contact` | `app/contact/page.tsx` | Form posts to `/api/contact`, “Getting here” (parking, bus, bike) |
| `/cafe` | `app/cafe/page.tsx` | Zachary’s member menu with ordering (`CafeMenu`), kitchen today vs. rendering |
| `/cafe/menu`, `/cafe/partners` | redirects | → `/cafe#menu`, `/cafe` (the old partners were San Francisco shops) |
| `/faq` | `app/faq/page.tsx` | ~49 Q&As incl. LLM-discovery questions; FAQPage JSON-LD |
| layout | `app/layout.tsx` | Brand fonts, new metadata, LocalBusiness/CoworkingSpace JSON-LD |
| header/footer | `components/navigation.tsx`, `components/footer.tsx` | Workspaces is linked, Connect Wallet kept (RainbowKit modal via `components/site/connect-wallet.tsx`, header + mobile menu) so members can buy the NFT key, footer says Citizen Space, PBC |

Single source of truth for copy and prices: `lib/site/content.ts` (tests forbid `[PLACEHOLDER]` text and check
founding rates stay ≤ 55% of typical prices). Structured data: `lib/site/jsonld.ts`.

Assets live in `public/brand/` (`logos/`, `photos/`, `plan/`, `renderings/`). Photos are the 640×480 originals:
replace with hi-res files of the same names when available.

## Strapi

`lib/strapi/articles.ts` talks to Strapi 5 REST (`/api/articles`). Set `STRAPI_URL` (and `STRAPI_TOKEN` if the API
isn’t public). Without `STRAPI_URL`, the blog renders `SAMPLE_ARTICLES`.

Content types to create in Strapi:

- **article**: title, slug (uid from title), excerpt, cover (media), category (many-to-one), author (many-to-one),
  tags (many-to-many), series (many-to-one, optional), featured (boolean), readingTime (integer),
  blocks (dynamic zone), seo (component)
- **category**: name, slug, description, color (one of the zone colors)
- **author**: name, slug, role, avatar (media), bio
- **tag**: name, slug
- Dynamic-zone components: `shared.rich-text` { body (markdown) }, `shared.media` { file, caption },
  `shared.media-compare` { before, after, caption }, `shared.quote` { body, author },
  `shared.key-facts` { title, items[] { label, value } }, `shared.cta` { heading, body, buttonLabel, buttonUrl }

Pages revalidate every 300s and tag fetches with `articles`. Next step: add `app/api/revalidate/route.ts` that calls
`revalidateTag('articles')`, and point a Strapi webhook at it.

## Tests

`npx jest __tests__/site` (32 tests): content rules, JSON-LD, cafe cart, Strapi client, and components (header,
footer, hero carousel, room picker, cafe menu, article blocks).

## Pre-existing problems on `main` (not introduced here)

`next build` fails on `main` before these changes:

1. `app/api/events/[id]` and `app/api/events/[slug]` conflict (“different slug names for the same dynamic path”).
2. `app/api/auth/verify-nft/route.ts` imports `next-auth`, which isn’t installed.
3. ~1,380 TypeScript errors across older files (e.g. unused imports in `app/about/page.tsx`).
4. `/booking` crashes during page-data collection (Next 13.5.1 minifier vs. Radix Progress).
5. Many API routes import `apiError`/`apiResponse`, which `lib/api/response.ts` doesn’t export.
6. 305 Jest tests already fail on `main`.

The redesigned routes were verified with `next dev` (all return 200; redirects return 307) and Playwright screenshots.

## Open questions for Toby

- Virtual address: the deck says $39/mo with 2 day passes; an earlier plan said $49. The site uses $39.
- Legal name: footer says “Citizen Space, PBC”. Confirm the registered name (repo org is still “CitizenCafe-LLC”).
- Zachary’s: confirm the member-menu and delivery arrangement before launch; wire `CafeMenu`’s `onSend` to a real order route.
- Builder Night: copy assumes it’s the Monday meetup at Pleasure Pizza.
