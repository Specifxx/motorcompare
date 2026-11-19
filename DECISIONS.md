


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

## 2026-11-16: A small unpriced "Also on Amazon" line under each region's price table

The 2026-11-12/13 rule (Amazon row only with a real price) took Amazon buy clicks to zero on every site from 13 Nov (Amazon's own reports fell
with them), because almost no row has a live API price. Not a row: `AmazonAlso`, one line under a region's table on the product page, only where
Amazon's own listing was matched to this exact barcode (committed ASINs), unpriced, labelled paid, hidden when the priced row shows, never the
quick view, never ranked, best, a deal or an alert. Placement `also_amazon`. Read Amazon clicks per day against 7-12 Nov.

## 2026-11-16: The native ad block on guide pages

Amazon clicks fell to zero on 13 Nov (the priced-only rule), and the guides were the one content page without the page's single native
ad block (`InlineAds`: an eBay row and an Amazon row of tagged tiles, no price, browser only, height reserved). One block, after the guide's
content, once a page; same rules as everywhere (rel sponsored, never in the dock, never counted as a store). `tests/guide-ad-block.test.ts`.

## 2026-11-17: "Check on Amazon" is a row again, an ordinary last one

Owner: "even if there are no Amazon prices available, we should have an option to check on Amazon in our price rows." With no live
Amazon price `priceRows` adds an unpriced Amazon row (brand amazon, `check`: the item's own page where the daily ASIN pass matched this
barcode, else the tagged search) at the END of the store rows, on the product page and in the quick view. Never pinned, ranked, the best
price, a deal or an alert; a priced Amazon row still pins. It replaces the 2026-11-16 line under the table (`AmazonAlso`, removed).

## 2026-11-17: URL freeze, and no surprise navigation

Owner, from the Grok growth report (item 5): URLs are frozen and nothing navigates a visitor unasked. A repo-wide check found no
pop-under, no `window.open` on load, no cross-host redirect and no interstitial here. Rule added to CLAUDE.md: no mass path change
without a redirect map that 301s every old URL, agents never flip hosts (the one change in force is DexCompare to dexcompare.io), and
the only automatic navigation is a same-host market choice.

## 2026-11-17: Stores that match nothing say why (site loop)

The 16 Nov import read 20,000 listings from My Auto Parts, Partsology and Auto One, 6,000 from Wipers Direct, and matched none or one
of them (`meta.json` shows only a `noEan` count). The container cannot reach the stores, so the cause (vendor is the store's own name, an
internal SKU, no SKU) cannot be read from here. A store run that keys no listing now records up to six samples (`noKey`: brand | SKU | title)
in `meta.json`. Nothing about matching, pages or URLs changes; the next import tells the next run which rule to fix, with a real title in
`tests/partno.test.ts`. Backlog: fix those four stores' keys, then Penrite, Castrol, Motul, DBA and Century coverage.

## 2026-11-17: Fiverr first-time-shopper review of DexCompare, applied here (owner)

The owner bought a professional first-time-shopper QA review of DexCompare and asked for every finding that generalises to reach every site.
Applied here (the full reasoning is in DexCompare's DECISIONS.md, same date):

- **Cart hand-off:** the cart drawer opens with "You pay each store on its own site. We never take payment." (normal-size text, first thing in the
  drawer); "Total before postage" became "Estimated total (before postage)"; the add button's tooltip says you pay at the store. The label stays
  "Add to cart" (owner, 2026-11-14: a literal "Add to cart" on every row).
- **The quick view sets the tab title and description while it is open** and restores them on close (the tab used to keep the list's title).

## 2026-11-18: cart checkout opens every store or none (owner)

Checkout (`openAll`, `src/lib/cart-checkout.ts`) opens one blank tab per store inside the click, and only when every one opens does it send each to its store's own tagged link. If the browser refuses any, it closes the ones that opened, visits nothing, and the drawer shows the allow-pop-ups steps and a "Try again" button. Before, the first store opened and the rest were refused, which left the visitor with one tab. Chrome 157 on dexcompare.io and on url-opener.com (the owner's model, which does the same close-and-ask) both give one tab until pop-ups are allowed for the site; with them allowed, all open. No browser API grants that permission from a click, so the steps stay.


## 2026-11-18: Home pages rank items by demand (owner: "the most popular items should be on the homepage in that order")

The owner wants every site's home page to lead with the items most likely to earn a click, revenue and a purchase. Each home list
(shelf, grid, picks, deals, pre-orders, popular cards) is now ordered by `src/lib/home-rank.ts`, the same pure file in every repo:

- **Demand**, real numbers only: each item's product page views and buy clicks, last 28 days plus the last 7 again (recent counts
  twice), from Vercel Web Analytics through RiftCompare's public `/api/demand/<site>` (`src/lib/analytics/item-demand.ts` there; top
  100 product pages a window, `buy_product` events by product where a site sends them). A buy click weighs 20 views. Log scale, so
  one runaway item cannot take the list.
- **Value**, from the item's own facts: in stock and at how many stores, a paid row with a price, the price (commission is a share of
  it, on a soft curve), a release in the last 30/90 days or an open pre-order, a price under its usual.
- `score = value × (1 + log(1 + views + 20 × clicks))`.
- **Safe fallback:** under 30 views and clicks across a list, demand is ignored and value alone decides; equal scores keep the list's
  old order. `NEXT_PUBLIC_HOME_RANK=off` (Vercel variable) turns it off without a code change.
- **No feedback loop:** the 4th slot, and every 8th after, goes to the best-valued item with no demand yet, so a new item is seen
  before it can be clicked; the 7-day weight lets a leader fall when it stops being clicked.
- **Data path, no database:** the daily data job runs `scripts/pull-demand.sh <site> <file>`, which commits the demand file to
  `main` with no deploy marker (it rides the release). That file's git history is the log of what the ranking saw each day.
- Heroes stay words, search and ways in (owner, 2026-11-13): the ranking orders the lists, it adds no product to a hero.
- Measure: buy clicks per visitor sitewide and on home pages, the week before (11-18 Nov) against the two weeks after the release;
  a demand file under 30 views for a list means that list ran on the fallback and is read apart.
- Here: the home page's deals and "popular now" rows rank a 24-item pool by `/product/<slug>` views and value and show 8; "new in" stays newest first. Site key `motor`, written into the daily import's data commit.

## 2026-11-18: Phone bottom nav, opt-in first (owner)

The owner tried TCG Prices' bottom nav on his phone ("looks good … a bit of lag") and asked for it on every site, smoother.
This is that bar (`src/components/BottomNav.tsx`, the same file on every site that has it; this site's tabs and switch in
`src/lib/bottom-nav.ts`): Home, Search, Deals, Cart, Menu. Below 768px only, browser only (nothing in the server HTML, so SEO, the first paint and CLS are
untouched). It sits flush at `bottom: 0` and moves on `transform` alone; it never measures the address bar (the cause of
RiftCompare's deleted bar, 2026-09-18). The scroll handler reads `scrollY` and writes two attributes, nothing else: no layout
reads, no React re-render, no backdrop blur (each repaints every scroll frame on a phone). It hides on scroll down, returns on the
first 4px upward flick, and stays away while zoomed, typing, over a dialog, the menu or the open cart, over a buy bar, and over
any Add to cart button in its strip. The phone ad dock yields while it shows (`html[data-bottomnav]`): one bar at a time.
The menu tab clicks the element marked `data-bn-menu`. `BOTTOM_NAV` is the switch: "optin" (only `?bn=1`, kept in
localStorage) until this site passes the phone tests, then "on"; "off" is the rollback. `?bn=0` always opts a visitor out.
`tests/bottom-nav.test.ts` pins all of it.

## 2026-11-18: Phone bottom nav on for everyone (owner)

The opt-in build passed the phone tests (iPhone SE, Pixel 7, Z Fold cover: flush to the bottom, hides on scroll down, returns on
scroll up, hidden while typing, zoomed, over the cart or menu, never over Add to cart, CLS 0, no slower scrolling) and was checked
live with `?bn=1`, so `BOTTOM_NAV` is "on" (the owner asked for the bar on every site). `?bn=0` still opts a visitor out, and "off"
is the rollback. It ships with the next daily release, not its own build.

## 2026-11-18: Feedback asks: "Was this page useful?" in the footer, a /feedback page, counted by the daily triage (owner)

The owner: "We need more feedback so can we find a way to get more". One RiftCompare visitor's note (sort the movers by %
gain or loss) became a feature the same day, but across the network three weeks brought about 58 star ratings and fewer than
ten written notes. Rift's own record also holds "too many popups asking for my opinion", so every ask here is inline.

- `components/FeedbackAsk.tsx` (the same file on every site): one line at the top of the footer, "Was this page useful?
  Yes / No". The tap is sent at once (a vote alone counts); only then does an optional "What would make it better?" box
  open. Never a pop-up, nothing fixed or floating, hidden for the rest of the visit on a page already answered, and in no
  quick view (the Dex / MTG quick-view A/B, 20 Nov to 3 Dec, is untouched).
- `/feedback`: the full form (an idea, something wrong, something missing) and "You asked, we built it", the changes
  visitors' notes have led to; add a line there when a note leads to a change. noindex, linked from the footer and the menu.
- Both post to `/api/report` as kind `feedback` (`lib/reports-github.ts`). A note is an inbox file like any report; a bare
  vote is `votes/<site>/<day>/<time>-up|down-<rand>.json`, counted from its file name by RiftCompare's daily *Reports
  triage*, which now prints a 7-day feedback table per site and flags every note for a look. No email address is asked
  for or kept: the thanks shows the site's inbox for anyone who wants a reply.
- This site had no `reports` branch of its own (its report and feedback forms could not save), so its reports now file
  on RiftCompare's (`SITE_REPOS`: `Specifxx/TCGEmpire`, under `inbox/<site>/`), where the triage already reads.
## 2026-11-18: an eBay or Amazon row may carry the lowest price (owner)

The owner withdrew "eBay and Amazon are never the best price": a row that is genuinely the cheapest says so, whichever row it is. In
`priceRows` (`components/PriceTable.tsx`) a priced eBay or Amazon row strictly under the cheapest in-stock store, and not more than 25% under it
(`BEST_MAX_UNDER_STORES`: that is a wrong product, not a deal), takes the highlight and "Lowest price"; the cheapest store then loses its tint
and keeps "Lowest store price". Row order is unchanged (eBay, Amazon, other affiliate rows, then the stores). The alert feed, deals, JSON-LD and
list tiles still use the cheapest STORE price (alerts and structured data are not promises about an ad's price). Unpriced "Check" rows never win.
`tests/best-price-paid-rows.test.ts`. Disclosure and "How we pick stores" copy updated.

## 2026-11-18: the Amazon button is amber, and the quick view's "See full page" is a real button (owner)

Decision (owner): the Amazon row's button, priced and the unpriced "Check Amazon" search row alike, in every price list and quick view, is
Amazon amber (`.btn-amazon` in `globals.css`: #F5A524, hover #DC8A0B, 1px #B7791F border, dark #111 text in both themes) so it reads as
different from the site's own buy button and from eBay's. Only the colour changed: link targets, `rel="sponsored"`, tracking, the "Ad" and
"Paid link" labels, row order, prices, badges and the Cheapest logic are as they were. The quick view's pinned bottom link is now a button at
least 44px tall reading "See full page: price history and details" (it was the same link, slightly smaller, with shorter copy); it stays one
button, not two. `tests/amazon-button-quickview.test.ts`.
## 2026-11-18: Share for a deal (owner)

Owner: "share this link and get a free deal … it's all free, but we'll give you something else to look at if you share", for every
site. `ShareThanks.tsx`: half of browsers (`share_arm` in localStorage, `pickShareArm`) see "Share · get a deal" on the share
button; after a share completes (share sheet or copied link) a small card opens under the button, on the visitor's own tap and
closed with ✕, pointing to `/deals`. Nothing is withheld or gated; the other half is the control. Events `share { medium, arm }`
(two properties, Vercel's limit) and `share_unlock { medium }`. Read the share rate per arm after two weeks; keep it only if it
raises sharing.

## 2026-11-18: the amber of the Amazon button is not Amazon's own orange

The first cut used #FFA41C, which is Amazon's brand orange. Amazon's Associates agreement bars styling that could pass for Amazon, so the button is now a distinct, calmer amber (#F5A524, hover #DC8A0B, border #B7791F, dark text #111): still clearly different from the site's normal buy button, not Amazon's colour.
## 2026-11-18: The cart A/B: half of the visitors see no cart

Owner, 2026-11-18: "I never intended the cart to be like a very big feature … we cannot sustain click leaks." On OP Compare the
share of visitors who clicked a buy link fell from 20-31% (1-13 Nov) to 11-12% on 14-15 Nov, the day a labelled "Add to cart" went
on every price row, with visitors flat (Vercel); OP Compare and Compare Empire have the cart switched off. Here it is a test:
`cartArm()` in `lib/cart-list.ts` puts each visitor in localStorage `cart-arm` "on" or "off" (50/50; storage that fails is "off").
The "off" arm sees no Add to cart button, and no header or bottom-nav cart unless its cart already holds lines. Every `buy_click`
carries `cart_arm`. Verdict 2 Dec: buy clickers and paid buy clicks per arm (the arms are equal halves of visitors). Keep the cart
only if the "on" arm is not lower; otherwise `cartArm()` returns "off" for everyone. Not on Dex or MTG Compare (their quick-view
A/B runs to 3 Dec).

## 2026-11-18: a maker's own shop names its own brand (site loop)

The `noKey` samples from the 17 Nov import (PR #53) showed why big shops key nothing. Two kinds:

- **Makers' own shops** (Turbosmart USA 1,370 listings, DeatschWerks 1,855, AUXITO 1,542, Battery Tender, ANCEL): the
  vendor field is the shop's own name, which `listingBrand` reads as "a shop that put itself there" and drops, so a
  good part number (`TS-0301-3007`) got no brand and no key, while 1,373 products already carry `pn:turbosmart:`
  from retailers. Now a store marked `official` is its own maker (`makerOf`, `Store.brand` where the name says more:
  "Turbosmart USA" → "Turbosmart"). Order: a real vendor, then a known maker the title starts with (some official
  shops also resell, UroTuning), then the shop's maker. A part number still decides; nothing is matched on a title.
- **Own-label or unshared stock** (My Auto Parts: OEM wrecker parts with its own MAP SKUs; Partsology: its own
  rebuild kits; Wipers Direct: random SKUs, no vendor; Auto Paint HQ: mixed-to-order paint). No other shop sells the
  same thing under a shared number, so no key rule can or should match them. They stay read (they cost import time
  only) until a cull of zero-yield stores is worth a separate change.

## Deals page: share button and its own link preview (owner, 2026-11-18: "we need more shareable artefacts")

`/deals` gets a share button (medium `deals`, `utm_source=share&utm_medium=deals`) and `src/app/deals/opengraph-image.tsx`:
the guide card's look (`lib/og/guide-image.tsx`) titled with the page's own title, five rows of the biggest gaps between
the cheapest and the dearest store for the same product in the default region, from `dealsIn` (or, on a thin day, the
same `shareRows` rule over every product with two stores up). A static route drawn at the day's build, like every page.

## The weekly Hot 100 at /hot-100 — 2026-11-18

**What.** `/hot-100`, prerendered like every page, one chart per region (CSS shows the visitor's, `.rp-XX`): the products whose
cheapest orderable price rose most over the last seven days, biggest first, up to 100, each with its place on the chart seven days
earlier (▲ / ▼ / New). Pure `lib/hot100.ts` over the committed `history.json` and today's products. Two or more stores sell it in
the region today, a rise of 1% to under 50% (a bigger jump is a store selling out). A short week is the Hot 37, never padded
(RiftCompare's Hot 40 rule). Link preview: the site default for now.

**Why.** Owner, 2026-11-18: one stable URL per site to post on Reddit once a week as a link and title (tagged
`utm_source=reddit&utm_medium=social&utm_campaign=hot100-<site>-<date>`). Rides the daily release. `tests/hot100.test.ts`.

## 2026-11-18: The dock A/B: the phone ad dock stays up above the bottom nav for half of the visitors

Owner, 2026-11-18: "right above the nav bar, we should have those ads show up … very, very visible for mobile phone users." Since
the phone bottom nav went on (18 Nov) the eBay/TCGplayer dock (`AdDock.tsx`) yielded to it: one bar at a time, the dock only while
scrolling down. `dockArm()` in `lib/dock-arm.ts` puts each visitor in localStorage `dock-arm` "on" or "off" (50/50; storage that
fails is "off"). "On": the dock no longer yields to `html[data-bottomnav]`; it is lifted 57px (the nav's height) with `translate`
while the nav shows, so both bars are visible and neither covers the other (dock 64px + nav 57px, about 15% of a phone screen,
under Better Ads' 30% line). Every other dock rule stands: never on the first screen or a product page, yields to other ad units,
the footer, dialogs and the keyboard, ✕ for the visit, labelled Ad, rel sponsored. "Off": unchanged. Every `buy_click` carries
`dock_arm`. Verdict 2 Dec: buy clickers and paid buy clicks per arm. EPN's Network Agreement (Exhibit A §1.4, §2.5) puts any
promotional method it does not expressly permit under prior written approval; the dock has run since 2026-11-06, this changes only
when it shows. Not on Dex or MTG Compare (their phone A/B runs to 3 Dec).

## 2026-11-18: A plain store's best price gets a small "Best price" tag, not the green highlight

Owner, 2026-11-18: when the cheapest row is just a store that pays us nothing, do not colour it green (green ground and edge, bold
green sub line, accent price, buy-coloured button) because the loudest row on the page should not be the one that earns nothing.
`priceRows` (`PriceTable.tsx`) now marks that row `plainBest`: a small neutral "Best price" chip (`BestTag.tsx`) and the price in
the normal ink, with an "i" hint (title, aria-label, tap-to-show line on a phone) reading "Prices and stock change: also check
eBay", shown ONLY when the list has an eBay row, and naming only rows it has; it never says eBay is cheaper. When the cheapest row
is an affiliate or paid row (eBay or Amazon winning, or a store that pays us) it keeps the full highlight exactly as before.
Same on the product page and the quick view (one `PriceRows`). Unchanged: row order, sorting, `rel="sponsored"`, tracking, labels,
the hero price box (already neutral), deal and price-drop badges, JSON-LD, feeds, alerts. `lib/best-tag.ts`,
`tests/best-price-tag.test.ts`. Verdict: paid clicks per 100 buy clicks before and after (`buy_click` events, `source` paid or
not), because the green on a non-paying store was pulling clicks from our paid rows.

## 2026-11-18 — The bottom nav is a floating pill, and closing the cart gives it back

Owner, 2026-11-18: "after you open the cart and then you close it, the little bottom navigation disappears", and the nav should be
"the little football field kind of shape … floating above the bottom a little bit" (Catchback's), with the eBay / TCGplayer ad dock
sitting on top of it.

- **The bug.** A header that mounts the cart button twice (desktop and phone copies) mounted two `CartDrawer`s. Only one draws, but both
  ran the scroll-lock effect: the second saved the first's `overflow: hidden` as "previous" and put it back on close, so the page stayed
  locked and `BottomNav` (and the ad dock) read it as an open dialog forever. Now only the drawer that draws locks scroll or checks
  live prices (`mounted` in both effects). Sites with one header button never hit it, but carry the same guard.
- **The pill.** Geometry only, colours stay the site's own: 12px from each side (at most 460px wide), rounded ends, a soft shadow, and
  `bottom: var(--bn-gap)` where `--bn-gap` is `max(8px, safe-area − 14px)`, so it floats above the home indicator without the old full
  safe-area band. `--bn-h` (54px) and `--bn-space` (height + gap) are on `:root`; the stacked ad dock, nudges and toasts sit
  `var(--bn-space)` + a small gap up, and the body's bottom padding follows it. Hidden, it slides fully off-screen (transform only, CLS 0).
- **Measured** (local build, dock stacked): Pixel 7 412×915 nav + dock take 129px (14.1%); iPhone 15 393×852 with a 34px safe area
  143px (16.8%); iPhone SE 375×667 129px (19.3%); the old flush bar took about the same plus the full safe area.

## 2026-11-19: a failed store's prices are carried for 72 hours, not forever

A store that failed to read kept its previous offers so one timeout would not drop a product under the two-store rule.
That carry had no end: each run copied the last file's rows forward, so a store blocked for days kept showing its old
prices "in stock" (ScentCompare, 18 Nov: 104 offers from two stores failing for up to 6 days, 13 of them the cheapest row)
under a page that said "Checked today". Now every store records its last good read (`lastOkAt` in `meta.json`), and its
offers are carried only while that read is under 72 hours old (`src/lib/import/carry.ts`, `tests/carry.test.ts`), the
same limit the card sites use. A store with no known good read is never carried. The import also pushes a store's
listings with a loop, not a spread: a store with 100k+ variants overflowed it ("Maximum call stack size exceeded",
three MotorCompare stores unread since at least 14 Nov). The home page's "Checked … ago" is now corrected in the browser
(`LiveAgo`): worked out at build, it froze for the whole release.

## 2026-11-19: fonts through next/font with display "optional", and a hero that slides instead of fading

Speed pass before Google's core update ends (owner, 2026-11-18: "speed and mobile"). Lighthouse mobile on the live pages
measured layout shift 0.07 to 0.13: the text was laid out in the fallback face, @fontsource's `font-display: swap` then
dropped the web font in, the lines re-wrapped and everything below moved. The fonts are now the same latin variable files
bundled in `src/app/fonts` (OFL) and loaded through `next/font/local`: preloaded, drawn first in a fallback sized to
match, and `display: "optional"`, so a face that is not there in time is never swapped in under a reader. The card
sites made the same choice for the same reason. Only the latin subset ships: other scripts use the fallback face.
The home hero's entrance (`.mo-enter`, where the site has one) also no longer fades from opacity 0: a browser does not
count an element as painted while it is invisible, so the fade held the largest paint back ~1.1 s
(`tests/hero-lcp.test.ts`).

## Who runs it and what it costs, on /about (2026-11-19)

Core-update quality pass (owner, 2026-11-19: remove ads that can hurt indexing, place the rest lower). MotorCompare's one
ad block already sits below each page's content and its footer is short (about 26 links), so neither moved. /about now
says who runs it (Bill and George), how AI tools are used, and what the sites cost (about A$790 a month, our books, 30
days to 15 Nov 2026).

## 2026-11-19: The dock A/B ends: the phone ad strip sits above the bottom nav for everyone (owner)

The owner, 2026-11-19: "I want it for all the sites, so people have like an ad on their phone right there." The dock A/B of
2026-11-18 (`lib/dock-arm.ts`) ends early with its "on" arm for every visitor: the eBay (and, where the site has it, TCGplayer) dock is
stacked just above the phone bottom nav whenever it shows, instead of taking turns with the nav. Its own rules are unchanged: after a
scroll, labelled "Ad", ✕ for the visit, never Amazon. `dock_arm` on buy_click now always reads "on".
## 2026-11-19 — A calmer home page on a phone

Owner, 2026-11-19: "way too much going on in the mobile version of the home page" (KaeYoung first; the same pass here
and on ScentCompare). Below md the home page is now the headline, one line and the part-code search (kept: it explains
how to search by the code on the old part); then "Shop by part", the popular shelf and the savings shelf of the
visitor's region, each ONE sideways row (`rail` on `TileGrid`, `.phone-rail` in globals.css); the ad block, brands (one
sideways row) and the questions. The count chips, the two hero products, "New arrivals", "How it works" and the guide
list show from md up only; the menu and footer reach them. Measured on a 390px phone: 12,271 px tall before, 5,406
after. Layout only: the server HTML, URLs, titles, headings and structured data are the same at every width (Google's
core update was still rolling out), and the desktop page is unchanged. Before adding a block to the phone home page,
say what it replaces.

## 2026-11-19: Search-engine-first audit after the November 2026 core update

Google's core-update guidance asks whether a page exists mainly to help people or mainly to catch a search, and names
content "spread across a large network of sites" and re-dating pages to look fresh as warning signs. What changed here:

- **Seasonal sale pages.** The same template put Boxing Day, January sales and Lunar New Year (and Valentine's Day where
  a site has it) pages on every Compare site, indexed all year, each listing the same deals as the Black Friday page.
  `saleIndexable` in `lib/sale-seasons.ts`: Lunar New Year and Valentine's Day pages are never indexed, Boxing Day and
  January sales only from three weeks before the homepage links them until a week after they end; out of season they are
  noindex, follow and out of the sitemap (`withoutOffSeasonSales`). The URLs stay live all year (URL freeze).
- **Product FAQ.** "Where is X cheapest in <region>?" was one question per region, the same sentence reworded for each
  country. It is now one question whose answer names every region.
- **Honest sitemap dates.** About, methodology, store-listing and similar prose pages no longer carry a lastmod of the
  latest import: their words do not change with prices.

Black Friday and Cyber Monday pages are unchanged (in season). Judge the effect on 1 to 8 Dec against 3 to 9 Nov.

## 2026-11-19 — Idle: one import and one release a week

Owner, 2026-11-19: "figure compare and motorcompare have earnt 0 dollars maybe they were bad ideas". The Monday report of
16 Nov: A$0.00 earned in 30 days, 141 visitors and 6 buy clicks in a week, 0 pages in Bing, and A$18.93 of Vercel in its
first costed week, the most of any small site. The site stays live and unchanged (hosts, URLs and pages untouched), but
its agent loop is off and `import.yml` and the fallback `production-deploy.yml` run on Mondays only, so it builds once a
week and spends its eBay calls once a week instead of daily (the 3,300 a day on Cyberpunk Compare's keyset are free for
the owner to move). The ops monitor's age checks allow a week and a day before amber and nine days before red.
Undo by restoring the two daily crons and the old thresholds in `scripts/ops-monitor.ts`.

## 2026-11-19: [urgent] needs eight hours too: a network ceiling of 57 builds a day

[urgent] in a commit subject used to skip the 12-hour gap altogether. On 17 and 18 Nov the network built production 94
and 137 times a day, almost all of them [urgent] (about eight builds per site per day), and Vercel reached $10.27 a day
against the $6 cap: every build rewrites the ISR cache and burns build CPU. `scripts/vercel-ignore-build.sh` now builds an
[urgent] commit only when production last built at least `URGENT_MIN_GAP_HOURS` (8) ago; a plain [deploy] still waits 12.
So one site builds at most three times a day, and the 19 production projects at most 57 a day (normally about 25).
Batch urgent changes into one release instead of one per merge. Pinned by `tests/deploy-gap.test.ts`. The same change
went to every Compare site's gate.
