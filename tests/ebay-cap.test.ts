// MotorCompare shares Cyberpunk Compare's eBay keyset (owner, 2026-11-10): 3,300 Browse calls a day of its 5,000, a ceiling
// EBAY_DAILY_CAP can only lower, and only Australia is searched (the site shows no other market).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src = fs.readFileSync("scripts/ebay-import.ts", "utf8");

test("3,300 calls a day, and the variable can only lower it", () => {
  assert.match(src, /const EBAY_MAX_DAILY_CALLS = 3300;/);
  assert.match(src, /Math\.min\(EBAY_MAX_DAILY_CALLS, Number\(process\.env\.EBAY_DAILY_CAP \|\| EBAY_MAX_DAILY_CALLS\)\)/);
});

test("only the site's own regions are searched", () => {
  assert.match(src, /filter\(\(r\) => ACTIVE_REGIONS\.some\(\(x\) => x\.code === r\)\)/);
});

test("the US gets most of the day's calls, the other markets their share, and unused share is handed back", async () => {
  const { planEbay, EBAY_REGION_SHARE } = await import("@/lib/ebay");
  const mk = (n: number, regions: string[]) =>
    Array.from({ length: n }, (_, i) => ({ ean: `pn:x:${String(i).padStart(4, "0")}`, brand: "x", offers: Object.fromEntries(regions.map((r) => [r, [{ price: 5000 }]])) })) as never[];
  const all = mk(500, ["US", "UK", "CA", "AU"]);
  const plan = planEbay(all, {}, ["US", "UK", "CA", "AU"] as never[], 100, undefined, "2026-11-10", undefined, undefined, EBAY_REGION_SHARE);
  const by = (r: string) => plan.filter((p) => p.region === r).length;
  assert.equal(plan.length, 100);
  assert.ok(by("US") >= 60);
  assert.ok(by("UK") >= 15 && by("CA") >= 10 && by("AU") >= 10);
  // No UK stock due: its share goes back to the others, the budget is still spent.
  const usOnly = planEbay(mk(500, ["US"]), {}, ["US", "UK"] as never[], 100, undefined, "2026-11-10", undefined, undefined, EBAY_REGION_SHARE);
  assert.equal(usOnly.length, 100);
});
