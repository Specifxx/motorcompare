// Is the buy button's destination the product we show? (cousin's feedback, 2026-11-10: "sometimes the item link goes to the
// wrong product".) The import reads each Shopify store once a day; between runs a store can delete or re-use a variant, change
// the SKU on a listing or sell the last unit. scripts/verify-links.ts asks the store's own product page data
// (/products/<handle>.js) about a rotating sample of our offers, several times a day, and writes data/public/link-audit.json;
// the site reads that file and treats a bad link as the product page (variant dropped) or leaves the offer out (a listing that
// no longer is what we matched). Pure functions here: tests/link-audit.test.ts pins them. Nothing here fetches.
import type { Offer, Product } from "./types";
import { partNoOf } from "./partno";

/** The parts of a store's /products/<handle>.js we read. Prices are in cents. */
export interface ShopifyJs {
  handle?: string;
  variants: { id: number; sku?: string | null; price: number; available?: boolean }[];
}

export type Reason = "gone" | "variant" | "sku" | "sold-out";
/** offer: the listing is not what we matched, leave it out. variant: the product page is right but the cart link is not. */
export type Action = "offer" | "variant";

export interface Bad {
  r: Reason;
  a: Action;
  /** day of the check, YYYY-MM-DD */
  d: string;
}

export interface AuditFile {
  updatedAt: string;
  /** "store:variantId" → days since 1970 of its last check */
  checked: Record<string, number>;
  /** "store:variantId" → what was wrong the last time it was checked */
  bad: Record<string, Bad>;
}

export const auditKey = (store: string, vid: string) => `${store}:${vid}`;

const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export interface Checked {
  store: string;
  vid: string;
  /** stock the import saw: "in" claims a checkout link */
  inStock: boolean;
  cents: number;
  /** the product id (pn:brand:PART or a barcode) */
  ean: string;
}

/**
 * The verdict for one offer given what the store's page data says now. `status` is the HTTP status of the fetch; a null `js`
 * with a status other than 404/410 means "could not read it", which is never a verdict (a blocked or failing store is not a
 * wrong link).
 */
export function judge(o: Checked, js: ShopifyJs | null, status: number, today: string): Bad | null {
  if (!js) return status === 404 || status === 410 ? { r: "gone", a: "offer", d: today } : null;
  const v = js.variants.find((x) => String(x.id) === o.vid);
  if (!v) return { r: "variant", a: "offer", d: today };
  const pn = partNoOf(o.ean);
  // The part number we matched on is read from this variant's SKU; a SKU that no longer carries it is another part.
  if (pn && v.sku && !alnum(v.sku).includes(alnum(pn))) return { r: "sku", a: "offer", d: today };
  // A checkout link for a unit the store has since sold is a dead end: keep the product page.
  if (o.inStock && v.available === false) return { r: "sold-out", a: "variant", d: today };
  return null;
}

/** Applies an audit to products: a bad offer is left out (and its product with it when none is left), a bad cart link loses its variant id. */
export function applyAudit(products: Product[], audit: AuditFile | null | undefined): Product[] {
  const bad = audit?.bad;
  if (!bad || !Object.keys(bad).length) return products;
  const out: Product[] = [];
  for (const f of products) {
    let changed = false;
    const offers: Product["offers"] = {};
    for (const [region, list] of Object.entries(f.offers) as [keyof Product["offers"], Offer[] | undefined][]) {
      if (!list) continue;
      const kept: Offer[] = [];
      for (const o of list) {
        const b = o.v ? bad[auditKey(o.s, o.v)] : undefined;
        if (!b) kept.push(o);
        else if (b.a === "variant") {
          const { v: _drop, ...rest } = o;
          void _drop;
          kept.push(rest);
          changed = true;
        } else changed = true;
      }
      if (kept.length) offers[region] = kept;
    }
    if (!changed) out.push(f);
    else if (Object.values(offers).some((l) => l?.length)) out.push({ ...f, offers });
  }
  return out;
}

/** Which offers to check next: ones last found bad first, then never checked, then the longest ago. */
export function checkOrder<T extends { key: string }>(rows: T[], audit: AuditFile): T[] {
  const age = (k: string) => (audit.bad[k] ? -2 : audit.checked[k] === undefined ? -1 : audit.checked[k]);
  return [...rows].sort((a, b) => age(a.key) - age(b.key));
}

/** One line for the ops monitor: how fresh the audit is and how much it caught. */
export function judgeAudit(a: AuditFile | null, now = Date.now()): { status: "ok" | "warn" | "fail"; detail: string } {
  if (!a) return { status: "warn", detail: "no link audit yet (Link audit workflow)" };
  const h = (now - Date.parse(a.updatedAt)) / 3_600_000;
  const checked = Object.keys(a.checked).length;
  const bad = Object.keys(a.bad).length;
  const share = checked ? bad / checked : 0;
  const detail = `${checked} links checked, ${bad} found wrong (${(share * 100).toFixed(1)}%), last run ${h.toFixed(0)}h ago`;
  if (h > 30) return { status: h > 54 ? "fail" : "warn", detail: `${detail}: the Link audit workflow has stopped` };
  if (share > 0.1) return { status: "warn", detail: `${detail}: unusually many, check a store that changed its SKUs` };
  return { status: "ok", detail };
}
