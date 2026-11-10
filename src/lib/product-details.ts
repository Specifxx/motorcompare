// The product details the quick view shows (owner, 2026-11-10): the same facts
// as the product page's "Product details" box, as plain rows. Empty fields are
// left out; nothing is invented.
import { CAT_BY_KEY } from "@/site";
import { storeName, storeCount } from "@/lib/data";
import type { Product } from "@/lib/types";
import { partNoOf } from "@/lib/partno";
import { fitSummary } from "@/lib/fitment";
import { crossRefs, specsOf, statedFit } from "@/lib/specs";
import { niceDate } from "@/lib/format";

export interface DetailRow {
  label: string;
  value: string;
  note?: string;
}

export function detailRows(f: Product): DetailRow[] {
  const rows: DetailRow[] = [];
  const add = (label: string, value: string | null | undefined, note?: string) => {
    if (value && value.trim()) rows.push({ label, value, note });
  };
  const specs = specsOf(f.name, f.cat);
  add("Brand", f.brand);
  add("Category", CAT_BY_KEY[f.cat]?.name);
  if (!specs.some((x) => x.label === "Volume" || x.label === "Blade length")) add("Size", f.size);
  for (const x of specs) add(x.label, x.value);
  const pn = partNoOf(f.ean);
  add(pn ? "Part number" : "Barcode (EAN)", pn || f.ean);
  const xr = crossRefs(f.name);
  if (xr.length) add("Cross-reference", xr.join(", "));
  if (f.oe && f.oe.length) add("OE numbers", f.oe.join(", "), "As listed by stores; check against your old part.");
  if (f.fit && Object.keys(f.fit).length) {
    add("Fitment, per store", Object.entries(f.fit).map(([sid, lines]) => { const fs = fitSummary(lines, f.name); return `${storeName(sid)}: ${fs.lead.length ? fs.lead.join("; ") : fs.others.slice(0, 4).map((o) => (o.n > 1 ? `${o.make} (${o.n})` : o.make)).join(", ")}`; }).join(" | "), "Quoted from each store's own listing, not checked by us. Match the part number before you buy.");
  } else {
    const fit = statedFit(f.name);
    if (fit) add("Store listing says", `Suits ${fit}`, "Quoted from the store's title, not checked by us. Match the part number before you buy.");
  }
  add("Stores", String(storeCount(f)));
  add("First seen", f.first ? niceDate(f.first) : null);
  return rows;
}
