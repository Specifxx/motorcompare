// The specs a title states, read per category (DECISIONS.md 2026-11-09).
//
// Parts are bought by dimension: a 600/450 mm blade pair is not a 650/400 mm one, a 12 V 55 W H7 is not a 24 V
// 70 W one. Each spec here is copied from the words of the title, in the unit the maker prints, and a spec the title
// does not state is left out, never guessed. Fit by make and model is not a spec we claim (CLAUDE.md). Nothing here
// decides which listings merge (title.ts and partno.ts do that); it only says what a shopper can verify on the page.
import type { CatKey } from "@/site";
import { packCount, sizeOf } from "./title";

export interface Spec {
  label: string;
  value: string;
}

const first = (t: string, re: RegExp): RegExpMatchArray | null => t.match(re);

/** "600/450mm", "26/16"" → the blade lengths in millimetres, driver side first. */
function wiperLengths(t: string): string | null {
  const pair = first(t, /(?<![\d.])(\d{3})\s?\/\s?(\d{3})\s?mm\b/i);
  if (pair) return `${Number(pair[1])}/${Number(pair[2])}mm`;
  const inch = first(t, /(?<![\d.])(\d{2})\s?(?:"|''|in\b)?\s?\/\s?(\d{2})\s?(?:"|''|in\b)/i);
  if (inch) return `${Math.round(Number(inch[1]) * 25.4)}/${Math.round(Number(inch[2]) * 25.4)}mm`;
  return sizeOf(t, "wipers");
}

const tech = (t: string, rules: [RegExp, string][]): string | null => rules.find(([re]) => re.test(t))?.[1] ?? null;

/** Specs in the title, labelled and in a fixed order. Empty when the title states none. */
export function specsOf(title: string, cat: CatKey): Spec[] {
  const out: Spec[] = [];
  const add = (label: string, value: string | null | undefined) => {
    if (value) out.push({ label, value });
  };
  const t = title.replace(/\s+/g, " ");
  const U = t.toUpperCase();

  switch (cat) {
    case "oil": {
      const g = first(U, /\b(\d{1,2})W-?(\d{2})\b/);
      add("Viscosity", g && `${g[1]}W-${g[2]}`);
      add("Base", tech(t, [[/\bfull(?:y)?[\s-]?synthetic|\bsynthetic\b(?!\s*blend)/i, "Fully synthetic"], [/semi[\s-]?synthetic|synthetic\s*blend/i, "Semi-synthetic"], [/\bmineral\b/i, "Mineral"]]));
      const api = first(U, /\bAPI\s*(S[A-Z]|C[A-Z]\d?(?:-\d)?)\b/);
      add("API", api && api[1]);
      const acea = first(U, /\bACEA\s*([A-E]\d(?:\/[A-E]\d)?)\b/);
      add("ACEA", acea && acea[1]);
      add("Volume", sizeOf(t, "oil"));
      break;
    }
    case "batteries": {
      const code = first(U, /\b(NS40Z?L?|NS60L?S?|NS70L?|N50Z?L?|N70Z{0,2}L?|N100|DIN\s?\d{2,3}[A-Z]{0,3}|MF\d{2,3}[A-Z]?|\d{2,3}D\d{2}[LR])\b/);
      add("Battery size", code && code[1].replace(/\s+/g, ""));
      const v = first(U, /\b(6|12|24)\s?V(?:OLT)?\b/);
      add("Voltage", v && `${v[1]}V`);
      const ah = first(U, /\b(\d{2,3})\s?(?:AH|A\.H\.|AMP\s?HOURS?)\b/);
      add("Capacity", ah && `${ah[1]}Ah`);
      const cca = first(U, /\b(\d{3,4})\s?CCA\b|\bCCA\s?[:=]?\s?(\d{3,4})\b/);
      add("Cold cranking", cca && `${cca[1] ?? cca[2]} CCA`);
      add("Type", tech(t, [[/\bagm\b/i, "AGM"], [/\befb\b/i, "EFB"], [/lifepo4|lithium/i, "Lithium"], [/deep\s*cycle/i, "Deep cycle"], [/calcium/i, "Calcium"]]));
      break;
    }
    case "wipers": {
      add("Blade length", wiperLengths(t));
      add("Style", tech(t, [[/\bflat\b|aero\s?twin|beam/i, "Flat / beam"], [/hybrid/i, "Hybrid"], [/conventional|framed/i, "Conventional"]]));
      break;
    }
    case "globes": {
      const code = first(U, /\b(H1|H3|H4|H7|H8|H9|H11|H13|H16|HB3|HB4|HIR2|9003|9004|9005|9006|9007|9012|D1S|D2S|D3S|D4S|T10|W5W|T20|W21W|P21W|PY21W|BA15S|BAY15D)\b/);
      add("Globe type", code && code[1]);
      const v = first(U, /\b(12|24)\s?V(?:OLT)?\b/);
      add("Voltage", v && `${v[1]}V`);
      const w = first(U, /\b(\d{1,3})\s?W(?:ATT)?S?\b(?!\s?-?\d)/);
      add("Wattage", w && `${w[1]}W`);
      break;
    }
    case "plugs": {
      const gap = first(t, /\bgap\s*[:=]?\s*(\d(?:\.\d{1,2})?)\s?mm\b/i);
      add("Gap", gap && `${gap[1]}mm`);
      const th = first(U, /\bM(\d{2})\s?X\s?(\d(?:\.\d{1,2})?)\b/);
      add("Thread", th && `M${th[1]} x ${th[2]}`);
      add("Electrode", tech(t, [[/iridium/i, "Iridium"], [/platinum/i, "Platinum"], [/copper/i, "Copper"], [/glow/i, "Glow plug"]]));
      break;
    }
    case "brakes": {
      add("Part", tech(t, [[/\bpads?\b/i, "Brake pads"], [/rotors?|discs?/i, "Rotor"], [/shoes?/i, "Brake shoes"], [/fluid|\bdot\s?\d/i, "Brake fluid"]]));
      add("Position", tech(t, [[/\bfront\b/i, "Front"], [/\brear\b/i, "Rear"]]));
      const dot = first(U, /\bDOT\s?(3|4|5(?:\.1)?)\b/);
      add("DOT grade", dot && `DOT ${dot[1]}`);
      const dia = first(t, /(?<![\d.])(\d{3})\s?mm\b/);
      if (dia && /rotor|disc/i.test(t)) add("Diameter", `${dia[1]}mm`);
      add("Volume", sizeOf(t, "brakes"));
      break;
    }
    case "filters": {
      add("Filter", tech(t, [[/\boil\s*filter/i, "Oil"], [/\bcabin|pollen/i, "Cabin"], [/\bair\s*filter/i, "Air"], [/\bfuel\s*filter/i, "Fuel"], [/transmission/i, "Transmission"], [/service\s*kit/i, "Service kit"]]));
      break;
    }
    case "fluids":
    case "care": {
      add("Volume", sizeOf(t, cat));
      if (cat === "fluids") {
        add("Type", tech(t, [[/\batf\b|dexron|mercon|cvt/i, "Transmission fluid"], [/coolant|anti-?freeze/i, "Coolant"], [/gear\s*oil|diff/i, "Gear oil"], [/power\s*steering/i, "Power steering"], [/adblue/i, "AdBlue"]]));
        const mix = first(t, /\b(premix(?:ed)?|concentrate)\b/i);
        add("Mix", mix && mix[1].toLowerCase().startsWith("pre") ? "Premixed" : mix ? "Concentrate" : null);
      }
      break;
    }
    default:
      break;
  }

  // Dimensions any part can state in its own words: "Thread: M14 x 1.5", "Length: 140mm".
  const thread = first(U, /\bM(\d{1,2})\s?X\s?(\d(?:\.\d{1,2})?)\b/);
  if (thread && !out.some((s) => s.label === "Thread")) add("Thread", `M${thread[1]} x ${thread[2]}`);
  const len = first(t, /\blength\s*[:=]?\s*(\d+(?:\.\d+)?)\s?(mm|cm|m)\b/i);
  if (len && cat !== "wipers") add("Length", `${len[1]}${len[2].toLowerCase()}`);
  const volts = first(U, /\b(12|24)\s?V(?:OLT)?\b/);
  if (volts && cat !== "batteries" && cat !== "globes") add("Voltage", `${volts[1]}V`);

  const n = packCount(t);
  add("Pack", n ? (n === 2 && /pair|twin/i.test(t) ? "Pair (2)" : `${n}`) : null);
  return out;
}

/** The labels whose value must agree for two listings to be the same part: a different one is a different product. */
export const MATCH_SPECS = ["Blade length", "Voltage", "Wattage", "Capacity", "Cold cranking", "Viscosity", "DOT grade", "Position", "Diameter", "Thread", "Globe type", "Battery size", "Length"] as const;

/** A title's stated match specs, label → value. Front-and-rear states no position. */
export function matchSpecs(title: string, cat: CatKey): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of specsOf(title, cat)) if ((MATCH_SPECS as readonly string[]).includes(s.label)) out[s.label] = s.value;
  if (/\bfront\b/i.test(title) && /\brear\b/i.test(title)) delete out.Position;
  return out;
}

/** What a store's title says the part suits, verbatim ("Suit Ford Falcon BA-FG 2003-2014"). We quote it, we do not verify it. */
export function statedFit(title: string): string | null {
  const m = title.match(/\b(?:suit(?:s|able\s+for)?|to\s+fit|fits|compatible\s+with)\b[:\s]+(.{4,140}?)(?:\s+[-–|]\s+(?=[A-Z0-9]*\d)|$)/i);
  if (!m) return null;
  const t = m[1].replace(/[\s,;:.]+$/, "").trim();
  return t.length >= 4 ? t : null;
}

/** OEM or cross-reference numbers a title names ("OEM 04152-YZZA1", "Replaces 90915-YZZJ1"), as printed; at most three. */
export function crossRefs(title: string): string[] {
  const out: string[] = [];
  for (const m of title.matchAll(/\b(?:OEM|OE|replaces|replacement\s+for|cross[\s-]?ref(?:erence)?|equivalent\s+to)\b[:\s#]*([A-Z0-9][A-Z0-9-]{4,19})\b/gi)) {
    const v = m[1].toUpperCase();
    if (/\d/.test(v) && !out.includes(v)) out.push(v);
  }
  return out.slice(0, 3);
}
