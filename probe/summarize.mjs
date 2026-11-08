// Joins the shards' outputs into results.json and summary.md: readable shops,
// their car parts by category, and how many barcodes and part numbers 2+ shops share.
import fs from "node:fs";
const dir = process.argv[2];
let all = [];
for (const d of fs.readdirSync(dir)) for (const f of fs.readdirSync(`${dir}/${d}`)) all = all.concat(JSON.parse(fs.readFileSync(`${dir}/${d}/${f}`, "utf8")));
all.sort((a, b) => a.host.localeCompare(b.host));
const ok = all.filter((r) => r.platform && r.products);
const aud = ok.filter((r) => !r.currency || r.currency === "AUD");
const share = (key) => { const m = new Map(); for (const r of aud) for (const c of new Set(r[key] ?? [])) m.set(c, (m.get(c) ?? 0) + 1); return [...m.values()].filter((n) => n >= 2).length; };
let md = `# Car parts store probe ${new Date().toISOString().slice(0, 10)}\n\n${all.length} candidates, ${ok.length} readable (${ok.filter((r) => r.platform === "shopify").length} Shopify, ${ok.filter((r) => r.platform === "woocommerce").length} WooCommerce), ${aud.length} in AUD.\n\n`;
md += `Barcodes sold by 2+ AUD shops: ${share("codes")}. Part numbers (SKU) in 2+ AUD shops: ${share("pns")}.\n\n`;
const C = ["oil", "battery", "wiper", "globe", "filter", "plug", "brake", "coolant", "care"];
md += `| Shop | Platform | Cur | Products | Car parts | ${C.join(" | ")} | EAN | Sample barcode | Codes | PNs |\n| --- | --- | --- | --- | --- | ${C.map(() => "---").join(" | ")} | --- | --- | --- | --- |\n`;
for (const r of ok.sort((a, b) => b.parts - a.parts)) md += `| ${r.base} | ${r.platform} | ${r.currency ?? "?"} | ${r.products} | ${r.parts} | ${C.map((c) => r.cats?.[c] ?? 0).join(" | ")} | ${r.skuEan} | ${r.sampleWithBarcode ?? "-"}/${r.sampleLooked ?? "-"} | ${(r.codes ?? []).length} | ${(r.pns ?? []).length} |\n`;
md += "\nNot readable: " + all.filter((r) => !(r.platform && r.products)).map((r) => `${r.host}${r.error ? ` (${r.error})` : r.shopifyError ? ` (${r.shopifyError})` : ""}`).join(", ") + "\n";
fs.writeFileSync("probe/results.json", JSON.stringify(all, null, 1) + "\n");
fs.writeFileSync("probe/summary.md", md);
console.log(md);
