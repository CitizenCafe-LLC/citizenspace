# Citizen Space mobile screens: handoff for your local agent

Branch `feat/citizen-space-redesign` now carries the phone layout of every public page, built from the
**Citizen Space Mobile Screens** design canvas (claude.ai artifact). It sits on top of the website redesign in
`docs/REDESIGN_HANDOFF.md`; read that first for the content model, Strapi and the pre-existing problems on `main`.

## The approach (and why it isn’t React Native)

React Native components don’t run in a browser, so the site stays one Next.js app. Below `md` (768px) it switches
to native-style patterns built with plain React and Tailwind. From `md` up the desktop layout is unchanged.

| Native pattern | Here | React Native / Expo equivalent, if you build an app later |
| --- | --- | --- |
| Bottom tab bar | `components/site/mobile-tab-bar.tsx` | `@react-navigation/bottom-tabs` |
| Bottom sheet (menu, cafe order) | `components/site/bottom-sheet.tsx` | `@gorhom/bottom-sheet` |
| Horizontal pager / swipe rows | `components/site/swipe-row.tsx` (CSS scroll-snap), swipe in `hero-carousel.tsx` | `FlatList horizontal pagingEnabled` |
| Tap-to-open sections | `components/site/disclosure.tsx`, `<details>` in `faq-list.tsx` | `Pressable` + `LayoutAnimation` |
| Sticky action bar | `components/site/sticky-cta.tsx`, cart bar in `cafe-menu.tsx` | absolutely positioned `View` over the tab bar |
| Native share sheet | `components/site/share-button.tsx` (Web Share API) | `Share.share()` |
| Connect Wallet | `components/site/connect-wallet.tsx` (RainbowKit) | WalletConnect AppKit for React Native |

An Expo app could import `lib/site/content.ts` and `lib/strapi/articles.ts` unchanged: neither touches the DOM.

## What changed

### Shared shell

| File | Change |
| --- | --- |
| `app/layout.tsx` | Renders `<MobileTabBar />`; `viewportFit: 'cover'`, `themeColor`, `appleWebApp` so the tab bar sits in the iPhone safe area |
| `app/globals.css` | `--tabbar-space` (62px + safe area on phones, 0 from `md`) and `.scrollbar-none` |
| `components/navigation.tsx` | 56px top bar on phones: logo, **Connect Wallet**, menu button. The menu opens a bottom sheet (`Site menu`) with every page plus FAQ, Join the Founding 50 and Connect Wallet. “Join the Founding 50” leaves the phone top bar because the **Join** tab covers it |
| `components/footer.tsx` | Bottom padding of `--tabbar-space` so the tab bar never covers the green footer; 2-column links with 44px targets on phones |
| `components/site/ui.tsx` | Phone type scale (H1 38px, H2 28px), tighter section padding, 52px buttons; `Photo` takes `ratio={null}` to size by class |
| `components/site/bottom-sheet.tsx` | Modal sheet: portal to `<body>` (the header’s `backdrop-blur` would otherwise trap `position: fixed`), focus moves in and is trapped, Escape/backdrop/close button close it, body scroll locked |

### Pages

| Route | Phone layout |
| --- | --- |
| `/` | Stacked full-width CTAs, swipeable hero (40px flick), Founding 50 and room cards as swipe rows, 2-column rate grid |
| `/workspaces` | Seat counts (8 / 12 / 4), room chips scroll sideways, full-width CTA |
| `/membership` | Sticker above the title, price list rows (founding price, typical struck through), 2-column hourly rates, swipeable sponsor tiers, **Paying with crypto?** card with Connect Wallet (`#crypto`), $1,000 / 3 × $333 segmented control, sticky “Join the Founding 50 · $1,000” bar that hides once `#join` is on screen |
| `/cafe` | Section chips stick under the top bar, + button becomes a − / qty / + stepper, floating **View order** bar, order bottom sheet (deliver-to seat, note, send). The side order panel stays from `md` up |
| `/events` | Date badge left, title, body and CTA right |
| `/gallery` | Photos run edge to edge with the caption below |
| `/blog` | Search box (`?q=`, also sent to Strapi as `$containsi` on title and excerpt), category chips scroll sideways, posts as list rows with a square thumbnail |
| `/blog/[slug]` | Tighter header, edge-to-edge cover, native **Share** button, “On this page” hidden below `lg` |
| `/location` | **Open in Apple Maps** and **Open in Google Maps** buttons, shorter map |
| `/contact` | Photo hidden on phones so the form comes first; parking, bus and bike are tap-to-open (always open from `md`) |
| `/faq` | Search across all 49 questions with a result count, topic chips that stick under the top bar, tap-to-open answers. Everything still renders on the server, and the FAQPage JSON-LD is unchanged |

## How to run it (for your local agent)

Work test-first: write or extend a test in `__tests__/site/`, watch it fail, then change the code.

```bash
# 1. Get the branch (if the push below didn’t land, apply the patch Toby has instead)
git fetch origin && git checkout feat/citizen-space-redesign
#    or, from main:  git checkout -b feat/citizen-space-redesign && git am citizen-space-redesign.patch

# 2. Install and run the site tests (47 tests, all should pass)
npm ci
npx jest __tests__/site

# 3. Lint and format what you touch
npx eslint components/site components/navigation.tsx app
npx prettier --check components app lib __tests__/site

# 4. Run it. `next build` fails on main for reasons unrelated to this work (see REDESIGN_HANDOFF.md), so use dev.
#    Two routes break dev too; move them aside while you check pages, then put them back:
mkdir -p /tmp/aside
mv "app/api/events/[slug]" /tmp/aside/events-slug && mv app/api/auth/verify-nft /tmp/aside/verify-nft
NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x SUPABASE_SERVICE_ROLE_KEY=x \
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<real id from cloud.walletconnect.com> JWT_SECRET=x npx next dev -p 3100
#    ...check pages, then:
mv /tmp/aside/events-slug "app/api/events/[slug]" && mv /tmp/aside/verify-nft app/api/auth/verify-nft
```

To see the phone layout, use Chrome DevTools device mode at 390 × 844 (iPhone 14/15), or Playwright:

```python
# pip install playwright && playwright install chromium
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    page = p.chromium.launch().new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True).new_page()
    for r in ["/", "/workspaces", "/membership", "/cafe", "/events", "/gallery", "/blog", "/location", "/contact", "/faq"]:
        page.goto(f"http://localhost:3100{r}", wait_until="networkidle")
        assert page.evaluate("document.documentElement.scrollWidth") == 390, r   # no sideways scroll
        page.screenshot(path=f"m{r.replace('/', '_') or '_home'}.png")
```

Every route returned 200 with no page errors and no sideways scroll at 390px when this was handed off. The menu
sheet, cafe cart bar, cafe order sheet and FAQ search were also clicked through in Playwright.

Two things to know when checking:

- Tailwind is 3.3: there is no `has-*` variant, so use `[&:has(:checked)]:…` (see `founding-signup.tsx`).
- `cn()` runs `tailwind-merge`, which drops `-mx-4` if `m-0` follows it. Use `my-0 -mx-4` (see `swipe-row.tsx`).

## Tests

`npx jest __tests__/site` runs 47 tests. New in `__tests__/site/mobile.test.tsx`:

- Tab bar: has the five tabs, marks the current one, and marks Home only on `/`.
- Bottom sheet: modal, closes on Escape and the close button, and renders nothing when closed.
- Menu sheet: lists every page, Join and Connect Wallet, and closes on Escape.
- Cafe: Add turns into a stepper; the cart bar shows the item count and total and opens the order sheet; there's no cart bar while the order is empty.
- FAQ: search filters questions, shows a "no matches" message and keeps every question when the box is empty.
- Disclosure, SwipeRow and the hero swipe.

`strapi.test.ts` also checks the `?q=` search query and the sample-data search.

## What’s left

1. **Push and PR.** If `git push` from the cloud session was refused (the Claude GitHub App isn’t installed for
   `CitizenCafe-LLC`), push from Toby’s machine: `git push -u origin feat/citizen-space-redesign`, then open a PR
   into `main` with `gh pr create --fill`.
2. **NFT purchase on Membership.** Connect Wallet connects a wallet but doesn’t start a purchase. The mint flow
   lives in the separate `nftsale/` app: `nftsale/components/ui/mint-modal.tsx` and `nftsale/hooks/useNFTContract.ts`.
   Move them under `components/` and `hooks/`, point them at `lib/web3/wagmi.ts` (the main app’s config), and open
   the mint modal from the `#crypto` card in `app/membership/page.tsx` once `useAccount().isConnected` is true. Write
   the test first with the RainbowKit mock already in `__tests__/site/components.test.tsx`. Set
   `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in the deployment.
3. **Cafe orders backend.** `CafeMenu` only confirms in the browser; `onSend({ lines, seat, note })` is the hook.
   `app/api/orders/route.ts` already exists (Supabase + `withAuth`), but it’s tied to the old cafe menu ids. Either
   adapt it to the Zachary’s item names, or (Toby’s preferred stack) add a small FastAPI service that stores orders
   in ZeroDB (use the AINative ZeroDB MCP server to create the table) and notifies Zachary’s. Don’t go live until the
   Zachary’s agreement is confirmed.
4. **Fonts on phones.** Fraunces and DM Sans load from Google Fonts in `app/layout.tsx`. If you upgrade Next past
   13.5, switch to `next/font/google` to avoid the flash of fallback serif.
5. **Pre-existing build problems on `main`** (routes conflict, `next-auth` missing, ~1,380 type errors, `/booking`
   minifier crash, missing `apiError`/`apiResponse`, 305 failing tests): unchanged, listed in `REDESIGN_HANDOFF.md`.

## Open questions for Toby (unchanged)

- Virtual address: $39/mo (deck) or $49/mo (earlier plan)? The site uses $39.
- Legal name: is it registered as “Citizen Space, PBC”? The repo org is still `CitizenCafe-LLC`.
- Zachary’s: confirm the member-menu and delivery arrangement before ordering goes live.
- Builder Night: is it the same as the Monday meetup at Pleasure Pizza?
