// Per-category specs read from real store titles (src/lib/specs.ts, DECISIONS.md 2026-11-09).
import { test } from "node:test";
import assert from "node:assert/strict";
import { specsOf } from "@/lib/specs";

const get = (t: string, cat: Parameters<typeof specsOf>[1]) => Object.fromEntries(specsOf(t, cat).map((s) => [s.label, s.value]));

test("oil: viscosity, base, approvals and volume as printed", () => {
  const s = get("Penrite HPR 5 5W-30 Fully Synthetic Engine Oil ACEA C3 API SN 5L", "oil");
  assert.equal(s.Viscosity, "5W-30");
  assert.equal(s.Base, "Fully synthetic");
  assert.equal(s.ACEA, "C3");
  assert.equal(s.API, "SN");
  assert.equal(s.Volume, "5L");
});

test("batteries: size code, voltage, Ah and CCA", () => {
  const s = get("Invicta Hybrid Lithium Battery 95DL 12V 80Ah 1200CCA SNLH95DL", "batteries");
  assert.equal(s.Voltage, "12V");
  assert.equal(s.Capacity, "80Ah");
  assert.equal(s["Cold cranking"], "1200 CCA");
  assert.equal(s.Type, "Lithium");
  assert.equal(get("Century N70ZZL MF Car Battery 12V 600CCA", "batteries")["Battery size"], "N70ZZL");
});

test("wipers: both blade lengths of a pair, inches converted", () => {
  assert.equal(get("Bosch Aerotwin A929S Wiper Blade Set 600/450mm", "wipers")["Blade length"], "600/450mm");
  assert.equal(get('Bosch Wiper Blade 26"/16"', "wipers")["Blade length"], "660/406mm");
  assert.equal(get("Bosch Wiper Blade 650mm", "wipers")["Blade length"], "650mm");
});

test("globes: type, voltage, wattage", () => {
  const s = get("Narva H7 12V 55W Headlight Globes (Pair)", "globes");
  assert.equal(s["Globe type"], "H7");
  assert.equal(s.Voltage, "12V");
  assert.equal(s.Wattage, "55W");
  assert.equal(s.Pack, "Pair (2)");
});

test("brakes: rotor diameter only for a rotor, DOT grade for fluid", () => {
  assert.equal(get("Bendix DB1395GCT Front Brake Pad Set 296mm", "brakes").Diameter, undefined);
  assert.equal(get("DBA 4000 Series Front Brake Rotor 296mm", "brakes").Diameter, "296mm");
  assert.equal(get("Penrite DOT 4 Brake Fluid 500ml", "brakes")["DOT grade"], "DOT 4");
});

test("a spec the title does not state is left out", () => {
  assert.deepEqual(specsOf("Ryco Z386 Oil Filter", "filters"), [{ label: "Filter", value: "Oil" }]);
  assert.deepEqual(specsOf("NGK Iridium Spark Plug - DILFR6D8 2.7L", "plugs"), [{ label: "Electrode", value: "Iridium" }]);
  assert.equal(get("Haltech Weld Fitting - Aluminium Thread: M14 x 1.5", "other").Thread, "M14 x 1.5");
});

import { crossRefs, matchSpecs, statedFit } from "@/lib/specs";
import { mergeListings, sameSpecs } from "@/lib/merge";
import type { Listing } from "@/lib/types";

test("stated fitment and cross-references are quoted, never invented", () => {
  assert.equal(statedFit("K&N Replacement Air Filter Suits Ford FG & FGX 2L"), "Ford FG & FGX 2L");
  assert.equal(statedFit("Hulk 4X4 Dual Battery Tray to Suit Landcruiser 200 Series (2009-08/16)"), "Landcruiser 200 Series (2009-08/16)");
  assert.equal(statedFit("Ryco Z386 Oil Filter"), null);
  assert.deepEqual(crossRefs("Oil Filter OEM 04152-YZZA1 replaces 90915-YZZJ1"), ["04152-YZZA1", "90915-YZZJ1"]);
  assert.deepEqual(crossRefs("Oil Filter - OEM Quality"), []);
  assert.equal(matchSpecs("Front & Rear Brake Pad Set", "brakes").Position, undefined);
});

const row = (store: string, title: string, cat: "wipers" | "brakes" | "globes") => ({ l: { store, title } as Listing, info: { cat } });

test("one part key, two blade lengths: the majority length wins, a tie drops the part", () => {
  const rows = [row("a", "Bosch Wiper Blade A 650mm", "wipers"), row("b", "Bosch Wiper Blade A 650mm", "wipers"), row("c", "Bosch Wiper Blade A 600mm", "wipers"), row("d", "Bosch Wiper Blade A", "wipers")];
  assert.deepEqual(sameSpecs(rows).map((r) => r.l.store), ["a", "b", "d"]);
  assert.deepEqual(sameSpecs(rows.slice(1, 3)), []);
});

test("front and rear pads under one part number never share a price list", () => {
  const rows = [row("a", "Bendix Front Brake Pads DB1395", "brakes"), row("b", "Bendix Rear Brake Pads DB1395", "brakes")];
  assert.deepEqual(sameSpecs(rows), []);
});

test("12 V and 24 V globes under one key conflict", () => {
  const rows = [row("a", "Narva H7 12V Globe", "globes"), row("b", "Narva H7 24V Globe", "globes")];
  assert.deepEqual(sameSpecs(rows), []);
  void mergeListings;
});
