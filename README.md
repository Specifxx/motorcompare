# MotorCompare

**The right part. The best price.** Compare car parts prices across real Australian parts stores: engine oil,
batteries, wiper blades, globes, filters, spark plugs, brakes, fluids and car care. Matched by the barcode on the
box, size by size, checked every day. Built on ScentCompare's static engine (`Specifxx/scentcompare`), 2026-11-08.
Live at **motorcompare.app** (motorcompare.vercel.app redirects to it).

## How it works

```
GitHub Actions, daily 06:11 UTC (import.yml)
  every store in src/content/stores.ts (Shopify products.json or the WooCommerce Store API, 2 at a time,
    ~1 request a second)
  → one listing per variant with a valid EAN-13 or UPC (src/lib/ean.ts, src/lib/import/shopify.ts)
  → refuse used, reconditioned, exchange, damaged, bundles (src/lib/title.ts); category, size, fit code, brand
  → one product per barcode, kept when 2+ stores sell it (src/lib/merge.ts)
  → eBay Browse by GTIN, budgeted (scripts/ebay-import.ts; 600 calls a day of Compare Empire's shared keyset, off until its keys are set)
  → data/public/{products,history,ebay,meta}.json, data/state/*
  → commit to main with "[deploy]" in the subject → one Vercel build a day
```

* **No accounts, no database.** Every page is prerendered at the daily build from the committed JSON; search is a
  static `/search-index.json`.
* **Paid links**: eBay, Amazon AU and the Supercheap Auto / Repco / Sparesbox search rows sit above the store prices,
  labelled. They never count as a store or "the cheapest". No ad banners at launch (`SITE.sideRails`).
* **Deploys are gated** (`scripts/vercel-ignore-build.sh`): production builds only for `[deploy]` in the subject.
* **More stores**: add hosts to `probe/candidates.txt` on a `claude/*` branch; `probe-stores.yml` reads them and
  commits `probe/results.json` and `probe/summary.md`.
* **Monitoring**: `ops-monitor.yml` every three hours; a failure emails the owner through GitHub.

## Pages

Home, `/product/<slug>` (every store's price, pinned eBay/Amazon/chain rows, the fit code, price history, FAQ),
`/<category>` (oil, batteries, wipers, globes, filters, plugs, brakes, fluids, care, accessories), `/brands`,
`/deals`, `/new`, `/popular`, `/stores`, `/search`, `/basket`, `/about`, `/disclosure`, `/privacy`, `/terms`.

## Run locally

```
npm install
SC_DATA_DIR=tests/fixtures/data npm run dev        # synthetic fixture (npx tsx tests/fixtures/make-fixture.ts)
STORES=<store id> npx tsx scripts/import.ts        # a real import of one store
```

Checks: `npm run typecheck`, `npm run lint`, `npm test`.
