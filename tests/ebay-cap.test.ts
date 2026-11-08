// MotorCompare shares Compare Empire's eBay keyset (owner, 2026-11-08): 600 Browse calls a day of its 5,000, a ceiling
// EBAY_DAILY_CAP can only lower, and only Australia is searched (the site shows no other market).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src = fs.readFileSync("scripts/ebay-import.ts", "utf8");

test("600 calls a day, and the variable can only lower it", () => {
  assert.match(src, /const EBAY_MAX_DAILY_CALLS = 600;/);
  assert.match(src, /Math\.min\(EBAY_MAX_DAILY_CALLS, Number\(process\.env\.EBAY_DAILY_CAP \|\| EBAY_MAX_DAILY_CALLS\)\)/);
});

test("only the site's own regions are searched", () => {
  assert.match(src, /filter\(\(r\) => REGIONS\.some\(\(x\) => x\.code === r\)\)/);
});
