// Fitment read from real store listings (src/lib/fitment.ts, probe/fitment-summary.md 2026-11-09).
import { test } from "node:test";
import assert from "node:assert/strict";
import { fitmentOf, oeNumbersOf } from "@/lib/fitment";
import { listingsFromProduct } from "@/lib/import/shopify";
import { mergeListings } from "@/lib/merge";
import { STORES } from "@/content/stores";

test("Autocave: Make/Model tags and the 'to suit:' block, plus OE equivalents", () => {
  const body = "<p>Front brake package to suit:</p><p>Renault Clio RS 200 and Sport 197 - MK3 2010-2014</p><p>Package contains:</p><p>2x Brembo brake disc rotors (312mm diameter)</p><p>OE equivalent numbers: 7701208130, 7701210178, 8200266743</p>";
  assert.deepEqual(fitmentOf(["brake kit", "Make: Renault", "Model: Clio RS"], body), ["Renault Clio RS", "Renault Clio RS 200 and Sport 197 - MK3 2010-2014"]);
  assert.deepEqual(oeNumbersOf(body), ["7701208130", "7701210178", "8200266743"]);
});

test("Universal Auto Spares: 'Fit For' lines, capped at three", () => {
  const body = "<p>Fitment:</p><p>Fit For Volkswagen Touareg 7L / 7LA / 7L6 / 7L7 2003-2010</p><p>Fit For Porsche Cayenne 955 / 957 / 9PA 2003-2010</p><p>Fit For Audi Q7 4L 2006-2015</p><p>Fit For Seat Leon 2005-2012</p><p>Package:</p>";
  const f = fitmentOf([], body);
  assert.equal(f.length, 3);
  assert.equal(f[0], "Volkswagen Touareg 7L / 7LA / 7L6 / 7L7 2003-2010");
});

test("JustJap: car: tags lose their prefix; a listing that states nothing has no fitment", () => {
  assert.deepEqual(fitmentOf(["370Z", "car: Nissan FAIRLADY Z / 370Z  Z34 08 - 20", "chassis: J50"], ""), ["Nissan FAIRLADY Z / 370Z Z34 08 - 20"]);
  assert.deepEqual(fitmentOf(["cross-ref"], "<p>The NTK oil filter.</p>"), []);
  assert.deepEqual(oeNumbersOf("<p>OEM Quality parts</p>"), []);
});

test("fitment is kept per store and capped at three stores, never merged", () => {
  const store = STORES.find((s) => s.platform === "shopify" && s.region === "AU")!;
  const mk = (id: string, fit?: string[]) => ({ store: id, region: "AU" as const, title: "NGK BKR6E Spark Plug", vendor: "NGK", kind: "Spark Plugs", ean: "pn:ngk:BKR6E", cents: 900, st: "in" as const, url: `https://${id}.example/p`, img: null, ...(fit ? { fit } : {}) });
  const out = mergeListings([mk("a", ["Ford Falcon BA"]), mk("b"), mk("c", ["Holden VT"]), mk("d", ["Mazda 3"]), mk("e", ["Kia Rio"])], { slugs: {}, first: {} }, "2026-11-09");
  assert.deepEqual(out[0].fit, { a: ["Ford Falcon BA"], c: ["Holden VT"], d: ["Mazda 3"] });
  void store;
  void listingsFromProduct;
});
