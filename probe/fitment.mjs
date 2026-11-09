// Fitment probe (research only; never touches data/ or main). For the AU Shopify stores that list the most products,
// reads robots.txt, and where /products.json is allowed samples products and keeps what a fitment reader needs to see:
// tags, product type, options, the description text (tables flattened), and which of them name a make, model, year or
// "suits". Writes probe/fitment-out.json and probe/fitment-summary.md. One request a second, one store at a time.
import fs from "node:fs";

const UA = "Mozilla/5.0 (compatible; CompareEmpireProbe/1.0; +https://compareempire.com)";
const STORES = Number(process.env.STORES ?? 14);
const PER = Number(process.env.PER ?? 40);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAKE = /\b(toyota|ford|holden|nissan|mazda|subaru|mitsubishi|hyundai|kia|volkswagen|vw|bmw|audi|mercedes|honda|isuzu|suzuki|landcruiser|land cruiser|hilux|ranger|navara|commodore|falcon|lexus|jeep|mini|volvo|renault|peugeot)\b/i;
const FIT = /\b(suits?|fits?|compatib\w+|fitment|application|vehicle\s*(?:list|fitment)|applications?|make|model|year)\b/i;

const src = fs.readFileSync("src/content/stores.ts", "utf8");
const stores = [...src.matchAll(/\{\s*id:\s*"([^"]+)",\s*name:\s*"[^"]*",\s*region:\s*"AU",\s*base:\s*"([^"]+)",\s*platform:\s*"shopify"/g)].map((m) => ({ id: m[1], base: m[2] }));
const counts = (() => {
  try {
    const d = JSON.parse(fs.readFileSync("data/public/products.json", "utf8")).products;
    const c = {};
    for (const p of d) for (const o of p.offers.AU ?? []) c[o[0]] = (c[o[0]] ?? 0) + 1;
    return c;
  } catch { return {}; }
})();
stores.sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));

async function fetchText(url, accept = "*/*") {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: accept }, redirect: "follow", signal: AbortSignal.timeout(25_000) });
  await sleep(1000);
  return { status: res.status, text: res.ok ? await res.text() : "" };
}
function allowed(robots, path) {
  let applies = false, ok = true;
  for (const raw of robots.split("\n")) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "user-agent") applies = v === "*";
    else if (applies && k === "disallow" && v && path.startsWith(v)) ok = false;
  }
  return ok;
}
const flat = (h) => String(h ?? "").replace(/<\/(tr|p|li|div|h\d)>/gi, "\n").replace(/<\/t[dh]>/gi, " | ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();

const out = [];
for (const s of stores.slice(0, STORES)) {
  const row = { id: s.id, base: s.base, listings: counts[s.id] ?? 0 };
  try {
    const rb = await fetchText(`${s.base}/robots.txt`);
    row.robots = rb.status;
    if (!allowed(rb.text, "/products.json")) { row.skipped = "robots disallows /products.json"; out.push(row); continue; }
    const r = await fetchText(`${s.base}/products.json?limit=250&page=1`, "application/json");
    row.status = r.status;
    const list = r.status === 200 ? JSON.parse(r.text).products ?? [] : [];
    const step = Math.max(1, Math.floor(list.length / PER));
    row.sample = list.filter((_, i) => i % step === 0).slice(0, PER).map((p) => {
      const body = flat(p.body_html);
      return {
        title: p.title, type: p.product_type, tags: (Array.isArray(p.tags) ? p.tags : String(p.tags).split(",")).map((t) => t.trim()).slice(0, 30),
        options: (p.options ?? []).map((o) => o.name), sku: p.variants?.[0]?.sku, hasTable: /<table/i.test(p.body_html ?? ""),
        namesMake: MAKE.test(body) || MAKE.test((p.tags ?? "").toString()), namesFit: FIT.test(body), body: body.slice(0, 700),
      };
    });
    row.share = { hasTable: row.sample.filter((x) => x.hasTable).length, namesMake: row.sample.filter((x) => x.namesMake).length, namesFit: row.sample.filter((x) => x.namesFit).length, n: row.sample.length };
  } catch (e) { row.error = String(e).slice(0, 120); }
  out.push(row);
}
fs.writeFileSync("probe/fitment-out.json", JSON.stringify(out, null, 1));
fs.writeFileSync("probe/fitment-summary.md", "# Fitment probe\n\n| store | listings | robots | sampled | table | names a make | fit words |\n|---|---|---|---|---|---|---|\n" + out.map((r) => `| ${r.id} | ${r.listings} | ${r.skipped ?? r.robots ?? r.error ?? ""} | ${r.share?.n ?? 0} | ${r.share?.hasTable ?? 0} | ${r.share?.namesMake ?? 0} | ${r.share?.namesFit ?? 0} |`).join("\n") + "\n");
console.log(fs.readFileSync("probe/fitment-summary.md", "utf8"));
