// Variants group into one tile; related part numbers (2026-11-10).
import { test } from "node:test";
import assert from "node:assert/strict";
import { familyKey, groupFamilies } from "@/lib/data";
import type { Product } from "@/lib/types";

const P = (ean: string, name: string, p: number): Product =>
  ({ ean, slug: ean, name, brand: "Haltech", b: "haltech", cat: "engine", size: null, img: null, first: "2026-11-01", offers: { AU: [{ s: "a", p, st: "in", u: "https://x" }] } }) as unknown as Product;

test("lengths of the same part are one family; a different part is not", () => {
  const a = P("pn:haltech:HT1", `Haltech 1/4" Open Tip Thermocouple Length: 0.84m (33")`, 4000);
  const b = P("pn:haltech:HT2", `Haltech 1/4" Open Tip Thermocouple Length: 0.72m`, 3500);
  const c = P("pn:haltech:HT3", "Haltech Nexus Rebel LS Harness", 9000);
  assert.equal(familyKey(a), familyKey(b));
  assert.notEqual(familyKey(a), familyKey(c));
  const g = groupFamilies([a, b, c], "AU");
  assert.equal(g.length, 2);
  assert.deepEqual([g[0].n, g[0].from, g[1].n], [2, 3500, 1], "the family shows its option count and lowest price");
});

test("shop by car: a hub names the car in the title or in the fit a store quotes, never claims fitment", async () => {
  const { VEHICLES } = await import("@/content/vehicles");
  const wrx = VEHICLES.find((v) => v.slug === "subaru-wrx")!;
  assert.ok(wrx.re.test("Turbosmart IWG75 Subaru WRX 98 Adapter Kit"));
  assert.ok(!wrx.re.test("Narva H4 60/55W Globe"));
  const ls = VEHICLES.find((v) => v.slug === "engine-ls")!;
  assert.ok(ls.re.test("Haltech Nexus Rebel LS - T56 Transmission Harness"));
  assert.ok(!ls.re.test("Isuzu Elf Light Bar"), "a plain word 'ls' inside another word is no engine");
});
