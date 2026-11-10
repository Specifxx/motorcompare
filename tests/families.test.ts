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

test("options written inside nested brackets do not split a family; a very large spread is not advertised as a deal", async () => {
  const a = P("pn:6boost:A", `6Boost Nissan RB25 V-Band Exhaust Manifold (I don't need EGT's / Reverse Rotation V-BAND(GARRETT G25/30/35 (2.25" Inlet))/50 Single / No - Flange/s)`, 150000);
  const b = P("pn:6boost:B", `6Boost Nissan RB25 V-Band Exhaust Manifold (I would like EGT's / Reverse Rotation V-BAND(RR TURBOSMART 6870-7880 (3.00" Inlet))/50 Single / Yes - Flange/s)`, 155000);
  assert.equal(familyKey(a), familyKey(b));
  const { dealsIn, DEAL_MAX_SPREAD } = await import("@/lib/data");
  assert.equal(DEAL_MAX_SPREAD, 0.5);
  const two = (lo: number, hi: number) => ({ ...P("pn:x:1", "X thing", lo), offers: { AU: [{ s: "a", p: lo, st: "in", u: "https://x" }, { s: "b", p: hi, st: "in", u: "https://y" }] } }) as unknown as Product;
  assert.equal(dealsIn("AU", 8, [two(5100, 19900)]).length, 0, "74% off is a likely mismatch, not a deal");
  assert.equal(dealsIn("AU", 8, [two(8000, 10000)]).length, 1, "20% off still is");
});
