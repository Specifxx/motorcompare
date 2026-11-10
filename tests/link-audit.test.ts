import test from "node:test";
import assert from "node:assert/strict";
import { applyAudit, checkOrder, judge, judgeAudit, type AuditFile } from "../src/lib/link-audit";
import type { Product } from "../src/lib/types";

const base = { store: "ppdperformance", vid: "111", inStock: true, cents: 1000, ean: "pn:ryco:Z386" };
const js = (sku: string, available = true, id = 111) => ({ variants: [{ id, sku, price: 1000, available }] });

test("a variant that still carries the part number and stock passes", () => {
  assert.equal(judge(base, js("RYCO-Z386"), 200, "2026-11-10"), null);
});
test("a gone product leaves the offer out; a blocked or failing read is no verdict", () => {
  assert.equal(judge(base, null, 404, "d")?.a, "offer");
  assert.equal(judge(base, null, 403, "d"), null);
  assert.equal(judge(base, null, 0, "d"), null);
});
test("a variant the product no longer has, or a SKU for another part, leaves the offer out", () => {
  assert.equal(judge(base, js("Z386", true, 999), 200, "d")?.r, "variant");
  assert.equal(judge(base, js("Z999"), 200, "d")?.r, "sku");
});
test("a sold-out variant only loses its checkout link", () => {
  const b = judge(base, js("Z386", false), 200, "d");
  assert.deepEqual([b?.r, b?.a], ["sold-out", "variant"]);
  assert.equal(judge({ ...base, inStock: false }, js("Z386", false), 200, "d"), null);
});

const prod = (offers: Product["offers"]): Product => ({ ean: "pn:ryco:Z386", slug: "s", name: "n", brand: "b", b: "", cat: "filters", size: null, img: null, first: "2026-11-01", offers } as unknown as Product);
const audit = (bad: AuditFile["bad"]): AuditFile => ({ updatedAt: "", checked: {}, bad });

test("applyAudit drops a bad offer, strips a dead variant and removes a product left with nothing", () => {
  const a = { s: "a", p: 1, st: "in", u: "u", v: "1" } as Product["offers"]["AU"] extends (infer O)[] | undefined ? O : never;
  const b = { ...a, s: "b", v: "2" };
  const f = prod({ AU: [a, b] });
  const out = applyAudit([f], audit({ "a:1": { r: "sku", a: "offer", d: "" }, "b:2": { r: "sold-out", a: "variant", d: "" } }));
  assert.equal(out[0].offers.AU?.length, 1);
  assert.equal(out[0].offers.AU?.[0].v, undefined);
  assert.equal(applyAudit([prod({ AU: [a] })], audit({ "a:1": { r: "gone", a: "offer", d: "" } })).length, 0);
  assert.deepEqual(applyAudit([f], null), [f]);
});
test("checkOrder: found-bad first, then never checked, then oldest", () => {
  const au: AuditFile = { updatedAt: "", checked: { a: 5, b: 3 }, bad: { b: { r: "sku", a: "offer", d: "" } } };
  assert.deepEqual(checkOrder([{ key: "a" }, { key: "c" }, { key: "b" }], au).map((x) => x.key), ["b", "c", "a"]);
});
test("judgeAudit warns when stale or when many links are wrong", () => {
  const now = Date.parse("2026-11-10T12:00:00Z");
  const fresh = (bad: number): AuditFile => ({ updatedAt: "2026-11-10T06:00:00Z", checked: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`k${i}`, 1])), bad: Object.fromEntries(Array.from({ length: bad }, (_, i) => [`k${i}`, { r: "sku", a: "offer", d: "" }])) });
  assert.equal(judgeAudit(fresh(2), now).status, "ok");
  assert.equal(judgeAudit(fresh(20), now).status, "warn");
  assert.equal(judgeAudit({ ...fresh(0), updatedAt: "2026-11-07T00:00:00Z" }, now).status, "fail");
  assert.equal(judgeAudit(null, now).status, "warn");
});
