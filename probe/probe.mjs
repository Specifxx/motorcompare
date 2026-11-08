// Car parts store probe (research only; never touches data/ or main).
// For each candidate host: Shopify products.json or the WooCommerce Store API?
// What currency, how many products, how many are car parts and in which of our
// categories, how many valid EAN-13/UPC barcodes (variant SKU, and from a capped
// sample of single-product reads, variants[].barcode), and the part numbers (SKU)
// so overlap between shops can be counted. Writes out-<shard>.json. ~1 request/second.
import fs from "node:fs";

const SHARD = Number(process.env.SHARD ?? 0);
const SHARDS = Number(process.env.SHARDS ?? 1);
const PAGES = 12; // up to 3,000 products
const LOOKUPS = 30;
const UA = "Mozilla/5.0 (compatible; CompareEmpireProbe/1.0; +https://compareempire.com)";
export const CATS = {
  oil: /\b(engine oil|motor oil|\d{1,2}w-?\d{2}|synthetic oil|semi synthetic|gear oil|atf|transmission fluid|diff oil)\b/i,
  battery: /\b(car battery|battery|batteries|agm|n70zz|ns40|din\d{2}|mf\d{2,3}|cca)\b/i,
  wiper: /\b(wiper|wipers|wiper blade|wiper refill)\b/i,
  globe: /\b(globe|globes|headlight bulb|bulb|h1|h3|h4|h7|h11|9005|9006|hb3|hb4|h8|h16|t10|w5w)\b/i,
  filter: /\b(oil filter|air filter|cabin filter|fuel filter|pollen filter|filter kit|service kit|ryco|wesfil|sakura)\b/i,
  plug: /\b(spark plug|spark plugs|glow plug|ngk|denso iridium)\b/i,
  brake: /\b(brake pad|brake pads|brake rotor|rotors|brake disc|brake fluid|dot ?4|dot ?3|caliper)\b/i,
  coolant: /\b(coolant|antifreeze|radiator)\b/i,
  care: /\b(car wash|wash and wax|snow foam|detailer|ceramic coating|tyre shine|microfibre|clay bar|polish|wax|degreaser|interior cleaner)\b/i,
};
const CAR = /\b(car|cars|vehicle|auto|automotive|engine|4wd|4x4|ute|toyota|ford|holden|nissan|mazda|subaru|mitsubishi|hyundai|kia|volkswagen|vw|bmw|audi|mercedes|honda|isuzu|suzuki|land ?cruiser|hilux|ranger|navara|commodore|falcon)\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, redirect: "follow", signal: AbortSignal.timeout(25_000) });
      if (res.status === 429) { await sleep(10_000 * (i + 1)); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      await sleep(900);
      return { url: res.url, json: JSON.parse(text) };
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(3000);
    }
  }
  throw new Error("429");
}
const ean = (s) => {
  let d = String(s ?? "").replace(/\D/g, "");
  if (String(s ?? "").replace(/[\s-]/g, "") !== d) return null;
  if (/^\d{12}$/.test(d)) d = `0${d}`;
  if (!/^\d{13}$/.test(d)) return null;
  if (/^(02|04|2|98|99)/.test(d)) return null;
  const sum = [...d.slice(0, 12)].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(d[12]) ? d : null;
};
const partNo = (s) => {
  const t = String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return t.length >= 3 && t.length <= 20 && /\d/.test(t) && /[A-Z]/.test(t) ? t : null;
};
const catsOf = (text) => Object.entries(CATS).filter(([, re]) => re.test(text)).map(([k]) => k);

const ROUND = new URL("./candidates-round.txt", import.meta.url);
const hosts = [...new Set(fs.readFileSync(fs.existsSync(ROUND) ? ROUND : new URL("./candidates.txt", import.meta.url), "utf8").split("\n")
  .map((l) => l.replace(/#.*/, "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")).filter(Boolean))].filter((_, i) => i % SHARDS === SHARD);

function tally(r, items) {
  r.products = items.length;
  const cats = {};
  let parts = 0, skuEan = 0;
  const codes = new Set(), pns = new Set();
  for (const p of items) {
    const text = `${p.title} ${p.type ?? ""} ${p.tags ?? ""}`;
    const cs = catsOf(text);
    if (cs.length || CAR.test(text)) parts++;
    for (const c of cs) cats[c] = (cats[c] ?? 0) + 1;
    for (const v of p.variants) {
      const c = ean(v.sku) ?? ean(v.barcode);
      if (c) { skuEan++; codes.add(c); }
      const pn = partNo(v.sku);
      if (pn) pns.add(pn);
    }
  }
  Object.assign(r, { parts, cats, skuEan });
  return { codes, pns };
}

async function probeShopify(host, r) {
  const first = await get(`https://${host}/products.json?limit=250&page=1`, 2);
  if (!Array.isArray(first.json.products)) return null;
  const base = new URL(first.url).origin;
  Object.assign(r, { platform: "shopify", base });
  try { const m = await get(`${base}/meta.json`, 1); r.name = m.json.name; r.currency = m.json.currency; r.country = m.json.country; } catch {}
  const products = [...first.json.products];
  for (let p = 2; p <= PAGES && products.length === (p - 1) * 250; p++) {
    const d = await get(`${base}/products.json?limit=250&page=${p}`);
    products.push(...d.json.products);
  }
  const items = products.map((p) => ({ handle: p.handle, title: p.title, type: p.product_type, tags: Array.isArray(p.tags) ? p.tags.join(" ") : p.tags, variants: (p.variants ?? []).map((v) => ({ sku: v.sku })) }));
  const { codes, pns } = tally(r, items);
  const sample = items.filter((p) => catsOf(`${p.title} ${p.type ?? ""}`).length && !p.variants.some((v) => ean(v.sku))).slice(0, LOOKUPS);
  let looked = 0, withBarcode = 0;
  for (const p of sample) {
    try {
      const d = await get(`${base}/products/${p.handle}.json`, 2);
      looked++;
      let any = false;
      for (const v of d.json.product?.variants ?? []) { const c = ean(v.barcode); if (c) { any = true; codes.add(c); } }
      if (any) withBarcode++;
    } catch { /* skip */ }
  }
  Object.assign(r, { sampleLooked: looked, sampleWithBarcode: withBarcode, codes: [...codes], pns: [...pns] });
  return r;
}

async function probeWoo(host, r) {
  const first = await get(`https://${host}/wp-json/wc/store/v1/products?per_page=100&page=1`, 2);
  if (!Array.isArray(first.json)) return null;
  const base = new URL(first.url).origin;
  Object.assign(r, { platform: "woocommerce", base });
  const products = [...first.json];
  r.currency = first.json[0]?.prices?.currency_code;
  for (let p = 2; p <= PAGES * 2.5 && products.length === (p - 1) * 100; p++) {
    const d = await get(`${base}/wp-json/wc/store/v1/products?per_page=100&page=${p}`);
    products.push(...d.json);
  }
  const items = products.map((p) => ({ title: p.name, type: (p.categories ?? []).map((c) => c.name).join(" "), tags: (p.tags ?? []).map((t) => t.name).join(" "), variants: [{ sku: p.sku }] }));
  const { codes, pns } = tally(r, items);
  Object.assign(r, { codes: [...codes], pns: [...pns] });
  return r;
}

async function probe(host) {
  const r = { host };
  try { if (await probeShopify(host, r)) return r; } catch (e) { r.shopifyError = String(e.message ?? e); }
  try { if (await probeWoo(host, r)) return r; } catch (e) { r.wooError = String(e.message ?? e); }
  return r;
}

const out = [];
for (const h of hosts) {
  const t = Date.now();
  const res = await probe(h).catch((e) => ({ host: h, error: String(e) }));
  out.push(res);
  const { codes, pns, ...log } = res;
  console.log(JSON.stringify(log), `${Math.round((Date.now() - t) / 1000)}s`);
  fs.writeFileSync(new URL(`./out-${SHARD}.json`, import.meta.url), JSON.stringify(out));
}
