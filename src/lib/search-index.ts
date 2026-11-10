// Builds the rows of /search-index.json (lib/browse.ts IndexRow), at build time.
import { REGIONS } from "@/site";
import { brandPages, getProducts } from "./data";
import { lowestOrderable } from "./history";
import { popularity, reviewsOf } from "./ratings";
import type { IndexRow } from "./browse";
import { partNoOf } from "./partno";
import type { Product } from "./types";

/** Search-only words: the part number, the OE numbers the stores list and the cars the stores quote ("Toyota Landcruiser"). */
function extraOf(f: Product): string {
  const out = [partNoOf(f.ean)?.toLowerCase() ?? "", ...(f.oe ?? []).slice(0, 4).map((x) => x.toLowerCase())];
  const seen = new Set<string>();
  for (const lines of Object.values(f.fit ?? {})) {
    for (const w of lines.join(" ").toLowerCase().split(/[^a-z0-9]+/)) if (w.length >= 3 && seen.size < 14) seen.add(w);
  }
  return [...out, ...seen].filter(Boolean).join(" ");
}

export function indexRows(): IndexRow[] {
  const pages = brandPages();
  return getProducts().map((f) => {
    const prices: IndexRow[4] = {};
    for (const r of REGIONS) {
      const low = lowestOrderable(f.offers[r.code]);
      if (low) prices[r.code] = low.p;
    }
    const rv = reviewsOf(f);
    return [f.slug, f.name, f.cat, f.ean, prices, f.brand, f.b && pages.has(f.b) ? f.b : "", rv ? Math.round(rv.avg * 10) : 0, rv?.n ?? 0, Math.round(popularity(f) * 10) / 10, f.first, extraOf(f)];
  });
}
