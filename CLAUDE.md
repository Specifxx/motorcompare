# Working in this repo

MotorCompare (motorcompare.app, bought 2026-11-10; motorcompare.vercel.app 308-redirects to it, "The right part. The best
price.") compares car parts prices across real parts stores: engine oil, batteries, wiper blades, globes,
filters, spark plugs, brakes, fluids, car care and accessories. **Australia first, expanded to the US, UK, Canada, NZ and EU on 2026-11-10** (owner); the default region is the US. A copy of
ScentCompare's static engine (`Specifxx/scentcompare`, itself KaeYoung's and FigureCompare's), started 2026-11-08. It
is a copy, not a synced sister: port fixes by hand. Read `README.md`, then `DECISIONS.md` (entries before 2026-11-08
are the engine's history, from KaeYoung and ScentCompare).

The canonical URL is ONE value: `SITE.url` reads `NEXT_PUBLIC_SITE_URL`, then Vercel's production host, then
`https://motorcompare.app`.

## A fully static site: data in GitHub, pages on Vercel's CDN

- The daily import (`.github/workflows/import.yml`: `scripts/import.ts`, then `scripts/ebay-import.ts`) writes
  `data/public/*.json` and commits it to `main` with `[deploy]` in the subject: the one production build a day.
- Every page is prerendered at that build (`generateStaticParams` + `dynamicParams = false`); product pages and
  `/q/<slug>` beyond the top 500 render once on first visit and are kept until the next release. No database, no
  middleware, no ISR timer, no page reads cookies, headers or `searchParams`, every `next/link` has
  `prefetch={false}`, image optimisation is off. `tests/cost-rules.test.ts` pins it.
- The only functions: eBay's account-deletion hook, the review form (`/api/reviews`, saved to the public `reviews`
  branch) and the price report form. Never write anything private to `data/`; never edit `data/` by hand.
- `REGIONS` is US, UK, CA, AU, NZ, EU; a region shows only once it has a store (`lib/regions.ts` `ACTIVE_REGIONS`). Default US.

## Deploys are gated: never add `[deploy]` to a commit subject

**One production build per 12 hours, and production only (owner, 2026-11-02: Vercel spend capped at $5–6 a
day).** `scripts/vercel-ignore-build.sh` skips a `[deploy]` commit within 12 hours of the last production
deployment (it rides the next release); `[urgent]` in the subject overrides that, only when the owner says
so. `vercel.json` disables every branch except production (`"**": false`), so no preview is ever built.
Never dispatch a manual release just to ship a merge. DECISIONS.md, 2026-11-02.

"Push to prod" means land on `main` and ride the next release; use *Production deploy* (or `[deploy]`) only when the
owner says it is urgent, and say so. `claude/*` and `ccr-*` branches never deploy.

## Matching: brand + part number, or the barcode, or nothing

- A listing is matched by its brand + the maker's part number read from the SKU (`src/lib/partno.ts`, key
  `pn:<brand>:<PN>`), else by a valid EAN-13 or UPC-A (`src/lib/ean.ts`). No brand and part number and no barcode, no
  listing. `partNumber` may only refuse: a word, digits alone, too short or too long is no key. Never match on a
  title: a 1 L and a 5 L, a 600 mm and a 650 mm blade, N70ZZ and N70ZZL batteries all look alike. Every rule changed
  gets a case in `tests/partno.test.ts`.
- The title decides only whether a listing belongs (`src/lib/title.ts`): used, reconditioned, exchange/core charges,
  damaged, store-made bundles, mystery boxes and apparel are refused. It also gives the category, the size (L, ml,
  mm) and the fit code a buyer can read off the old part (`partCode`: oil grade, battery code, globe code, wiper
  length, filter number). Every rule changed gets a store title in `tests/title.test.ts`.
- A product is listed when 2+ stores can sell it today in one region (`lib/focus.ts` `comparable`, 2026-11-10); only 3+ stores
  (or 2+ in two regions) is indexable and in the sitemap (`lib/index-tiers.ts`). Categories are title rules in `lib/title.ts`.
- A product gets a page only when 2+ stores sell it. With 3+ stores, prices under 40% or over 250% of the median are
  dropped. Mirrors count once. The brand is the vendor, folded by `src/lib/brand.ts`.
- Real stores only, never marketplaces. Stores live in `src/content/stores.ts` (found with `probe-stores.yml`);
  read two at a time; a 403, 429 or captcha stops that store (never worked around). Each store's own currency; never converted.
- Fit: make-and-model fitment is NOT claimed anywhere. A page shows the printed code and tells the buyer to check it
  against the old part (and the store's fitment list for brakes).

## Money

- Affiliate tags are added at build (`src/lib/affiliate.ts`): `motor-au-<placement>-<ean>` in EPN `customid` and
  Amazon `ascsubtag`; stores get `utm_source=<SITE.domain>`.
- Paid rows sit in a product's price table, above the stores, labelled "Ad"/"Paid link", rel sponsored, never a
  store, never "the cheapest"; commission never decides order. eBay (EPN campaign 5339155912, hard-coded), Amazon AU
  (tag `compareempire-22`, hard-coded), and the chains in `PARTNERS`: Supercheap Auto (Commission Factory, once
  `AFF_SUPERCHEAP` holds the tracking template), Repco and Sparesbox, all shown now as plain unpaid search links.
- **One native in-content ad block per page, and the phone dock** (owner, 2026-11-13, in place of the side rails, which are
  gone: never re-add rails or a second block). `InlineAds.tsx` (`lib/side-rails.ts`, static `/rails/<region>`; `SITE.sideRails`
  is its one off switch): a full-column-width section in the site's own card, hairline and text tokens with a small "Ad" label,
  an eBay row first and an Amazon row second, up to ten larger tiles each, scrolling sideways. BELOW the main content (home:
  between sections, never the hero; product page: under the price table; lists: after the grid), never beside a buy button or
  above a price, never fixed or floating, no side space. Browser only, height reserved in CSS (CLS 0); Amazon tiles are tagged
  links with NO price; every link rel sponsored under the tags `inline-ebay` / `inline-amazon` (`motor-<region>-…`). On phones
  (below 768px) the eBay tiles also go to the phone dock (`AdDock.tsx`: after a scroll, never on a product page; never Amazon).
  No AdSense, no pop-ups, no interstitials, no accounts.
- eBay listings come only from `scripts/ebay-import.ts` in GitHub Actions (Browse API by GTIN, new, Buy It Now,
  sellers local to each region). The daily calls are split by `EBAY_REGION_SHARE` (owner, 2026-11-10: US 40%, AU 30%, UK 15%, CA 10%, NZ and EU 2.5% each; unused share goes back to the rest). It shares Cyberpunk Compare's keyset (owner, 2026-11-10: MotorCompare 3,300,
  BandaiCompare 1,000, Cyberpunk Compare 600 a day): `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET` are Cyberpunk's values, a no-op
  until they exist; `EBAY_MAX_DAILY_CALLS` (3,300) is a ceiling `EBAY_DAILY_CAP` can only lower. Never raise it without the owner.
- Amazon's own price on the Amazon row: as ScentCompare (`scripts/amazon-asins.ts`, `scripts/fetch-amazon-prices.ts`,
  `lib/amazon-live.ts`), credentials `AMAZON_CREATORS_AU_*`; never committed, never a sort, badge or deal.
- Keys and variables are set by the owner's PowerShell secrets script (GitHub secrets + Vercel), never by hand.

## Design

A clean workshop look: steel greys, one signal orange (`--accent`), Barlow Condensed headings and Inter text
(fontsource), flat SVG drawings of generic parts (`src/components/Art.tsx`), never a maker's own packaging or logo.
The token names (`--peach`, `--butter`…) are the engine's. The icon is the spanner tag (owner, 2026-11-08: `src/app/icon.svg`;
the other options are in `docs/icon-options/`).

## The site watches itself

`ops-monitor.yml` runs `scripts/ops-monitor.ts` every three hours; a failing check fails the run and GitHub emails
the owner. When you add a scheduled job, an external API or anything with a limit, add a check there.

## Checks

```
npm run typecheck
npm run lint
npm test
SC_DATA_DIR=tests/fixtures/data npx next build   # every page prerenders against the fixture
```

Record non-obvious decisions in `DECISIONS.md` (newest at the bottom).
