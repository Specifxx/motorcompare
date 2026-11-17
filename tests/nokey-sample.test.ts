import test from "node:test";
import assert from "node:assert/strict";
import { noKeySample, NOKEY_SAMPLES } from "@/lib/import/shopify";

test("a keyless listing is recorded as brand | sku | title", () => {
  assert.equal(noKeySample("Ryco", "Z386", "Ryco Oil Filter Z386"), "Ryco | Z386 | Ryco Oil Filter Z386");
  assert.equal(noKeySample("", null, "Wiper blade 600mm"), "- | - | Wiper blade 600mm");
  assert.ok(noKeySample("x", "s".repeat(80), "t".repeat(200)).length < 130);
  assert.equal(NOKEY_SAMPLES, 6);
});
