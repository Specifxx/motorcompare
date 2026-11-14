


## 2026-11-13: one native horizontal ad block in place of the side rails

Owner (ported from KaeYoung): the side rails are off, so replace them with ONE bigger, subtler ad block inside the page that looks like part of the site. `components/InlineAds.tsx` (the rails' data, `lib/side-rails.ts` and the static `/rails/<region>`, unchanged in shape) draws a full-column section in the site's own card, hairline and text tokens, a small muted "Ad" label, an eBay row first and an Amazon row second, up to ten larger tiles each (about six visible on a desktop, 150-160px pictures, a two-line title, the price) that scroll sideways on a phone. This is the owner's explicit exception to "no banner ads" (2026-10-30), written into CLAUDE.md and the public disclosure.

- One block per page, below the main content: the home page between sections (not the hero), the product page under the price table and details, every list after its grid (category hubs, popular, deals, new, brand pages). Never beside a buy button or above a price, never fixed or floating, no side space, no pop-up. The page's existing paid rows (pinned eBay and Amazon rows in the price table) are not strips and stay.
- Browser only like the rails: the section's height is reserved in CSS (`.inline-ad-empty`), tiles are fetched from `/rails/<region>` after hydration; nothing reads a cookie or header and no function was added (`tests/cost-rules.test.ts`). The rail columns, `RailSlot`, `SIDE_RAILS` and the layout slots, the sticky column CSS and the rail scroll CSS are deleted.
- New tags: `motor-<region>-inline-ebay-<ean>` and `ascsubtag=motor-<region>-inline-amazon-<ean>` (were side-ebay / side-amazon); the click event placements are `inline_ebay_<page>` and `inline_amazon_<page>`. Every link rel sponsored. Amazon tiles still carry no price and are never in an overlay. Never a store row, best price, deal or alert.
- The phone dock stays (eBay only), now phones only (below 768px; it showed under 1440px while the rails existed), and it yields while the block is on screen. Its tag is `dock-ebay`, derived from `inline-ebay`.
- Measure clicks per placement (`inline_*` against `dock_ebay` and the price table's pinned rows) a week after the next release, before changing the block. Never re-add rails or a second block without the owner.
- `SITE.sideRails` stays as the one off switch for the block and the dock (false renders and fetches nothing).

## 2026-11-14: fewer ISR writes: noindex products under /p/, 100 prebuilt pages

Vercel billing put MotorCompare second on the team (US$2.16 over 11 to 12 Nov, US$1.51 of it ISR writes, the team's
largest line); only `/product/[slug]` wrote, about 16,000 8 KB units in 12 hours, 2 to 37 units a page. Two causes:

- **Prebuilt pages are written at every release.** 500 pages at ~30 units each is ~15,000 units per deploy, and the
  site released several times a day (daily data plus `[urgent]` code releases). `PREBUILT_PRODUCTS` is now 100; the
  rest render on their first visit, as before.
- **Crawlers walked ~33,000 noindex product pages** (39,042 products, 5,662 indexable), each a render and write after
  every release. A product Google is not asked to index is now linked as `/p/<slug>` (`productPath`,
  `lib/index-tiers.ts`), which `next.config.js` rewrites to the same page and `robots.txt` disallows. Visitors see the
  same page; the canonical stays `/product/<slug>`. Client-only links (basket, garage, quick view, search) keep
  `/product/`: crawlers never see them.

Every `[deploy]`/`[urgent]` release empties the cache, so each extra release costs the prebuilt pages again: keep to
the one daily data release unless the owner says a change is urgent.
