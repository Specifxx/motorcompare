import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { SITE, regionForZone } from "@/site";
import { STORES } from "@/content/stores";
import { amazonSearchUrl, ebayAffiliateUrl, ebaySearchUrl, partnerUrl, PARTNERS, storeUrl, subId } from "@/lib/affiliate";
import { judgeFreshness, judgeStores } from "../scripts/ops-monitor";
import { money } from "@/lib/format";
import { searchRows, type IndexRow } from "@/components/SearchBox";

const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]));

test("Australia only: every visitor gets the Australian prices", () => {
  assert.equal(regionForZone("Australia/Sydney"), "AU");
  assert.equal(regionForZone("Australia/Perth"), "AU");
  assert.equal(regionForZone("America/New_York"), "AU");
  assert.equal(regionForZone(undefined), "AU");
});

test("affiliate tags name the site, region, placement and product", () => {
  assert.equal(subId("AU", "table_pinned", "9300289012345"), "motor-au-table_pinned-9300289012345");
  const e = new URL(ebayAffiliateUrl("https://www.ebay.com.au/itm/1", "motor-au-x"));
  assert.equal(e.searchParams.get("customid"), "motor-au-x");
  assert.equal(e.searchParams.get("mkrid"), "705-53470-19255-0");
  assert.ok(e.searchParams.get("campid"));
  assert.match(ebaySearchUrl("Penrite HPR 5", "UK", "t")!, /ebay\.co\.uk.*LH_BIN=1/);
  assert.match(ebaySearchUrl("Penrite HPR 5", "NZ", "t")!, /ebay\.com\.au.*campid=/, "NZ shops on eBay Australia");
  assert.match(amazonSearchUrl("x", "US", "motor-us-y")!, /amazon\.com\/s\?.*tag=riftcompare-20.*ascsubtag=motor-us-y/);
  assert.match(amazonSearchUrl("x", "AU", "t")!, /amazon\.com\.au\/s\?.*tag=compareempire-22/, "the AU tag on amazon.com.au, never the US one");
  assert.match(amazonSearchUrl("x", "UK", "t")!, /amazon\.co\.uk\/.*tag=compareempi03-21/, "the owner's UK account");
  assert.match(amazonSearchUrl("x", "EU", "t")!, /amazon\.de\/.*tag=compareempire-21/);
  assert.equal(amazonSearchUrl("x", "NZ", "t"), null, "no Amazon NZ");
  assert.doesNotMatch(readFileSync(new URL("../src/lib/affiliate.ts", import.meta.url), "utf8"), /AMAZON_TAG_|AMAZON_ASSOCIATE_TAG/, "tags are hard-coded");
  assert.match(storeUrl("nope", "https://shop.example/p?a=1"), /utm_source=motorcompare\.app&utm_medium=referral/);
});

test("retailer rows appear only once their tracking template is set", () => {
  const sc = PARTNERS.find((p) => p.key === "supercheap")!;
  assert.equal(partnerUrl(sc, "Penrite HPR 5", "motor-au-t", {}), null);
  assert.equal(partnerUrl(sc, "Penrite HPR 5", "motor-au-t", { AFF_SUPERCHEAP: "https://x.example/?q={q}&s={sub}" }), "https://x.example/?q=Penrite%20HPR%205&s=motor-au-t");
});

test("money stays in its own currency", () => {
  assert.equal(money(2995, "AU"), "A$29.95");
  assert.equal(money(1850, "UK"), "£18.50");
  assert.equal(money(2199, "US"), "US$21.99");
});

test("stores: unique ids and hosts, every region covered", () => {
  assert.equal(new Set(STORES.map((s) => s.id)).size, STORES.length);
  assert.equal(new Set(STORES.map((s) => new URL(s.base).host)).size, STORES.length);
  assert.ok(STORES.length >= 20, "20 or more Australian stores");
  assert.ok(STORES.every((s) => s.region === "AU"), "Australia only");
});

test("MotorCompare stands alone: no sister-site links (owner, 2026-10-30, kept for MotorCompare)", () => {
  const src = ["src/site.ts", "src/components/Footer.tsx"].map((f) => fs.readFileSync(f, "utf8")).join("\n");
  for (const s of ["riftcompare", "dexcompare", "figurecompare", "wargamecompare", "Sister sites"]) assert.ok(!src.toLowerCase().includes(s.toLowerCase()), s);
});

test("search: every word must match; a barcode finds its product", () => {
  const rows: IndexRow[] = [
    ["a", "Penrite HPR 5 5W-40 Engine Oil 5L", "oil", "9300289012345", {}, "Penrite", "penrite", 0, 0, 5, "2026-10-01"],
    ["b", "Century N70ZZ Car Battery", "batteries", "9312345000017", {}, "Century", "century", 0, 0, 5, "2026-10-01"],
    ["c", "Penrite HPR 30 20W-60 Engine Oil 5L", "oil", "9300289012352", {}, "Penrite", "penrite", 0, 0, 5, "2026-10-01"],
  ];
  assert.deepEqual(searchRows(rows, "penrite").map((r) => r[0]).sort(), ["a", "c"]);
  assert.deepEqual(searchRows(rows, "penrite 20w-60").map((r) => r[0]), ["c"]);
  assert.deepEqual(searchRows(rows, "9312345000017").map((r) => r[0]), ["b"]);
});

test("ops monitor judgements", () => {
  const now = Date.parse("2026-10-30T12:00:00Z");
  assert.equal(judgeFreshness("2026-10-30T05:00:00Z", now).status, "ok");
  assert.equal(judgeFreshness("2026-10-29T00:00:00Z", now).status, "warn");
  assert.equal(judgeFreshness("2026-10-27T00:00:00Z", now).status, "fail");
  const run = (ok: boolean, listings = 10) => ({ ok, matched: 5, listings, refused: {}, noEan: 0, ms: 1, error: ok ? undefined : "HTTP 429" });
  assert.equal(judgeStores({ updatedAt: "", products: 1, stores: { a: run(true), b: run(true) } }, 2).status, "ok");
  assert.equal(judgeStores({ updatedAt: "", products: 1, stores: { a: run(false), b: run(true), c: run(true), d: run(true) } }, 4).status, "warn");
  assert.equal(judgeStores({ updatedAt: "", products: 1, stores: { a: run(false), b: run(false), c: run(true) } }, 3).status, "fail");
  assert.equal(judgeStores({ updatedAt: "", products: 1, stores: { a: run(true, 0), b: run(true) } }, 2).status, "warn");
});

test("one contact address everywhere", () => {
  assert.equal(SITE.email, "compareempire@gmail.com");
  for (const f of walk("src").filter((f) => /\.(tsx?|md)$/.test(f))) {
    const other = (fs.readFileSync(f, "utf8").match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []).filter((a) => a !== SITE.email && !a.startsWith("@"));
    assert.deepEqual(other, [], `${f} has another address`);
  }
});

test("no banner ads (owner, 2026-10-30): paid links live in the price table only", () => {
  assert.ok(!fs.existsSync("src/components/EbayStrip.tsx"));
  for (const f of walk("src").filter((f) => f.endsWith(".tsx"))) assert.doesNotMatch(fs.readFileSync(f, "utf8"), /EbayStrip|EbayNavBox|AdSlot|adsbygoogle/, f);
  const table = fs.readFileSync("src/components/PriceTable.tsx", "utf8");
  const at = (x: string) => table.indexOf(x);
  assert.ok(at('source: "ebay"') < at('source: "amazon"') && at('source: "amazon"') < at("offers.map"), "eBay first, Amazon second, then the stores");
  for (const row of table.match(/pinned\.push\([\s\S]*?\}\);?\n/g)!) {
    assert.match(row, /paid: true/, "every marketplace row is a labelled paid link");
  }
  // The quick view draws the same rows (from /q/<slug>), never its own order.
  assert.match(fs.readFileSync("src/app/q/[slug]/route.ts", "utf8"), /priceRows\(/);
  assert.match(fs.readFileSync("src/components/QuickView.tsx", "utf8"), /<PriceRows /);
});

test("the site is MotorCompare on motorcompare.app", () => {
  assert.equal(SITE.name, "MotorCompare");
  assert.equal(SITE.domain, "motorcompare.app");
  assert.equal(SITE.key, "motor");
});

test("the homepage's part tiles lead with the parts you can fit yourself", () => {
  const src = fs.readFileSync("src/app/page.tsx", "utf8");
  assert.match(src, /const HOME_STEPS: CatKey\[\] = STEP_MENU_ORDER\.filter\(\(k\) => k !== "other"\)/);
  assert.match(src, /counts\[c\.key\] > 0\)\.sort\(\(a, b\) => counts\[b\.key\] - counts\[a\.key\]\)/, "only sections with stock, the biggest first");
  assert.ok(!/CATEGORIES\.(filter|map)/.test(src), "the homepage lists its own tiles, not every category");
});

test("the quick view's Amazon row is the tagged Amazon link itself, never Amazon's price (owner, 2026-11-06)", () => {
  const table = fs.readFileSync("src/components/PriceTable.tsx", "utf8");
  // The link is built for every placement; only the price and the live clock are the product page's.
  assert.match(table, /const amazonUrl = liveUrl \?\? amazonSearchUrl\(q, region, sub\);/);
  assert.match(table, /const live = quick \? null : found;/);
  assert.doesNotMatch(table, /internal: true/, "no quick view row sends an Amazon click to our own page");
});
