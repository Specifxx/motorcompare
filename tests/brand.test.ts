import { test } from "node:test";
import assert from "node:assert/strict";
import { brandFromTitle, brandName, canonicalKey, listingBrand } from "@/lib/brand";
import { partKey } from "@/lib/partno";
import { makerOf } from "@/content/stores";

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

test("a maker's own shop: its own name in the vendor field is the brand (2026-11-18 noKey samples)", () => {
  // Turbosmart's US shop writes "Turbosmart USA" as the vendor of every product; 1,370 listings keyed nothing.
  const ts = makerOf({ name: "Turbosmart USA", official: true, brand: "Turbosmart" });
  assert.equal(ts, "Turbosmart");
  assert.equal(listingBrand("Turbosmart USA", "3 Port 12.7W Boost Control Solenoid - eBoost3", "Turbosmart USA", ts), "Turbosmart");
  assert.equal(partKey(listingBrand("Turbosmart USA", "3 Port 12.7W Boost Control Solenoid - eBoost3", "Turbosmart USA", ts), "TS-0301-3007"), "pn:turbosmart:TS03013007");
  // the same key a retailer's Turbosmart listing gets
  assert.equal(partKey(listingBrand("Turbosmart", "Turbosmart eBoost3 Solenoid", "Golebys Parts"), "TS-0301-3007"), "pn:turbosmart:TS03013007");
  // without a brand override, the shop's own name
  assert.equal(listingBrand("DeatschWerks", "DW Brushless Fuel Pump PWM Controller", "DeatschWerks", makerOf({ name: "DeatschWerks", official: true })), "DeatschWerks");
  // an empty vendor in a maker's shop (Odyssey's WooCommerce store)
  assert.equal(listingBrand("", "8DT L-Terminal Kit", "Odyssey Battery", makerOf({ name: "Odyssey Battery", official: true, brand: "Odyssey" })), "Odyssey");
  // a retailer that writes itself as the vendor still gets no brand from the shop (My Auto Parts: own SKUs, nothing shared)
  assert.equal(makerOf({ name: "My Auto Parts" }), null);
  assert.equal(listingBrand("My Auto Parts", "Toyota Camry OEM C Pillar Mould 04/2015 to 11/2017 - 7505606010", "My Auto Parts", makerOf({ name: "My Auto Parts" })), null);
  // another maker's vendor in an official shop keeps that maker
  assert.equal(listingBrand("NGK", "NGK BKR6E Spark Plug", "Turbosmart USA", ts), "NGK");
});

test("an official shop that resells: a known maker in the title still wins", () => {
  assert.equal(listingBrand("UroTuning", "Bosch Spark Plug FR7NPP332", "UroTuning", makerOf({ name: "UroTuning", official: true })), "Bosch");
});
