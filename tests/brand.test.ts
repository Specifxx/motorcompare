import { test } from "node:test";
import assert from "node:assert/strict";
import { brandFromTitle, brandName, canonicalKey, listingBrand } from "@/lib/brand";

test("one maker, however a store spells it", () => {
  assert.equal(canonicalKey("CENTURY"), canonicalKey("Century Batteries"));
  assert.equal(canonicalKey("Penrite Oil"), canonicalKey("Penrite"));
  assert.equal(canonicalKey("Liqui Moly"), canonicalKey("LIQUI MOLY Australia"));
  assert.equal(canonicalKey("Mann"), canonicalKey("Mann-Filter"));
  assert.equal(brandName(canonicalKey("meguiars"), ["MEGUIARS", "Meguiars"]), "Meguiar's");
  assert.equal(brandName("newmaker", ["NewMaker", "NewMaker", "NEWMAKER"]), "NewMaker");
});

test("a vendor that is the store itself falls back to the title", () => {
  assert.equal(listingBrand("Battery Shop", "Century NS40ZL Car Battery", "Battery Shop"), "Century");
  assert.equal(listingBrand("", "Narva H4 Plus 120 Headlight Globes", "Shop"), "Narva");
  assert.equal(listingBrand("Penrite", "HPR 5 5W-30 Engine Oil 5L", "Shop"), "Penrite");
  assert.equal(listingBrand("Aftermarket", "Bosch Aerotwin 600mm Wiper Blade", "Shop"), "Bosch", "a generic vendor is not a maker");
  assert.equal(brandFromTitle("[NEW] Liqui Moly Top Tec 4200 5W-30 5L"), "Liqui Moly");
  assert.equal(brandFromTitle("Some Unknown Part"), null);
});
