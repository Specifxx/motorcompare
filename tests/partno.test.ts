// Brand + manufacturer part number matching (lib/partno.ts, DECISIONS.md 2026-11-08).
import { test } from "node:test";
import assert from "node:assert/strict";
import { isPartKey, isPartKeyShape, partKey, partNoOf, partNumber } from "@/lib/partno";
import { namesPart } from "@/lib/ebay";
import { listingsFromProduct } from "@/lib/import/shopify";
import type { Store } from "@/content/stores";

test("a SKU is a part number only when it looks like one", () => {
  assert.equal(partNumber("Z386"), "Z386");
  assert.equal(partNumber("z-386"), "Z386");
  assert.equal(partNumber("BKR6E"), "BKR6E");
  assert.equal(partNumber("NS70ZZ"), "NS70ZZ");
  assert.equal(partNumber("NGK-BKR6E", "NGK"), "BKR6E", "the brand in front of the number is dropped");
  assert.equal(partNumber("12345"), null, "digits alone are a store's own running number");
  assert.equal(partNumber("ABC"), null, "too short");
  assert.equal(partNumber("H4"), null, "too short to be unique");
  assert.equal(partNumber("BLACK2"), null, "a variant name");
  assert.equal(partNumber(""), null);
  assert.equal(partNumber(null), null);
});

test("no brand, no key; the brand is folded so two spellings meet", () => {
  assert.equal(partKey(null, "Z386"), null);
  assert.equal(partKey("Ryco", "Z386"), "pn:ryco:Z386");
  assert.equal(partKey("RYCO", "z 386"), "pn:ryco:Z386");
  assert.equal(partKey("NGK Spark Plugs", "BKR6E"), partKey("NGK", "BKR6E"), "suffixes fold");
  assert.notEqual(partKey("Ryco", "Z386"), partKey("Wesfil", "Z386"), "another maker's same number is another part");
  assert.ok(isPartKey("pn:ryco:Z386") && !isPartKey("9300289012345"));
  assert.equal(partNoOf("pn:ryco:Z386"), "Z386");
  assert.equal(partNoOf("9300289012345"), null);
  assert.ok(isPartKeyShape("pn:ryco:Z386") && !isPartKeyShape("pn:ryco:<script>"));
});

test("a Shopify variant with a brand and a part-number SKU is a listing; one without is not", () => {
  const store: Store = { id: "shop", name: "Some Parts Shop", region: "AU", base: "https://shop.example", platform: "shopify" };
  const product = (vendor: string, sku: string) => ({ id: 1, title: "Ryco Z386 Oil Filter", handle: "z386", vendor, product_type: "Filters", tags: [], body_html: "", images: [], variants: [{ id: 2, title: "Default Title", price: "12.99", available: true, sku }] });
  assert.equal(listingsFromProduct(store, product("Ryco", "Z386")).listings[0]?.ean, "pn:ryco:Z386");
  assert.equal(listingsFromProduct(store, product("Some Parts Shop", "Z386")).listings[0]?.ean, "pn:ryco:Z386", "the store's own name falls back to the maker in the title");
  assert.equal(listingsFromProduct(store, product("Ryco", "10442")).noEan, 1, "a running number is no key");
});

test("eBay by keywords: the title must carry the brand and the exact number", () => {
  assert.ok(namesPart("Ryco Z386 Oil Filter suits Holden", "Ryco", "Z386"));
  assert.ok(namesPart("RYCO Z-386 oil filter", "Ryco", "Z386"));
  assert.ok(!namesPart("Ryco Z386A Oil Filter", "Ryco", "Z386"), "another number");
  assert.ok(!namesPart("Wesfil WZ386 = Z386 equivalent", "Ryco", "Z386"), "another maker");
});
