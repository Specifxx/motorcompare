


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

## 2026-11-14: The price rows' cart button says "Add to cart"

The owner, opening the price rows: "there needs to be an add to cart button ... right now, it just sends it to the site". The
cart button was already on every store row, but as a bare grey cart icon on a computer (lost on the tinted best-price row) and
as small coloured text on a phone, so it read as decoration. `CartAddButton` now carries its words by default ("Add to cart",
"In cart" once added; "Add" beside the icon below 640px where a row has no room), with a firmer neutral border, and the phone's
text button (`inline`) is drawn as a bordered button (`cart.css`). Neutral, never a new colour: the buy button stays the one
filled action and the calm three-colour rule holds. Nothing else moved: which rows can be added (open store rows, eBay and
Amazon with a live price; never a marketplace or a search row), the line's buy link and its affiliate tag, the row order, the
buy button and every placement are unchanged. A caller can still ask for the bare icon (`label={false}`).

## 2026-11-14: Every page brought up to the home page's look (owner: "make all the other pages more aesthetic as well")

The home page is the spec (its tokens, Barlow Condensed headings on one scale, white cards with hairlines, 40px round
controls, the brand orange only for the one thing to press, green only for money). ScentCompare's change of the same day
(its #74), ported by hand in MotorCompare's colours, plus the store lists that are this site's own. Per page type:

- **Product pages.** On a phone the photo is smaller (176px plate, 20px padding) and the gap under it tighter, and the h1 is a
  little tighter, so the price card starts about 90px higher. A store's whole name shows, wrapping to a second line instead of
  being cut ("Import Image …"), in the price table and the quick view. The method note under the table ("Prices are each
  store's own…", with its basket link) is folded into a native `<details>` ("How these prices are checked"), and "Report a
  wrong price" uses the same quiet summary line (`.fine`): both still in the server HTML. The "Prices in" region tabs are 40px.
- **List, brand, category and search pages.** The filter bar is one control height (40px) and one shape, in an even
  two-column grid on a phone. Search keeps the filter bar's and the results' room from the first paint (layout shift on a
  desktop 0.24 to 0.02). A search with no result says so in bold, suggests a part number or the code on the old part, and
  offers "Clear filters" and "Popular now" above the existing big-shop search links (same links, same words, same order).
- **Guides and static pages (about, terms, privacy, contact, disclosure…).** `Prose` is no longer a card: one article measure
  (68 characters), one heading scale, styled lists and links (`.article-body`, touching only unclassed elements). The page
  header is tighter on a phone, its line held to 62 characters. Breadcrumbs stay on one line, the last name cut with "…".
  Guide index cards are a little tighter on a phone.
- **Long store lists.** A country guide shows its first 12 stores and folds the rest ("Show all 96 stores", same order); the
  stores page folds each region's stores that have no products yet ("61 more we are still checking"). Every name and link
  is still in the server HTML.
- **404.** The same h1 and line, plus the site search and four ways back (home, Popular, Deals today, All brands).
- **Shared.** Every product photo sits on one light plate (`.plate`): on the night theme the old white-to-grey gradient ended
  in the page's dark grey and read as a smudge. The header's theme, menu and region controls, the quick view's close, Share
  and the pager are 40px tap targets; "All popular →"-style section links get a 40px hit area without moving. The day
  theme's orange (`--accent`, `--buy`) is a shade deeper, `192 70 8` (was `214 82 14`): white button words on it read 5.1:1,
  they read 4.1:1, under AA. Same hue; every button keeps its place, words and fill; the logo, icon and share images keep
  `#d6520e`. Filled orange controls on the night theme take the page's dark colour for their words, as `btn-buy` already did.
  The footer's lower-case starts are capitalised.

Nothing paid moved: no paid link, pinned eBay / Amazon / chain row, ad block, affiliate tag or placement name was added,
removed, reordered or reworded, and store rows stay in price order, so the 19 November clicks-per-placement recheck is
unaffected. No URL, redirect, title, description, canonical, robots, Open Graph, JSON-LD or h1 changed: checked on 14 sampled
pages, server HTML of `main` against this branch with scripts off (same metadata, structured data, h1, internal links and
sponsored links in the same order with the same words and hrefs; the only text differences are the capitalised footer words,
the two summary lines, the 404's links and the stores page's fold lines). No new font, library, client script, data read or
revalidate. Left as they were: the home page's structure and its tinted "Shop by part" tiles, the price rows' "Add to cart"
look (owner, today) and the best row's green ground, the store thumbs' size (owner's call), and a ~35px shift on a phone's
product page while Barlow Condensed loads (on `main` too: a font-swap re-wrap of the h1, not from this change).

## 2026-11-14: Review of the day's redesign: two small faults fixed

An independent check of the redesign above (#41): `main` before it against `main` after, fixture builds, 18 URLs at 390×844
and 1440×900 in both themes, plus the server HTML of 17 pages with scripts off. It held: no horizontal scroll, no new console
or hydration error, every focus ring visible, nothing animates under reduced motion, metadata, JSON-LD, h1s, internal links
and the sponsored links (7 on each sampled product, same order, words and hrefs) identical, and the day theme's sub-4.5:1
text went from 2 to 4 items a page to none. Robots, both sitemaps (every listed URL 200 and indexable) and 404s (404) are
sound. Two faults it brought, fixed here:

- **Product pages: "Prices in" tabs.** Making the tab `inline-flex` (for the 40px height) dropped the space between the flag
  and the code ("🇺🇸US"). The tab gets `gap-1.5`, the same as the header's region chips.
- **Night theme: "no photo" labels.** The photo plate is near-white in both themes now, but a tile without a photo still drew
  its brand label in the night grey, 2.5:1 on white (12 tiles on a night search page). `.plate` (and the product page's white
  photo card, `.photo-white`) keep the day grey for that label, 5.4:1.

Noted, not changed: `/deals` (0.18 to 0.20) and `/popular` (0.10) shift on the fixture build because the one ad block reserves
its room and then folds away when the fixture has no ad tiles; the same before and after #41, and the ad block is frozen
until the 19 November recheck. Nothing paid, no URL and no metadata changed, so the 19 November clicks-per-placement recheck is
unaffected.
