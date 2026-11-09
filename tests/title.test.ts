// Every rule in src/lib/title.ts has a store-style title here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { amountOf, categoryOf, cleanName, listingAmounts, packCount, partCode, pickName, readTitle, sizeOf, sizesConflict, tidyName } from "@/lib/title";

const refused = (t: string) => {
  const r = readTitle(t);
  return "refused" in r ? r.refused : null;
};

test("new parts pass", () => {
  for (const t of [
    "Penrite HPR 5 5W-30 Engine Oil 5L",
    "Century NS40ZL Hi Performance Car Battery",
    "Bosch Aerotwin A929S Wiper Blade Set 600/450mm",
    "Narva H4 Plus 120 Headlight Globes (Pair)",
    "Ryco Z386 Oil Filter",
    "NGK BKR6EIX Iridium Spark Plug 4 Pack",
    "Meguiar's Gold Class Car Wash 1.89L",
  ])
    assert.equal(refused(t), null, t);
});

test("used, damaged, core charges, bundles and merch are refused", () => {
  assert.equal(refused("Used Toyota Hilux Alternator"), "pre-owned");
  assert.equal(refused("Reconditioned Starter Motor"), "pre-owned");
  assert.equal(refused("Exide Battery N70ZZ (Box Damaged)"), "damaged");
  assert.equal(refused("Battery Core Charge"), "core");
  assert.equal(refused("Oil Change Bundle: Penrite 5L + Ryco Filter"), "bundle");
  assert.equal(refused("Buy 2 Get 1 Free Wiper Blades"), "bundle");
  assert.equal(refused("Detailing Mystery Box"), "mystery");
  assert.equal(refused("Gift Card $50"), "not-part");
  assert.equal(refused("Workshop T-Shirt Black"), "apparel");
});

test("categories: what it is decides, chargers are accessories", () => {
  const c = (t: string, k = "") => categoryOf(t, k);
  assert.equal(c("Penrite HPR 5 5W-30 Engine Oil 5L"), "oil");
  assert.equal(c("Century NS40ZL Car Battery"), "batteries");
  assert.equal(c("CTEK MXS 5.0 Battery Charger"), "accessories", "a battery charger is not a battery");
  assert.equal(c("Noco Boost GB40 Jump Starter"), "accessories");
  assert.equal(c("Bosch Aerotwin 600mm Wiper Blade"), "wipers");
  assert.equal(c("Bowden's Own Wash Fluid 1L"), "fluids", "washer fluid is a fluid, not a blade");
  assert.equal(c("Narva H7 Plus 130 Globes"), "globes");
  assert.equal(c("Ryco Z386 Oil Filter"), "filters");
  assert.equal(c("NGK BKR6E Spark Plug"), "plugs");
  assert.equal(c("Bendix General CT Brake Pads DB1170"), "brakes");
  assert.equal(c("Penrite Brake Fluid DOT 4 500ml"), "brakes", "brake fluid is brakes");
  assert.equal(c("Nulon Long Life Coolant 5L"), "fluids");
  assert.equal(c("Castrol Transmax ATF Dexron VI 4L"), "fluids");
  assert.equal(c("Meguiar's Ultimate Snow Foam 1.9L"), "care");
  assert.equal(c("Mystery Widget", "Engine Oil"), "oil", "the store's type decides when the title says nothing");
  assert.equal(c("Bonnet Strut"), "other");
  assert.equal(c("Century 12V NS70ZZ Car Battery"), "batteries", "12V is a battery's voltage, not an accessory");
  assert.equal(c("Turbosmart BOV GenV ProPort Spring (4 inHg) Pink TS-0208-9006"), "other", "a part number ending 9006 is no globe");
  assert.equal(c("Narva 9006 Plus 110 Globe"), "globes");
  assert.equal(c("Turbosmart Engine Oil Filter -6AN 44 Micron"), "filters", "an oil filter is a filter");
  assert.equal(c("Haltech Coolant Temp Sensor - Large Thread HT010302"), "other", "a coolant sensor is not coolant");
  assert.equal(c("Haltech 1/4\" Open Tip Thermocouple Length: 0.72m"), "other");
});

test("sizes and the fit code", () => {
  assert.equal(sizeOf("Penrite HPR 5 5W-30 Engine Oil 5L"), "5L");
  assert.equal(sizeOf("Castrol Edge 0W-20 5 Litre"), "5L");
  assert.equal(sizeOf("Penrite Brake Fluid DOT 4 500ml"), "500ml");
  assert.equal(sizeOf("Bosch Aerotwin 650mm Wiper Blade"), "650mm");
  assert.equal(sizeOf("Rain-X Latitude 26\" Wiper"), "660mm");
  assert.equal(partCode("Penrite HPR 5 5w30 Engine Oil 5L", "oil"), "5W-30");
  assert.equal(partCode("Century NS40ZL Car Battery", "batteries"), "NS40ZL");
  assert.equal(partCode("Exide Extreme DIN55 MF", "batteries"), "DIN55");
  assert.equal(partCode("Narva H4 Plus 120", "globes"), "H4");
  assert.equal(partCode("Bosch Aerotwin 650mm Wiper Blade", "wipers"), "650mm");
  assert.equal(partCode("Ryco Z386 Oil Filter", "filters"), "Z386");
  assert.equal(partCode("Ryco Oil Filter", "filters"), null, "never guessed");
  assert.deepEqual(amountOf("5L"), { dim: "amount", n: 5000 });
  assert.equal(sizesConflict(amountOf("1L"), amountOf("5L")), true);
  assert.equal(sizesConflict(amountOf("5L"), amountOf("5000ml")), false);
  assert.deepEqual(listingAmounts("Engine Oil 1L / 5L"), []);
});

test("names", () => {
  assert.equal(cleanName("PENRITE HPR 5 5W-30 ENGINE OIL 5 LITRE"), "Penrite HPR 5 5W-30 Engine Oil 5L");
  assert.equal(cleanName("Ryco Z386 Oil Filter - Free Shipping"), "Ryco Z386 Oil Filter");
  assert.equal(tidyName("Century - NS40ZL Car Battery", "Century"), "Century NS40ZL Car Battery");
  assert.equal(pickName(["Ryco Z386 Oil Filter", "Ryco Z386 Oil Filter", "RYCO Z386"]), "Ryco Z386 Oil Filter");
});

// ---- 2026-11-09: sizes are per category, and a pack is not a single ----
test("a size is only what the category means by one (real store titles)", () => {
  // Engine displacement is not a pack size.
  assert.equal(sizeOf("NGK Iridium Spark Plug - DILFR6D8 2.7L"), null);
  assert.equal(sizeOf("Exedy Holden Commodore VT-VZ LS1 5.7l Exedy Sports Tuff Clutch Kit"), null);
  assert.equal(sizeOf("K&N Replacement Air Filter Suit Ford BA & BF 4L"), null);
  assert.equal(sizeOf("Bendix U4WD-BUK34 Ultimate 4WD Upgrade Kit for Toyota Land Cruiser 4.5L"), null);
  assert.equal(sizeOf("Penrite HPR 5 5W-40 Engine Oil 5L"), "5L");
  assert.equal(sizeOf("Penrite 5.0L V8 Race Oil 5L".replace("5L", ""), "oil"), null, "5.0L V8 names an engine");
  assert.equal(sizeOf("K&N Filter Oil 12.25oz Aerosol Spray K99-0516 362ml"), "362ml");
  assert.equal(sizeOf("Bosch Aerotwin A929S Wiper Blade 650mm"), "650mm");
  // A decimal inch never loses its whole part: 1.625" is not 25".
  assert.equal(sizeOf('Haltech Nexus PD16 Tube Mount Kit 1.625" HT-039082'), null);
  assert.equal(sizeOf('Haltech Driveshaft Split Collar 1.875"/ 47.63mm I.D. 8 Magnet'), null);
  assert.equal(sizeOf('Bosch Wiper Blade 26"'), "660mm");
});

test("pack counts come from the words, never guessed", () => {
  assert.equal(packCount("NGK BKR6EIX Iridium Spark Plug 4 Pack"), 4);
  assert.equal(packCount("Haltech Plug and Pins Suit Ford Coyote Ignition Coils (Set of 8)"), 8);
  assert.equal(packCount("Narva H4 Plus 120 Headlight Globes (Pair)"), 2);
  assert.equal(packCount("Meguiar's Gold Class Rich Leather Wipes 25 Pack"), 25);
  assert.equal(packCount("Ryco Z386 Oil Filter"), null);
  assert.equal(packCount("Cable 4 x 20AWG 10m"), null);
});

test("a single and a pack under one part number conflict", () => {
  const a = listingAmounts("NGK BKR6E Spark Plug");
  const b = listingAmounts("NGK BKR6E Spark Plug 4 Pack");
  const c = listingAmounts("NGK BKR6E Spark Plugs Set of 4");
  assert.equal(sizesConflict(b[0], c[0]), false);
  const two = listingAmounts("Narva H7 Globes (Pair)");
  assert.equal(sizesConflict(two[0], b[0]), true);
});
