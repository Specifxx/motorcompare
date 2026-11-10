// What MotorCompare lists (the low-traction cull, owner 2026-11-07: "any products that are not trendy, or very low traction or
// conversion, we probably want to get rid of", as Compare Empire's focus cull did). DECISIONS.md, 2026-11-07.
//
// The merge (lib/merge.ts) gives a product a page when two stores in one region list it, in stock or not. On 2026-11-07 that was
// 37,527 products; 14,674 had no region with two stores selling today, and Search Console had no data yet (the domain is days
// old). Stores stock what sells, so widely stocked is the demand proxy (the sitemap's first tier, inherited from KaeYoung):
// a product is listed when, counting stores that can sell it today, one region has three or more or two regions have two or more,
// or when Search Console shows people finding its page. ≈37,500 → 12,600.
//
// Applied by scripts/import.ts after the merge: products.json, the eBay pass, search, lists and the sitemap only see what is
// listed; history.json keeps every product, so one that qualifies again returns with its chart. A culled slug's URL 301s to its
// category (data/public/culled.json, lib/culled.ts). PURE (tests/focus.test.ts).
import type { Product } from "./types";

export const DEMAND_MIN_IMPRESSIONS = 10;

/** Product slugs with real search demand, from the `demand` branch's gsc-pages.json (paths like /product/<slug>). */
export function demandSlugs(pages: Record<string, number[]>): Set<string> {
  const out = new Set<string>();
  for (const [path, [clicks = 0, impressions = 0]] of Object.entries(pages)) {
    const m = /^\/product\/([^/]+)$/.exec(path);
    if (m && (clicks > 0 || impressions >= DEMAND_MIN_IMPRESSIONS)) out.add(decodeURIComponent(m[1]));
  }
  return out;
}

/** Stocked widely today: 3+ stores that can sell it in one region, or 2+ in two regions (the sitemap and indexing tier). */
export function widelyStocked(p: Pick<Product, "offers">): boolean {
  const counts = storesSelling(p);
  return counts.some((n) => n >= 3) || counts.filter((n) => n >= 2).length >= 2;
}

/** Listed in search and browsing: 2+ stores can sell it today in one region (owner, 2026-11-10: the enthusiast review found
 *  the 3-store cull hid 14,739 parts a shopper searches for by name, such as a Turbosmart wastegate sold at two stores).
 *  Two-store pages are noindex and stay out of the sitemap (lib/index-tiers.ts): visitors reach them, Google is not asked to. */
export function comparable(p: Pick<Product, "offers">): boolean {
  return storesSelling(p).some((n) => n >= 2);
}

function storesSelling(p: Pick<Product, "offers">): number[] {
  return Object.values(p.offers).map((o) => new Set((o ?? []).filter((x) => x.st !== "out").map((x) => x.s)).size);
}

/** The listed products, and every culled slug → its category key (its URL 301s there). */
export function focusCatalog(products: readonly Product[], demand: ReadonlySet<string>) {
  const listed: Product[] = [];
  const culled: Record<string, string> = {};
  for (const p of products) {
    if (demand.has(p.slug) || comparable(p)) listed.push(p);
    else culled[p.slug] = p.cat;
  }
  return { listed, culled };
}
