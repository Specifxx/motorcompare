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
