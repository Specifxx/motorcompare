// Every rule in src/lib/title.ts has a store-style title here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { amountOf, categoryOf, cleanName, listingAmounts, partCode, pickName, readTitle, sizeOf, sizesConflict, tidyName } from "@/lib/title";

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
