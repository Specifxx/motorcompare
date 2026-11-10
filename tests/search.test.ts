// Search matches whole words (or word starts from four letters), and finds part numbers, OE numbers and quoted fit (2026-11-10).
import { test } from "node:test";
import assert from "node:assert/strict";
import { searchRows, shopSearchLinks, type IndexRow } from "@/lib/browse";

const row = (slug: string, name: string, brand: string, extra = ""): IndexRow => [slug, name, "other", "", { AU: 1000 }, brand, "", 0, 0, 0, "2026-11-01", extra];
const rows = [
  row("h4", "Narva H4 60/55W Globe", "Narva"),
  row("th400", "Haltech TH400 Transmission Harness", "Haltech"),
  row("dba", "DBA 4000 Series Rotor", "DBA"),
  row("redback", "Redback Cable Kit", "Redback"),
  row("wg", "Turbosmart WG38 Wastegate", "Turbosmart", "ts-0551-1011"),
  row("z418", "Ryco Z418 Oil Filter", "Ryco", "z418 3030 toyota landcruiser"),
];

test("a short word is a whole word: H4 is the globe, never TH400; DBA is DBA, never Redback", () => {
  assert.deepEqual(searchRows(rows, "h4").map((r) => r[0]), ["h4"]);
  assert.deepEqual(searchRows(rows, "dba").map((r) => r[0]), ["dba"]);
});

test("a longer word matches the start of a word", () => {
  assert.deepEqual(searchRows(rows, "wastegat").map((r) => r[0]), ["wg"]);
  assert.deepEqual(searchRows(rows, "landcruis").map((r) => r[0]), ["z418"], "the cars a store quotes are searchable");
});

test("part numbers and OE numbers are searchable", () => {
  assert.deepEqual(searchRows(rows, "z418").map((r) => r[0]), ["z418"]);
  assert.deepEqual(searchRows(rows, "3030").map((r) => r[0]), ["z418"]);
});

test("a search with no result offers the big shops' own searches for the same words", () => {
  assert.deepEqual(searchRows(rows, "zzzz nothing"), []);
  const links = shopSearchLinks("n70zz battery");
  assert.deepEqual(links.map((l) => l.name), ["Supercheap Auto", "Repco", "Sparesbox", "eBay"]);
  assert.ok(links.every((l) => l.href.includes("n70zz%20battery")));
});
