// Writes a small, obviously synthetic dataset to tests/fixtures/data for local
// development and tests (SC_DATA_DIR=tests/fixtures/data). Never copied to
// data/public: the site only ever publishes prices a store showed.
import fs from "node:fs";
import path from "node:path";
import type { History, Meta, Product } from "@/lib/types";
import { summarize, type ReviewsFile } from "@/lib/reviews";
import { CATEGORIES, type RegionCode } from "@/site";

const names = ["Sample 5W-30 Engine Oil 5L", "Test N70ZZ Car Battery", "Fixture Wiper Blade 600mm", "Demo H4 Headlight Globe", "Example Z386 Oil Filter", "Mock Iridium Spark Plug", "Placeholder Brake Pads", "Stub Long Life Coolant 5L", "Dummy Car Wash 2L", "Trial Jump Starter", "Proto Cabin Filter", "Beta Brake Fluid 500ml"];
const brands = ["Brand Alpha", "Brand Beta", "Brand Gamma"];
const stores: Partial<Record<RegionCode, string[]>> = { AU: ["au-a", "au-b", "au-c"] };
const base: Partial<Record<RegionCode, number>> = { AU: 3295 };

function ean(prefix: string): string {
  const d = prefix.padEnd(12, "0").slice(0, 12);
  let s = 0;
  for (let i = 0; i < 12; i++) s += Number(d[i]) * (i % 2 ? 3 : 1);
  return d + ((10 - (s % 10)) % 10);
}

const products: Product[] = names.map((n, i) => {
  const brand = brands[i % 3];
  const name = `${brand} ${n}`;
  const offers: Product["offers"] = {};
  (Object.keys(stores) as RegionCode[]).forEach((r) => {
    offers[r] = stores[r]!.map((s, j) => ({ s, p: base[r]! + j * 300 - (i % 4) * 100, st: (i + j) % 7 === 3 ? "out" : "in", u: `https://example.com/${s}/${i}` }));
  });
  return {
    ean: ean(`93000000${String(i).padStart(4, "0")}`),
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    brand,
    b: brand.toLowerCase().replace(/\s+/g, "-"),
    cat: CATEGORIES[i % (CATEGORIES.length - 1)].key,
    size: null,
    img: null,
    first: `2026-10-${String(10 + i).padStart(2, "0")}`,
    offers,
  };
});
const history: History = Object.fromEntries(products.map((f) => [f.ean, { AU: [[20740, 3599], [20750, 3399], [20755, f.offers.AU?.[0]?.p ?? 3295]] }]));
const meta: Meta = { updatedAt: "2026-10-30T08:00:00Z", products: products.length, stores: {} };
// Obviously synthetic ratings on the first three products (one with too few for review schema).
const said = ["Fixture review: fitted in five minutes, same as the old one.", "Fixture review: fine, but dearer than the shop down the road."];
const reviews: ReviewsFile = {
  exportedAt: "2026-10-30T08:00:00Z",
  held: 0,
  products: Object.fromEntries(
    products.slice(0, 3).map((f, i) => [
      f.ean,
      summarize(Array.from({ length: [6, 3, 1][i] }, (_, k) => ({ id: i * 10 + k + 1, stars: 5 - ((k + i) % 3), title: k === 0 ? "Fixture headline" : null, body: k < 2 ? said[k] : null, name: k === 0 ? "Fixture Tester" : null, skin: k === 0 ? "dry" : null, created: `2026-10-2${k}T10:00:00` }))),
    ]),
  ),
};
const dir = path.join(__dirname, "data");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "products.json"), JSON.stringify({ products }, null, 1));
fs.writeFileSync(path.join(dir, "history.json"), JSON.stringify(history));
fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 1));
fs.writeFileSync(path.join(dir, "reviews.json"), JSON.stringify(reviews));
console.log(`${products.length} fixture products`);

// Delivery quotes for some fixture stores (lib/shipping.ts): charged with a
// threshold, always free, never free up to the cap; the rest unknown.
const quote = (to: string, fee: number, freeFrom: number | null, paidAt: number) => ({ at: "2026-10-30", to, fee, freeFrom, paidAt, maxTested: Math.max(freeFrom ?? 0, paidAt) });
fs.writeFileSync(
  path.join(dir, "shipping.json"),
  JSON.stringify(
    {
      "au-a": quote("Sydney", 995, 7990, 7490),
      "au-b": quote("Sydney", 0, 500, 0),
      "au-c": quote("Sydney", 1200, null, 25000)
    },
    null,
    1,
  ),
);
