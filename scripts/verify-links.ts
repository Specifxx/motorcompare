// Checks a rotating sample of the buy links against each Shopify store's own product data (src/lib/link-audit.ts) and writes
// data/public/link-audit.json. Run by .github/workflows/link-audit.yml several times a day. Polite like every reader here:
// two stores at a time, a request a second per store, and a 403/429 ends that store for the run (never worked around).
//
//   LINK_BUDGET=900 npx tsx scripts/verify-links.ts       (default 900 checks a run)
import fs from "node:fs";
import path from "node:path";
import { STORE_BY_ID } from "@/content/stores";
import { unpackProducts } from "@/lib/products-file";
import { auditKey, checkOrder, judge, type AuditFile, type Checked, type ShopifyJs } from "@/lib/link-audit";

const DIR = path.resolve("data/public");
const OUT = path.join(DIR, "link-audit.json");
const UA = "MotorCompare link audit (+https://motorcompare.app/about)";
const BUDGET = Number(process.env.LINK_BUDGET || 900);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toISOString().slice(0, 10);
const day = Math.floor(Date.now() / 86_400_000);

type Row = Checked & { key: string; handle: string; base: string; sku?: undefined };

function readRows(): Row[] {
  const products = unpackProducts(JSON.parse(fs.readFileSync(path.join(DIR, "products.json"), "utf8")));
  const rows: Row[] = [];
  for (const f of products) {
    for (const list of Object.values(f.offers)) {
      for (const o of list ?? []) {
        const store = STORE_BY_ID[o.s];
        if (!o.v || store?.platform !== "shopify") continue;
        const m = /\/products\/([^/?#]+)/.exec(o.u);
        if (!m) continue;
        rows.push({ key: auditKey(o.s, o.v), store: o.s, vid: o.v, inStock: o.st === "in", cents: o.p, ean: f.ean, handle: m[1], base: store.base });
      }
    }
  }
  return rows;
}

async function main() {
  const prev: AuditFile = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { updatedAt: "", checked: {}, bad: {} };
  const rows = readRows();
  const live = new Set(rows.map((r) => r.key));
  const audit: AuditFile = { updatedAt: new Date().toISOString(), checked: {}, bad: {} };
  // Forget what is no longer offered.
  for (const [k, v] of Object.entries(prev.checked)) if (live.has(k)) audit.checked[k] = v;
  for (const [k, v] of Object.entries(prev.bad)) if (live.has(k)) audit.bad[k] = v;

  const todo = checkOrder(rows, audit).slice(0, BUDGET);
  const byStore = new Map<string, Row[]>();
  for (const r of todo) byStore.set(r.store, [...(byStore.get(r.store) ?? []), r]);
  const queue = [...byStore.entries()];
  let checked = 0;
  let caught = 0;
  const stopped: string[] = [];

  async function worker() {
    for (let next = queue.shift(); next; next = queue.shift()) {
      const [store, list] = next;
      for (const r of list) {
        await sleep(1000);
        let js: ShopifyJs | null = null;
        let status = 0;
        try {
          const res = await fetch(`${r.base}/products/${r.handle}.js`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
          status = res.status;
          if (res.ok) js = (await res.json()) as ShopifyJs;
        } catch {
          status = 0;
        }
        if (status === 403 || status === 429 || status >= 500) {
          stopped.push(store);
          break;
        }
        if (!js && status !== 404 && status !== 410) continue;
        checked++;
        audit.checked[r.key] = day;
        const bad = judge(r, js, status, today);
        if (bad) {
          audit.bad[r.key] = bad;
          caught++;
        } else delete audit.bad[r.key];
      }
    }
  }
  await Promise.all([worker(), worker()]);
  fs.writeFileSync(OUT, JSON.stringify(audit));
  console.log(`link audit: ${checked} checked of ${rows.length} links, ${caught} wrong this run, ${Object.keys(audit.bad).length} wrong in all${stopped.length ? `, stopped early: ${[...new Set(stopped)].join(", ")}` : ""}`);
}

if (process.argv[1]?.endsWith("verify-links.ts")) main();
