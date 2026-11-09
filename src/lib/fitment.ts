// What a store's own listing says the part suits (DECISIONS.md 2026-11-09, "fitment is quoted, never vouched for").
//
// Read from the places the biggest AU stores state it (probe/fitment-summary.md): `Make:` / `Model:` / `car:` tags,
// "Fit For ..." and "to suit:" lines in the description, and "OE equivalent numbers". Each string is the store's
// words, trimmed; it is kept PER STORE and shown as "<store> says it suits ...", never merged across stores and
// never used to match, rank or filter a part the store has not listed it for.
import { plainText } from "./notes";

export const FIT_MAX_PER_STORE = 3;
export const FIT_MAX_LEN = 120;
export const FIT_MAX_STORES = 3;

const clean = (s: string) => s.replace(/\s+/g, " ").replace(/^[\s:;,.\-–•*]+|[\s:;,.\-–•*]+$/g, "").trim();
const cap = (s: string) => (s.length > FIT_MAX_LEN ? s.slice(0, FIT_MAX_LEN - 1).replace(/\s\S*$/, "") + "…" : s);

/** Fitment strings a listing states, at most three, in the store's words. Empty when it states none. */
export function fitmentOf(tags: string[] | string | undefined, bodyHtml: string | null | undefined): string[] {
  const out: string[] = [];
  const add = (s: string) => {
    const t = cap(clean(s));
    if (t.length >= 6 && /[a-z]/i.test(t) && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
  };
  const list = (Array.isArray(tags) ? tags : String(tags ?? "").split(",")).map((t) => t.trim()).filter(Boolean);
  const make = list.find((t) => /^make\s*:/i.test(t))?.replace(/^make\s*:\s*/i, "");
  const model = list.find((t) => /^model\s*:/i.test(t))?.replace(/^model\s*:\s*/i, "");
  if (make && model) add(`${make} ${model}`);
  for (const t of list) if (/^car\s*:/i.test(t)) add(t.replace(/^car\s*:\s*/i, ""));

  const lines = plainText(bodyHtml ?? "").split(/\n+/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length && out.length < 8; i++) {
    const l = lines[i];
    const inline = l.match(/^fit\s*for\s*:?\s*(.{6,})$/i);
    if (inline) { add(inline[1]); continue; }
    // "Front brake package to suit:" then the vehicles on the next line(s), until a heading or a blank.
    if (/\b(?:to\s+suit|suits?|fits?|compatible\s+with|vehicle\s+compatibility)\s*:\s*$/i.test(l)) {
      for (let j = i + 1; j < lines.length && j <= i + 3; j++) {
        if (/:\s*$|^package\b|^not sure\b/i.test(lines[j])) break;
        add(lines[j]);
      }
      continue;
    }
    const same = l.match(/\b(?:to\s+suit|vehicle\s+compatibility)\s*:\s*(.{6,})$/i);
    if (same) add(same[1]);
  }
  return out.slice(0, FIT_MAX_PER_STORE);
}

/** OE or equivalent part numbers a description lists ("OE equivalent numbers: 7701208130, 7701210178"), at most six. */
export function oeNumbersOf(bodyHtml: string | null | undefined): string[] {
  const out: string[] = [];
  for (const m of plainText(bodyHtml ?? "").matchAll(/\b(?:OE|OEM)\s*(?:equivalent|equiv\.?|reference|ref\.?|part)?\s*(?:numbers?|nos?\.?|#)?\s*[:\-]\s*([A-Z0-9][A-Z0-9 ,;/\-]{4,120})/gi)) {
    for (const n of m[1].split(/[,;/\s]+/)) {
      const v = n.toUpperCase();
      if (v.length >= 5 && v.length <= 20 && /\d/.test(v) && !out.includes(v)) out.push(v);
    }
  }
  return out.slice(0, 6);
}
