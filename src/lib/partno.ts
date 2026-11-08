// Brand + manufacturer part number: how car parts are matched (2026-11-08).
//
// Australian parts shops almost never fill the barcode (the store probe found
// 43 barcodes sold by two or more shops, against 17,130 shared SKUs), but most
// put the maker's own part number in the SKU: Ryco Z386, NGK BKR6E, Century
// NS70ZZ. The trade itself orders parts that way. So a listing whose brand we
// know and whose SKU reads as a part number gets the key `pn:<brand>:<PN>`,
// and two stores with the same key sell the same part.
//
// It may only refuse, never guess: no brand, no key; a SKU that is a word, too
// short, or digits alone (a store's own running number) is no key; and the
// merge still needs two different stores and sane prices.
import { canonicalKey } from "./brand";

const PREFIX = "pn:";

/** A store SKU as a manufacturer part number, or null when it can't be one. */
export function partNumber(sku: string | null | undefined, brand?: string | null): string | null {
  let t = String(sku ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  // "NGK-BKR6E", "RYCOZ386": the brand written in front of the maker's number.
  const b = brand ? canonicalKey(brand).toUpperCase() : "";
  if (b.length >= 3 && t.startsWith(b) && t.length - b.length >= 4) t = t.slice(b.length);
  if (t.length < 4 || t.length > 20) return null;
  if (!/\d/.test(t) || !/[A-Z]/.test(t)) return null;
  // A word with a digit ("BLACK2", "LARGE1") is a variant name, not a part number.
  if (/[A-Z]{5,}/.test(t) && (t.match(/\d/g) ?? []).length < 2) return null;
  return t;
}

/** The match key for one listing: brand + part number, or null. */
export function partKey(brand: string | null | undefined, sku: string | null | undefined): string | null {
  if (!brand) return null;
  const k = canonicalKey(brand);
  if (k.length < 2) return null;
  const pn = partNumber(sku, brand);
  return pn ? `${PREFIX}${k}:${pn}` : null;
}

/** Is this product id a brand + part number key (not a barcode)? */
export const isPartKey = (id: string): boolean => id.startsWith(PREFIX);

/** The part number in a key, for display ("Z386"); null for a barcode. */
export function partNoOf(id: string): string | null {
  return isPartKey(id) ? id.slice(id.lastIndexOf(":") + 1) : null;
}

/** A product id we could have made: a barcode or a well-formed part key (the review form's check). */
export const isPartKeyShape = (id: string): boolean => /^pn:[a-z0-9]{2,40}:[A-Z0-9]{4,20}$/.test(id);
