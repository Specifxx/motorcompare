// Which product pages ask to be indexed (and go in the sitemap). Family lesson
// (seo-split-pages, index tiers on MTG/Dex Compare): thin pages dilute a new
// domain, so a page earns its place by being worth landing on.
//   indexed: some region has 2+ stores AND someone can order it today
//   noindex, follow: everything sold out everywhere (the page stays for visitors)
//   sitemap (first tier, 2026-11-03): indexed AND widely stocked, i.e. 3+ stores in
//     one region or 2+ stores in two regions. Stores stock what sells, so this is the
//     demand proxy until Search Console has data. Products outside it stay indexable
//     and linked from their category and brand pages; only the sitemap leaves them
//     out. Widen it (inSitemap -> isIndexable) once Search Console shows it indexed.
import { SITE } from "@/site";
import { widelyStocked } from "./focus";
import type { Product } from "./types";

/** A category hub with fewer products than this is noindex and out of the sitemap (wiper blades and fluids had none at launch). */
export const CAT_MIN_INDEXED = 3;

export function isIndexable(f: Product): boolean {
  const orderable = Object.values(f.offers).some((o) => o?.some((x) => x.st !== "out"));
  const compared = Object.values(f.offers).some((o) => (o?.length ?? 0) >= SITE.minStoresPerRegion);
  // Two-store pages are listed for visitors (lib/focus.ts comparable) but Google is only asked for the widely stocked ones.
  return orderable && compared && widelyStocked(f);
}

/** The first sitemap tier: indexable and stocked widely (DECISIONS.md 2026-11-03). */
export function inSitemap(f: Product): boolean {
  if (!isIndexable(f)) return false;
  const counts = Object.values(f.offers).map((o) => o?.length ?? 0);
  return counts.some((n) => n >= 3) || counts.filter((n) => n >= SITE.minStoresPerRegion).length >= 2;
}

/** How many product pages (and quick-view files) the daily build writes (DECISIONS.md 2026-11-06, "Build only the
 *  top product pages"). The rest render on their first visit and are kept until the next release. */
// 100 (2026-11-14, Vercel cost): a prebuilt page of this dynamicParams route is an ISR write at every release (2 to 37
// 8 KB units each, ~16,000 units in 12 hours), whether or not anyone opens it before the next one. The rest render on
// first visit, as before.
export const PREBUILT_PRODUCTS = 100;

/** The products prerendered at build: the most widely stocked in the sitemap tier. */
export function prebuiltProducts(all: Product[]): Product[] {
  const stores = (f: Product) => Object.values(f.offers).reduce((n, o) => n + (o?.length ?? 0), 0);
  return all
    .filter(inSitemap)
    .sort((a, b) => stores(b) - stores(a) || a.slug.localeCompare(b.slug))
    .slice(0, PREBUILT_PRODUCTS);
}

/** Product pages the sitemap lists (SEO audit 2026-11-07, DECISIONS.md "The sitemap lists a lean core"): the most
 *  widely stocked of the prebuilt pages. The rest stay indexable and linked from their category and brand pages; only
 *  the sitemap leaves them out, so a young domain's crawl goes to pages worth ranking. Widen once Search Console shows
 *  the core mostly indexed. */
export const SITEMAP_PRODUCTS = 300;

export function sitemapProducts(all: Product[]): Product[] {
  return prebuiltProducts(all).slice(0, SITEMAP_PRODUCTS);
}

/** Where a product's links point. A page Google is not asked to index is linked as /p/<slug>, which next.config.js
 *  rewrites to the same page and robots.txt keeps crawlers out of: every crawler visit to one of ~33,000 noindex
 *  pages was an ISR render and write after each release (Vercel cost, 2026-11-14). Visitors see the same page. */
export function productPath(f: Product): string {
  return isIndexable(f) ? `/product/${f.slug}` : `/p/${f.slug}`;
}
