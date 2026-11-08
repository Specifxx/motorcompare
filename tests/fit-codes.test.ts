// Shop by part code (lib/fit-codes.ts, DECISIONS.md 2026-11-08).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { codeSlug, FIT_INDEX_MIN, fitIndexable, fitPath } from "../src/lib/fit-codes";
import { partCode } from "../src/lib/title";

test("codes from real titles become stable hub paths", () => {
  assert.equal(fitPath("oil", partCode("Penrite HPR 5 5W-30 Engine Oil 5L", "oil")!), "/fit/oil/5w-30");
  assert.equal(fitPath("batteries", partCode("Century N70ZZ MF Car Battery", "batteries")!), "/fit/batteries/n70zz");
  assert.equal(fitPath("globes", partCode("Philips H4 X-tremeVision Headlight Globes", "globes")!), "/fit/globes/h4");
  assert.equal(codeSlug("DIN55"), "din55");
});

test("a code hub is indexed only with 3+ products (owner, 2026-11-08)", () => {
  assert.equal(FIT_INDEX_MIN, 3);
  assert.equal(fitIndexable(2), false);
  assert.equal(fitIndexable(3), true);
});

test("no make-and-model fitment claim on the hubs (CLAUDE.md)", () => {
  for (const f of ["src/app/fit/page.tsx", "src/app/fit/[cat]/[code]/page.tsx"]) {
    const s = fs.readFileSync(f, "utf8");
    assert.match(s, /don&apos;t (say|claim) which cars a part fits/, f);
    assert.doesNotMatch(s, /\bfits your\b/i, f);
  }
});
