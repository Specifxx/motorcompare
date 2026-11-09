// Every outbound link is tagged here, at build time (there is no /go route:
// a click costs no function). Tag format, as on every sister site:
// `motor-<region>-<placement>-<ean>` in EPN's `customid` and Amazon's
// `ascsubtag`, so the earnings reports split by site, market and placement.
// Store links get utm_source so a store sees what we send it (the start of a
// partner-code conversation).
import { REGION_BY_CODE, SITE, type RegionCode } from "@/site";
import { awinDeepLink, awinProgrammeFor, awinUrl, clickref } from "./awin";
import { STORE_BY_ID, STORES } from "@/content/stores";
import type { Offer } from "./types";

/** One EPN campaign for every site in the family, hard-coded (owner,
 *  2026-10-30); no variable overrides it. The customid tag (`motor-…`) tells the
 *  sites apart in the reports. */
export const EBAY_CAMPAIGN_ID = "5339155912";

/** Amazon Associates: each marketplace is its own program and tag, so each has
 *  the owner's own, hard-coded (owner, 2026-11-02: no Vercel variable decides a
 *  tag). A region without an Associates programme shows no Amazon row. */
export function amazonTag(region: RegionCode): string | null {
  const tags: Partial<Record<RegionCode, string>> = {
    US: "riftcompare-20",
    AU: "compareempire-22",
    UK: "compareempi03-21",
    CA: "compareempire-20",
    EU: "compareempire-21",
  };
  return tags[region] ?? null;
}

const EBAY_ROTATION: Record<string, string> = {
  "ebay.com": "711-53200-19255-0",
  "ebay.co.uk": "710-53481-19255-0",
  "ebay.com.au": "705-53470-19255-0",
  "ebay.ca": "706-53473-19255-0",
  "ebay.de": "707-53477-19255-0",
};

export function subId(...parts: (string | number | null | undefined)[]): string {
  return (
    [SITE.key, ...parts]
      .filter((x) => x != null && x !== "")
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .slice(0, 60) || SITE.key
  );
}

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function ebayAffiliateUrl(url: string, sub: string): string {
  try {
    const u = new URL(url);
    const rot = EBAY_ROTATION[host(url)];
    if (!rot) return url;
    u.searchParams.set("mkevt", "1");
    u.searchParams.set("mkcid", "1");
    u.searchParams.set("mkrid", rot);
    u.searchParams.set("campid", EBAY_CAMPAIGN_ID);
    u.searchParams.set("toolid", "10001");
    u.searchParams.set("customid", sub);
    return u.toString();
  } catch {
    return url;
  }
}

export function storeUrl(storeId: string, url: string): string {
  try {
    const u = new URL(url);
    const store = STORE_BY_ID[storeId];
    const aff = store?.affiliate && process.env[store.affiliate.envVar];
    if (store?.affiliate && aff) u.searchParams.set(store.affiliate.param, aff);
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", SITE.domain);
      u.searchParams.set("utm_medium", "referral");
    }
    // A store that accepted us on Awin (src/lib/awin.ts): the same page through its tracked deep link.
    if (!(store?.affiliate && aff)) return awinUrl(u.toString(), clickref(SITE.key, storeId)) ?? u.toString();
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * The buy button's link (owner, 2026-11-06: "when you click a link it directly
 * takes them to checkout"): a Shopify cart permalink, `<base>/cart/<variant>:1`,
 * opens the store's own checkout with this one item in it, nothing else to
 * click. Only for an in-stock offer whose variant the import read, and only
 * for a store that pays us nothing: a store that pays through Awin or its own
 * referral code tracks the click with a script on its storefront pages, which
 * a jump straight to checkout would skip, so those keep the product page (the
 * commission is worth more than the click it saves). Everything else, and any
 * link we cannot build, is the product page as before (`storeUrl`).
 * `to` says which, for the click event, so the test can be read.
 */
export function buyLink(o: Offer): { href: string; to: "checkout" | "product" } {
  const store = STORE_BY_ID[o.s];
  if (o.st === "in" && o.v && /^\d{1,20}$/.test(o.v) && store?.platform === "shopify" && !storePays(o.s)) {
    try {
      const u = new URL(`/cart/${o.v}:1`, store.base);
      u.searchParams.set("utm_source", SITE.domain);
      u.searchParams.set("utm_medium", "referral");
      u.searchParams.set("utm_campaign", "checkout");
      return { href: u.toString(), to: "checkout" };
    } catch {}
  }
  return { href: storeUrl(o.s, o.u), to: "product" };
}

/** True when a click on this store's links can earn (shown as "Paid link"). */
export function storePays(storeId: string): boolean {
  const store = STORE_BY_ID[storeId];
  return !!(store?.affiliate && process.env[store.affiliate.envVar]) || !!(store && awinProgrammeFor(store.base));
}

/** The eBay a region's visitors shop on: its own, or eBay Australia for New
 *  Zealand (no eBay NZ in the Partner Network; Australian sellers ship there). */
export function ebayShopHost(region: RegionCode): string | null {
  return REGION_BY_CODE[region].ebayHost ?? (region === "NZ" ? "www.ebay.com.au" : null);
}

/** eBay search, Buy It Now, new, cheapest first, in the region's eBay. */
export function ebaySearchUrl(query: string, region: RegionCode, sub: string): string | null {
  const h = ebayShopHost(region);
  if (!h) return null;
  const u = `https://${h}/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_BIN=1&LH_ItemCondition=1000&_sop=15`;
  return ebayAffiliateUrl(u, sub);
}

/** Amazon's own page of an item the Creators API matched by barcode (lib/amazon-live.ts), tagged the same way. */
export function amazonItemUrl(asin: string, region: RegionCode, sub: string): string | null {
  const tag = amazonTag(region);
  const h = REGION_BY_CODE[region].amazonHost;
  if (!tag || !h || !/^[A-Z0-9]{10}$/.test(asin)) return null;
  return `https://${h}/dp/${asin}?tag=${encodeURIComponent(tag)}&ascsubtag=${encodeURIComponent(sub)}`;
}

export function amazonSearchUrl(query: string, region: RegionCode, sub: string): string | null {
  const tag = amazonTag(region);
  const h = REGION_BY_CODE[region].amazonHost;
  if (!tag || !h) return null;
  return `https://${h}/s?k=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}&ascsubtag=${encodeURIComponent(sub)}`;
}

/**
 * The big Australian parts chains, whose own websites we cannot read (custom
 * platforms, no product feed yet). Each is a labelled search link for the
 * product's name, pinned with eBay and Amazon above the store rows, never a
 * store, a price or "the cheapest". Supercheap Auto pays on Commission
 * Factory (1-7% by category, tyres excluded); Repco and Sparesbox have no
 * programme we have found yet. A row shows as a plain search link (`always`)
 * until its env var holds our tracking template, set after the programme
 * accepts us. The template carries {url} (the encoded search URL) or {q}:
 *   AFF_SUPERCHEAP="https://t.cfjump.com/<our id>/t/<programme>?Url={url}"
 */
export interface Partner {
  key: string;
  name: string;
  envVar: string;
  regions: RegionCode[];
  search: (q: string) => string;
  note: string;
  /** Shown in every region it ships to even before its program accepts us,
   *  as a plain unpaid search link (the two discounters fragrance buyers
   *  check first; the same rule KaeYoung used for YesStyle and Stylevana). */
  always?: boolean;
  /** Its Awin advertiser id, once it accepted us there: product links from its feed go through awinDeepLink. */
  awinMid?: number;
  /** The GitHub secret holding its affiliate product feed's download URL (scripts/partner-feeds.ts): with it
   *  the row shows the retailer's own price for the exact barcode and links to the product, not a search. */
  feedEnv?: string;
  /** Shown ONLY where its feed lists this exact barcode, never as a search (a shop that sells few of our
   *  products, where a search would mostly come back empty). */
  feedOnly?: boolean;
}

export const PARTNERS: Partner[] = [
  { key: "supercheap", name: "Supercheap Auto", envVar: "AFF_SUPERCHEAP", regions: ["AU"], search: (q) => `https://www.supercheapauto.com.au/search?q=${q}`, note: "Australian chain", always: true },
  { key: "repco", name: "Repco", envVar: "AFF_REPCO", regions: ["AU"], search: (q) => `https://www.repco.com.au/search?text=${q}`, note: "Australian chain", always: true },
  { key: "sparesbox", name: "Sparesbox", envVar: "AFF_SPARESBOX", regions: ["AU"], search: (q) => `https://www.sparesbox.com.au/search?q=${q}`, note: "Australian online store", always: true },
];

/** A partner's tracked search link for a query, or null while its template is unset. */
export function partnerUrl(p: Partner, query: string, sub: string, env: Record<string, string | undefined> = process.env): string | null {
  const tpl = env[p.envVar];
  const q = encodeURIComponent(query);
  // No template of its own: a retailer that accepted us on Awin is its tracked deep link to the same search.
  if (!tpl) return awinUrl(p.search(q), clickref(sub)) ?? null;
  return tpl
    .replace("{url}", encodeURIComponent(p.search(q)))
    .replace("{q}", q)
    .replace("{sub}", encodeURIComponent(sub));
}

/** The Awin advertiser behind a partner's links (for its offers, src/lib/promos.ts), or null when it is not on Awin. */
export function partnerAwinId(p: Partner, env: Record<string, string | undefined> = process.env): number | null {
  const m = (env[p.envVar] ?? "").match(/awinmid=(\d+)/);
  if (m) return Number(m[1]);
  return env[p.envVar] ? null : (awinProgrammeFor(p.search("x"))?.id ?? null);
}

const bareHost = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
/** A partner we also read as a store in this region (its real prices are in the store rows): no search row twice. */
export function isListedStore(p: Partner, region: RegionCode): boolean {
  const host = bareHost(p.search("x"));
  return STORES.some((s) => s.region === region && bareHost(s.base) === host);
}

/** The retailer rows a region shows today: those whose tracking template is
 *  set (paid), plus the `always` ones as plain search links (unpaid). */
export function partnersFor(region: RegionCode, query: string, sub: string, env: Record<string, string | undefined> = process.env): { p: Partner; href: string; paid: boolean }[] {
  return PARTNERS.filter((p) => p.regions.includes(region) && !p.feedOnly && !isListedStore(p, region)).flatMap((p): { p: Partner; href: string; paid: boolean }[] => {
    const href = partnerUrl(p, query, sub, env);
    if (href) return [{ p, href, paid: true }];
    return p.always ? [{ p, href: p.search(encodeURIComponent(query)), paid: false }] : [];
  });
}

/** A partner's tracked link to one of its own product pages (from its feed), or null when nothing can track it. */
export function partnerProductUrl(p: Partner, productUrl: string, sub: string, env: Record<string, string | undefined> = process.env): string | null {
  const tpl = env[p.envVar];
  if (tpl?.includes("{url}")) return tpl.replace("{url}", encodeURIComponent(productUrl)).replace("{q}", "").replace("{sub}", encodeURIComponent(sub));
  if (p.awinMid) return awinDeepLink(p.awinMid, productUrl, clickref(sub));
  return awinUrl(productUrl, clickref(sub));
}
