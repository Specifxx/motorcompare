// Noindex products are linked as /p/<slug> so crawlers stay off them (Vercel cost, 2026-11-14: every crawler visit to
// one of ~33,000 noindex product pages was an ISR render and write after each release).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { productPath } from "../src/lib/index-tiers";
import robots from "../src/app/robots";
import type { Product } from "../src/lib/types";

const prod = (n: number): Product => ({
  ean: "pn:ngk:BKR6E", slug: "ngk-bkr6e", name: "NGK BKR6E", brand: "NGK", b: "ngk", cat: "plugs", size: null, img: null, first: "2026-11-01",
  offers: { AU: Array.from({ length: n }, (_, i) => ({ s: `s${i}`, p: 1000 + i, st: "in" as const, u: "https://x" })) },
});

test("a noindex product is linked under /p/, an indexed one under /product/", () => {
  assert.equal(productPath(prod(1)), "/p/ngk-bkr6e");
  assert.match(productPath(prod(6)), /^\/(product|p)\/ngk-bkr6e$/);
});

test("robots.txt keeps crawlers off /p/, next.config serves it as the product page, server lists use productPath", () => {
  const rules = robots().rules as { disallow?: string | string[] }[];
  assert.ok(rules.some((r) => ([] as string[]).concat(r.disallow ?? []).includes("/p/")));
  const cfg = fs.readFileSync(fs.readdirSync(".").find((f) => f.startsWith("next.config"))!, "utf8");
  assert.match(cfg, /source: "\/p\/:slug", destination: "\/product\/:slug"/);
  for (const f of ["src/components/ProductTile.tsx", "src/components/PriceList.tsx"]) assert.match(fs.readFileSync(f, "utf8"), /href=\{productPath\(f\)\}/, f);
});
