// Turns every store's listings into products: one product per barcode, offers
// grouped by region, a product kept only when one region has enough stores.
// Pure, so tests/merge.test.ts can pin every rule.
import { REGIONS, SITE, type CatKey, type RegionCode } from "@/site";
import { STORE_BY_ID } from "@/content/stores";
import { FIT_MAX_STORES } from "./fitment";
import { MATCH_SPECS, matchSpecs } from "./specs";
import { categoryOf, listingAmounts, pickName, readTitle, sizesConflict, tidyName, type Amount, type TitleInfo } from "./title";
import { brandName, brandSlug, canonicalKey, listingBrand } from "./brand";
import { slugify } from "./slug";
import { partNoOf } from "./partno";
import type { Listing, Offer, Product } from "./types";

const STOCK_RANK = { in: 0, out: 1 } as const;

export function median(xs: number[]): number {
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Stores that are one shop under two names (a franchise's second domain on
 * the same Shopify stock) would count twice toward the two-store rule. Within
 * a region, a store whose barcode-and-price pairs are at least 80% another
 * store's (5+ listings) is a mirror: the first store in `order` keeps its
 * listings, the mirror's are dropped. Returns the mirrors as id → kept id.
 */
export function dropMirrors(listings: Listing[], order: string[]): { listings: Listing[]; mirrors: Record<string, string> } {
  const keys = new Map<string, Set<string>>();
  const region = new Map<string, string>();
  for (const l of listings) {
    if (!keys.has(l.store)) keys.set(l.store, new Set());
    keys.get(l.store)!.add(`${l.ean}:${l.cents}`);
    region.set(l.store, l.region);
  }
  const rank = (id: string) => (order.indexOf(id) + 1 || order.length + 1);
  const ids = [...keys.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const mirrors: Record<string, string> = {};
  for (let i = 0; i < ids.length; i++) {
    const a = ids[i];
    if (mirrors[a]) continue;
    for (const b of ids.slice(i + 1)) {
      if (mirrors[b] || region.get(a) !== region.get(b)) continue;
      const A = keys.get(a)!;
      const B = keys.get(b)!;
      if (Math.min(A.size, B.size) < 5) continue;
      let shared = 0;
      for (const k of B) if (A.has(k)) shared++;
      if (shared >= 0.8 * Math.min(A.size, B.size)) mirrors[b] = a;
    }
  }
  return { listings: listings.filter((l) => !mirrors[l.store]), mirrors };
}

/** Offers in display order: orderable first, cheapest first. */
export function sortOffers(offers: Offer[]): Offer[] {
  return offers.slice().sort((a, b) => STOCK_RANK[a.st] - STOCK_RANK[b.st] || a.p - b.p || a.s.localeCompare(b.s));
}

/**
 * Drop prices that cannot be the same new product: with three or more stores,
 * anything under 40% or over 250% of the median is a misfiled listing (a
 * single 10 ml filed under the 100 ml's barcode), a bundle or a reseller
 * markup. With two, nothing can be judged, so
 * both stay.
 */
export function saneOffers(offers: Offer[]): Offer[] {
  if (offers.length === 2) {
    // Two prices more than three times apart cannot both be the same pack
    // (a single sheet and the box of ten under one barcode, a mini and the
    // full size). Neither can be told right, and a wrong price is worse than
    // a missing one, so neither is shown in that region.
    const [lo, hi] = offers.map((o) => o.p).sort((a, b) => a - b);
    return hi > lo * 3 ? [] : offers;
  }
  if (offers.length < 3) return offers;
  const med = median(offers.map((o) => o.p));
  return offers.filter((o) => o.p >= med * 0.4 && o.p <= med * 2.5);
}

/**
 * Listings under one barcode whose titles name different packs (a 50 ml and a
 * 100 ml, one sheet and ten) are not all the same product: a store misfiled
 * one. The size most stores name wins and the others are dropped; when two
 * sizes are named by as many stores each, nobody can tell which is right and
 * the barcode is left out. Listings whose title names no size stay.
 */
export function sameSize<T extends { l: Listing }>(rows: T[]): T[] {
  let kept = rows.map((r) => ({ r, as: listingAmounts(r.l.title) }));
  for (const dim of ["amount", "count"] as const) {
    const clusters: { a: Amount; stores: Set<string> }[] = [];
    for (const { r, as } of kept) {
      const a = as.find((x) => x.dim === dim);
      if (!a) continue;
      const c = clusters.find((x) => !sizesConflict(x.a, a));
      if (c) c.stores.add(r.l.store);
      else clusters.push({ a, stores: new Set([r.l.store]) });
    }
    if (clusters.length < 2) continue;
    clusters.sort((a, b) => b.stores.size - a.stores.size);
    if (clusters[0].stores.size === clusters[1].stores.size) return [];
    const win = clusters[0].a;
    kept = kept.filter(({ as }) => {
      const a = as.find((x) => x.dim === dim);
      return !a || !sizesConflict(win, a);
    });
  }
  return kept.map((x) => x.r);
}

/**
 * Listings under one part key whose titles state a different dimension or rating (a 600 mm and a 650 mm blade, a
 * 12 V and a 24 V globe, a front and a rear pad, 5W-30 and 5W-40) are not all the same part. The value most stores
 * state wins and the others are dropped; a tie leaves the part out, because a wrong part on a comparison is worse
 * than a missing one (owner, 2026-11-09). Listings that state no value for a spec stay.
 */
export function sameSpecs<T extends { l: Listing; info: { cat: CatKey } }>(rows: T[]): T[] {
  let kept = rows.map((r) => ({ r, m: matchSpecs(r.l.title, r.info.cat) }));
  for (const label of MATCH_SPECS) {
    const by = new Map<string, Set<string>>();
    for (const { r, m } of kept) {
      const v = m[label];
      if (v) by.set(v, (by.get(v) ?? new Set()).add(r.l.store));
    }
    if (by.size < 2) continue;
    const ranked = [...by.entries()].sort((a, b) => b[1].size - a[1].size);
    if (ranked[0][1].size === ranked[1][1].size) return [];
    const win = ranked[0][0];
    kept = kept.filter(({ m }) => !m[label] || m[label] === win);
  }
  return kept.map((x) => x.r);
}

export interface MergeState {
  /** ean → slug, kept forever so a URL never changes */
  slugs: Record<string, string>;
  /** ean → first seen date */
  first: Record<string, string>;
}

function mode<T extends string>(xs: T[]): T | null {
  const c = new Map<T, number>();
  for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;
}

export function mergeListings(listings: Listing[], state: MergeState, today: string): Product[] {
  const byEan = new Map<string, Listing[]>();
  for (const l of listings) {
    const list = byEan.get(l.ean) ?? [];
    list.push(l);
    byEan.set(l.ean, list);
  }
  // One spelling per brand across the whole catalogue ("9WISHES" on every
  // product, not "9wishes" on some): the brand list's, else most listings'.
  const spellings = new Map<string, string[]>();
  for (const l of listings) {
    const b = listingBrand(l.vendor, l.title, STORE_BY_ID[l.store]?.name ?? l.store);
    const k = b ? canonicalKey(b) : "";
    if (k) spellings.set(k, [...(spellings.get(k) ?? []), b!]);
  }
  const spelling = new Map([...spellings].map(([k, v]) => [k, brandName(k, v)]));
  const usedSlugs = new Set(Object.values(state.slugs));
  const slugOwner = new Map<string, string>();
  const out: Product[] = [];
  for (const [ean, all] of byEan) {
    const read = all.map((l) => ({ l, info: readTitle(l.title, l.kind) }));
    const kept = sameSpecs(sameSize(read.filter((r): r is typeof r & { info: TitleInfo } => !("refused" in r.info))));
    if (!kept.length) continue;

    const offers: Partial<Record<RegionCode, Offer[]>> = {};
    let qualifies = false;
    for (const region of REGIONS) {
      const inRegion = kept.filter((r) => r.l.region === region.code).map((r) => r.l);
      // One offer per store: its orderable, cheapest listing.
      const perStore = new Map<string, Offer>();
      for (const l of inRegion) {
        const o: Offer = { s: l.store, p: l.cents, st: l.st, u: l.url, ...(l.vid ? { v: l.vid } : {}) };
        const prev = perStore.get(l.store);
        if (!prev || STOCK_RANK[o.st] < STOCK_RANK[prev.st] || (STOCK_RANK[o.st] === STOCK_RANK[prev.st] && o.p < prev.p)) perStore.set(l.store, o);
      }
      const sane = sortOffers(saneOffers([...perStore.values()]));
      if (!sane.length) continue;
      offers[region.code] = sane;
      if (sane.length >= SITE.minStoresPerRegion) qualifies = true;
    }
    if (!qualifies) continue;

    // The brand most stores name, spelled the way the brand list (or most stores) spell it.
    const brands = kept
      .map((r) => listingBrand(r.l.vendor, r.l.title, STORE_BY_ID[r.l.store]?.name ?? r.l.store))
      .filter((b): b is string => !!b);
    const key = mode(brands.map(canonicalKey).filter(Boolean));
    const brand = key ? spelling.get(key) ?? brandName(key, brands.filter((b) => canonicalKey(b) === key)) : "";
    // The titles decide the category. A store's own type or category is the fallback only when no title names one,
    // and then it needs half the stores: one store filing a whole brand under "Batteries & Electrical" put Haltech
    // ECU parts on /batteries.
    const byTitle = kept.map((r) => categoryOf(r.l.title)).filter((c) => c !== "other");
    const byKind = kept.map((r) => ("refused" in r.info ? "other" : r.info.cat));
    const kindCat = mode(byKind.filter((c) => c !== "other"));
    const cat = (mode(byTitle) ??
      (kindCat && byKind.filter((c) => c === kindCat).length * 2 >= byKind.length ? kindCat : "other")) as CatKey;
    // "1 pcs" says nothing a shopper needs: not shown as a size.
    const size = mode(kept.flatMap((r) => ("refused" in r.info || !r.info.size || r.info.size === "1 pcs" ? [] : [r.info.size])));
    let name = pickName(kept.map((r) => tidyName(r.l.title, brand)));
    if (size && !name.toLowerCase().replace(/\s/g, "").includes(size.toLowerCase().replace(/\s/g, ""))) name = `${name} ${size}`;

    let slug = state.slugs[ean];
    // A kept slug is kept, unless another product already holds it (two part keys that share a tail once
    // shared one slug, and only one of them could be reached).
    if (!slug || (slugOwner.has(slug) && slugOwner.get(slug) !== ean)) {
      const base = slugify(name) || `product-${ean}`;
      const tail = slugify(partNoOf(ean) ?? ean.slice(-5));
      slug = !usedSlugs.has(base) ? base : `${base}-${tail}`;
      for (let n = 2; usedSlugs.has(slug); n++) slug = `${base}-${tail}-${n}`;
      state.slugs[ean] = slug;
    }
    usedSlugs.add(slug);
    slugOwner.set(slug, ean);
    if (!state.first[ean]) state.first[ean] = today;
    const img = kept.find((r) => r.l.img)?.l.img ?? null;
    // Fitment, per store and in the store's words, from stores that still list the product (cheapest-region order does not matter).
    const fit: Record<string, string[]> = {};
    for (const r of [...kept].sort((a, b) => a.l.store.localeCompare(b.l.store))) {
      if (r.l.fit?.length && !fit[r.l.store] && Object.keys(fit).length < FIT_MAX_STORES) fit[r.l.store] = r.l.fit;
    }
    const oe = [...new Set(kept.flatMap((r) => r.l.oe ?? []))].slice(0, 6);
    out.push({ ean, slug, name, brand, b: key ? brandSlug(key, brand) : "", cat, size, img, first: state.first[ean], offers, ...(Object.keys(fit).length ? { fit } : {}), ...(oe.length ? { oe } : {}) });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}
