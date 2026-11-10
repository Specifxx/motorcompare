// What a store title is. The barcode decides WHICH product a listing is; the
// title only decides whether it belongs on the site at all (a new part, sold
// as the maker packs it, not used, damaged, a store bundle or a gift card) and
// gives a readable name, a category, a size and the printed fit code (oil
// grade, battery size, globe code). Every rule changed here gets a real store
// title in tests/title.test.ts.
import { CATEGORIES, type CatKey } from "@/site";

export type Refusal = "not-part" | "pre-owned" | "damaged" | "bundle" | "mystery" | "core" | "apparel";

const NOT_PART = /\b(gift\s*cards?|e-?gift|gift\s*vouchers?|shipping|insurance|protection\s*plan|route\s*package|donation|membership|pre-?order\s*deposit|installation\s*service|fitting\s*service|labou?r\s*charge|freight|delivery\s*fee|workshop\s*booking|service\s*booking)\b/i;
// A battery or alternator "core charge" or exchange deposit is a refund line, not a part.
const CORE = /\b(core\s*(?:charge|deposit|exchange|return)|exchange\s*(?:unit|deposit)|surcharge)\b/i;
const PRE_OWNED = /\b(pre[-\s]?owned|second\s*-?\s*hand|used|refurbished|reconditioned|recon\b|ex[-\s]?demo|wrecking|wreck|salvage|pull[-\s]?out|open\s*box)\b/i;
const DAMAGED = /\b(damaged?|dented|box\s*damage|imperfect|defect(ive)?|as[\s-]is|scratched|leak(?:ing|ed|y)?|blemish(?:ed)?|seconds\b)\b/i;
// Store-made bundles carry one product's barcode and a different price. A maker's own pack (a pair of
// wipers, a Ryco service kit, a 4-pack of spark plugs) has its own barcode and stays.
const BUNDLE = /\b(bundle|combo\s*deal|buy\s*\d+\s*get|bogo|gift\s*with\s*purchase|gwp|free\s*gift|lot\s*of\s*\d|wholesale\s*(?:lot|carton))\b|\+\s*free\b/i;
const MYSTERY = /\b(mystery|lucky\s*(bag|box|dip)|blind\s*box|surprise\s*box|grab\s*bag)\b/i;
const APPAREL = /\b(t-?shirts?|tee\b|hoodie|cap\b|beanie|trucker\s*hat|sticker|decal|keyring|key\s*ring|lanyard|stubby\s*holder|poster|mug)\b/i;

export interface TitleInfo {
  cat: CatKey;
  size: string | null;
}

/** Read a store title. Returns a refusal reason or the category and size. */
export function readTitle(title: string, kind = ""): TitleInfo | { refused: Refusal } {
  if (NOT_PART.test(title)) return { refused: "not-part" };
  if (CORE.test(title)) return { refused: "core" };
  if (PRE_OWNED.test(title)) return { refused: "pre-owned" };
  if (DAMAGED.test(title)) return { refused: "damaged" };
  if (MYSTERY.test(title)) return { refused: "mystery" };
  if (BUNDLE.test(title)) return { refused: "bundle" };
  if (APPAREL.test(title) && !CAT_RULES.some(([, re]) => re.test(title))) return { refused: "apparel" };
  const cat = categoryOf(title, kind);
  return { cat, size: sizeOf(title, cat) };
}

// Order matters: the first rule that matches decides (a "battery charger" is an accessory, not a battery;
// "brake fluid" is brakes, not fluids; "wiper fluid" is a fluid, not a blade).
const CAT_RULES: [CatKey, RegExp][] = [
  ["accessories", /\b(jump\s*starters?|jumpstarters?|battery\s*(?:chargers?|maintainers?|testers?|monitors?|isolators?|boxes?|box|terminals?|clamps?|leads?)|smart\s*chargers?|dash\s*cams?|dashcams?|tyre\s*inflators?|air\s*compressors?|inverters?|usb\s*charger|phone\s*holder|reversing\s*camera|obd2?|scan\s*tool|code\s*reader|tow\s*(?:ball|bar|hitch)|roof\s*racks?|seat\s*covers?|floor\s*mats?|sun\s*shade|tyre\s*gauge|torque\s*wrench|jack\s*stands?|trolley\s*jack|socket\s*set|led\s*light\s*bar|light\s*bars?|work\s*lights?)\b/i],
  ["brakes", /\b(brake\s*(?:pads?|shoes?|rotors?|discs?|fluid|cleaner|calipers?|kits?|lines?|hoses?)|disc\s*brake|rotors?\b|dot\s*[345](?:\.1)?\b|bendix|brembo|dba\s*\d)\b/i],
  ["fluids", /\b(coolant|anti-?freeze|radiator\s*(?:fluid|flush|treatment|cleaner)|transmission\s*fluid|atf\b|cvt\s*fluid|dexron|mercon|power\s*steering\s*fluid|diff(?:erential)?\s*oil|gear\s*oil|\d{2}w-?\d{2,3}\s*gear|wash(?:er)?\s*fluid|windscreen\s*(?:wash|cleaner|fluid)|fuel\s*(?:system\s*)?(?:cleaner|treatment|additive)|injector\s*cleaner|oil\s*(?:treatment|additive|flush)|engine\s*flush|octane\s*boost|adblue|grease)\b/i],
  ["filters", /\b(oil\s*filters?|air\s*filters?|cabin\s*(?:air\s*)?filters?|pollen\s*filters?|fuel\s*filters?|transmission\s*filters?|filter\s*kits?|service\s*kits?|ryco\s*[a-z]{0,3}\d|wesfil|sakura\s*[a-z]{0,3}\d|mann\s*filter|filters?\b)\b/i],
  ["oil", /\b(engine\s*oil|motor\s*oil|\d{1,2}w-?\d{2}\b|synthetic\s*(?:engine\s*)?oil|semi[-\s]?synthetic|mineral\s*oil|diesel\s*(?:engine\s*)?oil|2[-\s]?stroke\s*oil|4[-\s]?stroke\s*oil|motorcycle\s*oil)\b/i],
  ["plugs", /\b(spark\s*plugs?|glow\s*plugs?|iridium\s*plugs?|ignition\s*coils?|plug\s*leads?|ngk\s*[a-z]{0,6}\d)\b/i],
  ["wipers", /\b(wiper\s*(?:blades?|refills?|rubbers?|arms?|kits?)|wipers?\b|wiper)\b/i],
  ["globes", /(?<!-)\b(globes?|headlight\s*(?:bulbs?|globes?|kits?)|head\s*lamp\s*bulbs?|bulbs?|h1|h3|h4|h7|h8|h9|h11|h13|h16|hb3|hb4|hir2|9003|9004|9005|9006|9007|9012|d1s|d2s|d3s|d4s|t10|w5w|t20|w21w|p21w|py21w|ba15s|bay15d|led\s*conversion|hid\s*kit)\b/i],
  ["batteries", /\b(car\s*batter(?:y|ies)|4wd\s*batter(?:y|ies)|deep\s*cycle|agm\b|lithium\s*batter(?:y|ies)|calcium\s*batter(?:y|ies)|start(?:ing|er)\s*batter(?:y|ies)|batter(?:y|ies)|ns40z?l?|ns60l?s?|ns70|n50z?l?|n70z{0,2}l?|n100|din\s?\d{2,3}[a-z]{0,3}|mf\d{2,3}[a-z]?|\d{2,3}d\d{2}[lr])\b/i],
  ["care", /\b(car\s*wash|wash\s*(?:and|&)\s*wax|snow\s*foam|shampoo|detailer|detailing|quick\s*detail|ceramic\s*(?:coating|spray)|sealant|tyre\s*(?:shine|dressing|gel)|tire\s*shine|microfib(?:re|er)|drying\s*towel|wash\s*mitt|clay\s*(?:bar|mitt)|polish|compound|wax\b|degreaser|interior\s*(?:cleaner|detailer|protectant)|leather\s*(?:cleaner|conditioner)|glass\s*cleaner|wheel\s*cleaner|bug\s*(?:and|&)\s*tar|iron\s*remover|air\s*freshener|vinyl\s*(?:cleaner|protectant)|upholstery)\b/i],
];

// Electrical bits named after what they measure or plug into.
const NOT_A_CONSUMABLE = /\b(sensors?|sender|connectors?|pigtail|wiring\s*(?:harness|loom)|adapt(?:er|or)\s*(?:harness|loom)|harness|plug\s*(?:and|&)\s*pins)\b/i;

// Specialist parts, read BEFORE the consumable rules: a Haltech ignition coil is engine management, not a spark plug, and a
// Turbosmart "plug" is still a turbo part (2026-11-10: "More parts" held 1,593 of 2,489 products, most of them these brands).
const FIRST_RULES: [CatKey, RegExp][] = [
  ["turbo", /\b(turbosmart|turbo(?:charger|chargers)?|wastegates?|blow[-\s]?off|bov|boost\s*(?:controller|gauge|solenoid|reference)|diverter\s*valve|plumb[-\s]?back|boostgate|ultra[-\s]?gate|wg\d{2}|iwg\d{2})\b/i],
  ["engine", /\b(haltech|ecus?|engine\s*management|injector\s*dynamics|fuel\s*injectors?|injectors?\s*set|fuel\s*pressure\s*regulators?|fpr\d*|wideband|ignition\s*coils?\s*(?:pack|kit)?\s*(?:for|suit)?\s*haltech|kelford\s*cams?|camshafts?|cams?\s*(?:and|&)\s*springs?)\b/i],
];

// Everything else a performance or touring shop sells, read AFTER the consumable rules (a Narva globe is a globe, a Narva fuse is not).
const LATE_RULES: [CatKey, RegExp][] = [
  ["accessories", /\b(roll(?:er)?[-\s]?r?\s*cover|tail\s*lock|tailgate\s*lock|central\s*locking|bull\s*bar|tub\s*liner|canopy)\b/i],
  ["exhaust", /\b(exhausts?|cat[-\s]?back|muffler|mufflers|dump\s*pipe|extractors?|headers?\b|down[-\s]?pipe|resonator|tailpipe)\b/i],
  ["cooling", /\b(radiators?|koyorad|intercoolers?|oil\s*coolers?|thermo\s*fans?|radiator\s*fans?|thermostats?|water\s*pumps?|expansion\s*tank|catch\s*can)\b/i],
  ["driveline", /\b(clutch(?:es)?|flywheels?|exedy|pressure\s*plate|gearbox|transmission\s*mount|diff(?:erential)?\s*(?:mount|centre|center|cover)|driveshafts?|cv\s*joints?|lsd)\b/i],
  ["suspension", /\b(shock\s*absorbers?|shocks?\b|(?<!bonnet\s)(?<!gas\s)(?<!boot\s)struts?\b|coil[-\s]?overs?|coil\s*springs?|lowering\s*springs?|sway\s*bars?|whiteline|kyb|ohlins|öhlins|bilstein|ast\s*suspension|control\s*arms?|bushes|bushings?|lift\s*kit)\b/i],
  ["electrics", /\b(elecbrakes|elecconnect|narva|redarc|victron|enerdrive|projecta|gme\b|uniden|aerpro|ktsolar|kt\s*solar|solar\s*panels?|dc[-\s]?dc|fusible\s*links?|blade\s*fuses?|fuses?\b|relays?\b|uhf|cb\s*radio|antennas?|switch(?:es)?\b|accessory\s*socket|load\s*resistor|anderson|wiring\s*kit|dual\s*battery|battery\s*management|lightforce|stedi|safari)\b/i],
  ["tools", /\b(kincrome|spanners?|wrench(?:es)?|socket\s*sets?|tool\s*(?:kit|set|box|chest)|screwdrivers?|pliers|ratchets?)\b/i],
];

/** The category a title (or, failing that, the store's product type and tags) says. */
export function categoryOf(title: string, kind = ""): CatKey {
  if (!/\bfilters?\b/i.test(title)) for (const [cat, re] of FIRST_RULES) if (re.test(title)) return cat;
  // A sensor, connector or loom for a system is not that system's part ("Coolant Temp Sensor" is no coolant).
  if (!NOT_A_CONSUMABLE.test(title)) {
    for (const [cat, re] of CAT_RULES) if (re.test(title)) return cat;
  }
  for (const [cat, re] of LATE_RULES) if (re.test(title)) return cat;
  if (NOT_A_CONSUMABLE.test(title)) return "other";
  for (const [cat, re] of CAT_RULES) if (re.test(kind)) return cat;
  for (const [cat, re] of LATE_RULES) if (re.test(kind)) return cat;
  return "other";
}

// Sizes: litres and millilitres (oil, fluids, care), millimetres or inches (wiper blades).
const VOLUME = /(\d+(?:[.,]\d+)?)\s?(l|lt|ltr|litres?|liters?|ml)\b/gi;
// A length is whole numbers only: "1.625\"" is not 25 inches and "1.2m" is not 2 m (the digit before a point is never skipped).
const LENGTH = /(?<![\d.])(\d{3})\s?mm\b|(?<![\d.])(\d{2})\s?(?:"|''|in\b|inch(?:es)?\b)/gi;
// Litres that name an engine ("Suit Ford Falcon 5.0L V8", "2.8L Eng") are not a pack size.
const DISPLACEMENT = /^\s*(?:v\d|turbo|eng\b|tdi|hdi|cdi|petrol|vvt|dohc|sohc)/i;

/** What a size means in each category: litres for fluids, a blade's length for wipers, nothing for the rest.
 *  A plug "5.6L" or a clutch "4L" is the engine it suits, a "635mm" on a tube mount is a misread inch. */
const SIZE_RULES: Partial<Record<CatKey, { litres: boolean; ml: boolean; mm: boolean }>> = {
  oil: { litres: true, ml: true, mm: false },
  fluids: { litres: true, ml: true, mm: false },
  care: { litres: true, ml: true, mm: false },
  brakes: { litres: true, ml: true, mm: false }, // brake fluid only, see ruleFor
  wipers: { litres: false, ml: false, mm: true },
  filters: { litres: false, ml: true, mm: false },
  accessories: { litres: false, ml: true, mm: false },
};

function volumeLabel(m: RegExpMatchArray, text = ""): string | null {
  if (DISPLACEMENT.test(text.slice((m.index ?? 0) + m[0].length))) return null;
  const n = Number(m[1].replace(",", "."));
  if (!(n > 0)) return null;
  const u = m[2].toLowerCase();
  if (u === "ml") return n >= 1000 ? `${n / 1000}L` : `${n}ml`;
  return `${n}L`;
}

/** The size a title states: "5L", "500ml", "650mm". The variant's own trailing brackets win. */
function ruleFor(title: string, cat: CatKey) {
  if (cat === "brakes" && !/\b(fluid|dot\s?[345])\b/i.test(title)) return undefined;
  return SIZE_RULES[cat];
}

export function sizeOf(title: string, cat: CatKey = categoryOf(title)): string | null {
  const rule = ruleFor(title, cat);
  if (!rule) return null;
  const tail = title.match(/\(([^()]*)\)\s*$/);
  const scan = (t: string): string | null => {
    for (const m of t.matchAll(VOLUME)) {
      const isMl = m[2].toLowerCase() === "ml";
      if (isMl ? !rule.ml : !rule.litres) continue;
      const s = volumeLabel(m, t);
      if (s) return s;
    }
    if (rule.mm)
      for (const m of t.matchAll(LENGTH)) {
        if (m[1]) return `${Number(m[1])}mm`;
        if (m[2]) return `${Math.round(Number(m[2]) * 25.4)}mm`;
      }
    return null;
  };
  return (tail && scan(tail[1])) || scan(title);
}

/** A size as a number: millilitres, or millimetres for a wiper blade. */
export interface Amount {
  dim: "amount" | "length" | "count";
  n: number;
}

export function amountOf(size: string | null): Amount | null {
  if (!size) return null;
  const m = size.match(/^([\d.]+)\s?(ml|L|mm)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!(n > 0)) return null;
  if (m[2] === "ml") return { dim: "amount", n };
  if (m[2] === "L") return { dim: "amount", n: n * 1000 };
  return { dim: "length", n };
}

/** Two sizes that cannot be the same product (a 1 L against a 5 L, a 400 mm against a 650 mm).
 *  Within 5% is the same thing written two ways (26" and 650 mm). */
export function sizesConflict(a: Amount | null, b: Amount | null): boolean {
  if (!a || !b || a.dim !== b.dim) return false;
  return Math.abs(a.n - b.n) / Math.max(a.n, b.n) > 0.05;
}

/** How many come in the pack when the title says: "Set of 8", "4 Pack", "Twin Pack", "(Pair)". Never inferred. */
export function packCount(title: string): number | null {
  const found = new Set<number>();
  for (const m of title.matchAll(/\b(?:set|pack|box|case|carton|kit)\s+of\s+(\d{1,3})\b/gi)) found.add(Number(m[1]));
  for (const m of title.matchAll(/\b(\d{1,3})\s?-?\s?(?:pack|pk|pcs?|pieces?)\b/gi)) found.add(Number(m[1]));
  if (/\b(?:twin|double)\s*pack\b|\bpair\b|\b2\s?x\s?(?:pack|pcs?)\b/i.test(title)) found.add(2);
  found.delete(0);
  // "1 pcs" is the store's own filler, and a title naming two counts says nothing.
  found.delete(1);
  return found.size === 1 ? [...found][0] : null;
}

/** The size and pack a listing can be trusted to be, at most one of each: a title naming two different sizes says nothing. */
export function listingAmounts(title: string): Amount[] {
  const out: Amount[] = [];
  const rule = ruleFor(title, categoryOf(title));
  if (rule) {
    const tail = title.match(/\(([^()]*)\)\s*$/);
    const read = (t: string) => {
      const vs: Amount[] = [];
      for (const m of t.matchAll(VOLUME)) {
        if (m[2].toLowerCase() === "ml" ? !rule.ml : !rule.litres) continue;
        const a = amountOf(volumeLabel(m, t));
        if (a) vs.push(a);
      }
      return vs;
    };
    const fromTail = tail ? read(tail[1]) : [];
    if (fromTail.length) out.push(fromTail[0]);
    else {
      const all = read(title);
      if (all.length && !all.some((a) => sizesConflict(a, all[0]))) out.push(all[0]);
    }
  }
  const n = packCount(title);
  if (n) out.push({ dim: "count", n });
  return out;
}

/** The code printed on the part that decides fit: shown on tiles and product pages, and what the
 *  "My car" box filters by. Null when the title does not state one (never guessed). */
export function partCode(title: string, cat: CatKey): string | null {
  const t = title.toUpperCase();
  const pick = (re: RegExp) => t.match(re)?.[0]?.replace(/\s+/g, "") ?? null;
  switch (cat) {
    case "oil": {
      const g = t.match(/\b(\d{1,2})W-?(\d{2})\b/);
      return g ? `${g[1]}W-${g[2]}` : null;
    }
    case "batteries":
      return pick(/\b(NS40Z?L?|NS60L?S?|NS70L?|N50Z?L?|N70Z{0,2}L?|N100|DIN\s?\d{2,3}[A-Z]{0,3}|MF\d{2,3}[A-Z]?|\d{2,3}D\d{2}[LR])\b/);
    case "globes":
      return pick(/\b(H1|H3|H4|H7|H8|H9|H11|H13|H16|HB3|HB4|HIR2|9003|9004|9005|9006|9007|9012|D1S|D2S|D3S|D4S|T10|W5W|T20|W21W|P21W|PY21W)\b/);
    case "wipers": {
      const s = sizeOf(title, "wipers");
      return s && s.endsWith("mm") ? s : null;
    }
    case "filters":
      return pick(/\b(?:Z|A|WA|WCF|RCA|R)\d{2,4}[A-Z]{0,2}\b/);
    default:
      return null;
  }
}

// Store noise stripped before a title becomes a product name.
const NOISE = [
  /\[[^\]]*\]/g,
  /\((?:new|in\s*stock|sale|hot|best\s*seller|bestseller|limited[^)]*|genuine|original|brand\s*new|free\s*shipping|free\s*delivery)\)/gi,
  /\b(?:new\s*arrival|best\s*seller|bestseller|hot\s*item|on\s*sale|in\s*stock|100%\s*genuine|brand\s*new|free\s*(?:shipping|delivery|postage))\b\s*[:\-–!]?/gi,
  /\b(?:new|clearance|sale|hot|best|limited|special|deal)\*/gi,
  /\$\d+(?:\.\d+)?\s*deal\b|\*\s*[a-z][a-z ]{1,15}\s*\*/gi,
  /\(\s*\d+\s*(?:sizes?|options?|types?)\s*\)|\b\d+\s*(?:sizes|options|types)\b/gi,
  /\(\s*1\s*(?:pcs?|ea)\s*\)|\b1\s*(?:pcs?|ea)\b/gi,
  /\s{2,}/g,
];

/** Words a shouting title keeps in capitals. */
const ACRONYM = /^(HPR|ATF|AGM|CCA|LED|HID|DOT|CVT|SUV|UTE|4WD|AWD|EFB|MF|NGK|DBA|EBC|STP|ARB|TJM|SCA|CTEK|K&N|USB|OBD|OBD2|ABS|ECU|API|ACEA|VW|BMW|PIAA|RDA|TRW|ACL|KYB|II|III|IV)$/;

/** A clean display name from a store title. */
export function cleanName(title: string): string {
  let t = title;
  for (const re of NOISE) t = t.replace(re, " ");
  t = t
    .replace(/\(\s*\)/g, " ")
    .replace(/\s+([,:;)])/g, "$1")
    .replace(/([(])\s+/g, "$1")
    .replace(/^[\s\-–:|,*.]+|[\s\-–:|,*]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  // Shouting stores: "PENRITE HPR 5 5W-30 ENGINE OIL 5L" → title case, keeping part codes as written.
  if (t.length > 12 && t === t.toUpperCase() && /[A-Z]{4}/.test(t)) {
    t = t
      .split(" ")
      .map((w) => (/\d/.test(w) || ACRONYM.test(w) ? w : w.charAt(0) + w.slice(1).toLowerCase()))
      .join(" ");
  }
  t = t.replace(/\b(\d+(?:\.\d+)?)\s?(?:LTR|LT|LITRES?|LITERS?)\b/gi, "$1L").replace(/\b(\d+(?:\.\d+)?)\s?ML\b/g, "$1ml");
  return t;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** One name shape for every store: the brand first, then the product, with a store's own brand prefix removed. */
export function tidyName(title: string, brand: string): string {
  let t = cleanName(title);
  if (brand) {
    const b = brand.replace(/[^a-z0-9]+/gi, "[^a-z0-9]*");
    t = t.replace(new RegExp(`^\\s*${b}\\s*[-–:|]?\\s*`, "i"), "").replace(new RegExp(`\\s*(?:[-–|]|\\bby)\\s*${b}\\s*$`, "i"), "");
    t = t.replace(new RegExp(`^\\[?${esc(brand)}\\]?\\s*`, "i"), "");
  }
  t = t.replace(/^[\s\-–:|,]+|[\s\-–:|,]+$/g, "").trim();
  return brand ? `${brand} ${t}`.trim() : t;
}

/** Pick the product's display name from every store's tidied title: the most common one wins, then the one nearest a readable length. */
export function pickName(names: string[]): string {
  const ok = names.filter((n) => n.length >= 6);
  if (!ok.length) return names[0] ?? "";
  const count = new Map<string, number>();
  for (const n of ok) count.set(n.toLowerCase(), (count.get(n.toLowerCase()) ?? 0) + 1);
  const score = (n: string) => (count.get(n.toLowerCase()) ?? 0) * 1000 - Math.abs(n.length - 55) - (n === n.toUpperCase() ? 200 : 0);
  return ok.slice().sort((a, b) => score(b) - score(a) || a.localeCompare(b))[0];
}

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);
