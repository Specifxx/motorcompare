import { test } from "node:test";
import assert from "node:assert/strict";
import { dropMirrors, mergeListings, saneOffers, type MergeState } from "@/lib/merge";
import type { Listing } from "@/lib/types";
import { ean } from "./helpers";

const OIL = ean("930028901234");
const L = (store: string, region: Listing["region"], cents: number, extra: Partial<Listing> = {}): Listing => ({
  store,
  region,
  title: "Penrite HPR 5 5W-40 Engine Oil 5L",
  vendor: "Penrite",
  kind: "Engine Oil",
  ean: OIL,
  cents,
  st: "in",
  url: `https://${store}.example/p`,
  img: null,
  ...extra,
});
const fresh = (): MergeState => ({ slugs: {}, first: {} });

test("one product per barcode, kept when 2+ stores in one region sell it", () => {
  const out = mergeListings([L("a", "AU", 2199), L("b", "AU", 2499), L("c", "AU", 3295)], fresh(), "2026-10-30");
  assert.equal(out.length, 1);
  assert.equal(out[0].offers.AU!.length, 3);
  assert.equal(out[0].brand, "Penrite");
  assert.equal(out[0].cat, "oil");
  assert.equal(out[0].size, "5L");
  assert.equal(out[0].name, "Penrite HPR 5 5W-40 Engine Oil 5L");
  assert.equal(out[0].slug, "penrite-hpr-5-5w-40-engine-oil-5l");
});

test("one store is not a comparison", () => {
  assert.equal(mergeListings([L("a", "AU", 2199), L("a", "AU", 3295)], fresh(), "2026-10-30").length, 0);
});

test("a store listing a barcode twice counts once, its orderable cheapest copy", () => {
  const out = mergeListings([L("a", "AU", 1999, { st: "out" }), L("a", "AU", 2599), L("b", "AU", 2499)], fresh(), "2026-10-30");
  assert.deepEqual(out[0].offers.AU!.map((o) => [o.s, o.p]), [["b", 2499], ["a", 2599]]);
});

test("orderable first, then cheapest", () => {
  const out = mergeListings([L("a", "AU", 1999, { st: "out" }), L("b", "AU", 2499), L("c", "AU", 2299)], fresh(), "2026-10-30");
  assert.deepEqual(out[0].offers.AU!.map((o) => o.s), ["c", "b", "a"]);
});

test("refused titles never count toward the two stores", () => {
  const out = mergeListings([L("a", "AU", 2199), L("b", "AU", 900, { title: "Penrite HPR 5 5W-40 Engine Oil 5L (Used, opened)" })], fresh(), "2026-10-30");
  assert.equal(out.length, 0);
});

test("a price far from the others is dropped (a 1 L filed under the 5 L's barcode)", () => {
  const kept = saneOffers([2000, 2100, 2200, 300].map((p, i) => ({ s: `s${i}`, p, st: "in" as const, u: "" })));
  assert.deepEqual(kept.map((o) => o.p), [2000, 2100, 2200]);
});

test("slugs are kept forever", () => {
  const state = fresh();
  mergeListings([L("a", "AU", 2199), L("b", "AU", 2499)], state, "2026-10-30");
  const again = mergeListings([L("a", "AU", 2199, { title: "Penrite HPR5 5W40 Oil 5 Litre" }), L("b", "AU", 2499, { title: "Penrite HPR5 5W40 Oil 5 Litre" })], state, "2026-11-01");
  assert.equal(again[0].slug, "penrite-hpr-5-5w-40-engine-oil-5l");
  assert.equal(again[0].first, "2026-10-30");
});

test("mirrors (one stock under two names) count once", () => {
  const many = (store: string) => Array.from({ length: 6 }, (_, i) => L(store, "AU", 2000 + i, { ean: ean(`93002890123${i}`) }));
  const { mirrors, listings } = dropMirrors([...many("a"), ...many("b"), L("c", "AU", 2000)], ["a", "b", "c"]);
  assert.deepEqual(mirrors, { b: "a" });
  assert.ok(!listings.some((l) => l.store === "b"));
});

test("two prices more than 3x apart in a region: neither is shown there", () => {
  const two = (a: number, b: number) => saneOffers([a, b].map((p, i) => ({ s: `s${i}`, p, st: "in" as const, u: "" })));
  assert.equal(two(1999, 12999).length, 0, "a 1 L at 19.99 against the 5 L at 129.99");
  assert.equal(two(1999, 2999).length, 2);
});

test("listings naming a different pack under one barcode: the size most stores name wins", () => {
  const out = mergeListings(
    [L("a", "AU", 2199), L("b", "AU", 2299), L("c", "AU", 1200, { title: "Penrite HPR 5 5W-40 Engine Oil 1L" })],
    fresh(),
    "2026-10-30",
  );
  assert.deepEqual(out[0].offers.AU!.map((o) => o.s), ["a", "b"]);
});

test("one store says 50 ml, the other 100 ml: the barcode is left out", () => {
  const bottle = (store: string, cents: number, title: string) => L(store, "AU", cents, { title, kind: "Engine Oil" });
  const out = mergeListings([bottle("a", 9900, "Penrite HPR 5 5W-40 Engine Oil 1L"), bottle("b", 15900, "Penrite HPR 5 5W-40 Engine Oil 5L")], fresh(), "2026-10-30");
  assert.equal(out.length, 0);
});

test("one brand spelling across the catalogue", () => {
  const nine = ean("930028909999");
  const out = mergeListings(
    [
      L("a", "AU", 2199, { vendor: "PENRITE" }),
      L("b", "AU", 2299, { vendor: "PENRITE" }),
      L("a", "AU", 1500, { vendor: "penrite", ean: nine, title: "penrite Enviro+ 10W-30 Engine Oil 5L" }),
      L("b", "AU", 1600, { vendor: "penrite", ean: nine, title: "penrite Enviro+ 10W-30 Engine Oil 5L" }),
      L("c", "AU", 1600, { vendor: "PENRITE", ean: nine, title: "penrite Enviro+ 10W-30 Engine Oil 5L" }),
    ],
    fresh(),
    "2026-10-30",
  );
  assert.deepEqual([...new Set(out.map((p) => p.brand))], ["Penrite"], "the known brand spelling");
});

test("two part keys never share a slug, even when a kept slug collides", () => {
  const st = fresh();
  const mk = (pn: string): Listing[] =>
    ["a", "b"].map((s) => L(s, "AU", 30000, { ean: `pn:injectordynamics:${pn}`, vendor: "Injector Dynamics", kind: "", title: "Injector Dynamics XDS Fuel Injectors" }));
  st.slugs["pn:injectordynamics:13006011D6"] = "injector-dynamics-xds-fuel-injectors-011d6";
  st.slugs["pn:injectordynamics:17506011D6"] = "injector-dynamics-xds-fuel-injectors-011d6";
  const out = mergeListings([...mk("10506011D6"), ...mk("13006011D6"), ...mk("17506011D6")], st, "2026-11-08");
  const slugs = out.map((p) => p.slug);
  assert.equal(new Set(slugs).size, 3, slugs.join(" "));
});

test("a title names the category; one store's own category alone does not", () => {
  const H = ean("930028905555");
  const t = "Haltech Nexus PD16 Tube Mount Kit HT-039082";
  const out = mergeListings(
    [
      L("a", "AU", 9900, { ean: H, vendor: "Haltech", title: t, kind: "Batteries & Electrical" }),
      L("b", "AU", 9900, { ean: H, vendor: "Haltech", title: t, kind: "ECU Accessories" }),
      L("c", "AU", 9900, { ean: H, vendor: "Haltech", title: t, kind: "Haltech" }),
    ],
    fresh(),
    "2026-11-09",
  );
  assert.equal(out[0].cat, "other");
  const oil = mergeListings([L("a", "AU", 2199, { title: "Penrite HPR 5 5L", kind: "Engine Oil" }), L("b", "AU", 2299, { title: "Penrite HPR 5 5L", kind: "Engine Oil" })], fresh(), "2026-11-09");
  assert.equal(oil[0].cat, "oil", "every store's type agrees");
});
