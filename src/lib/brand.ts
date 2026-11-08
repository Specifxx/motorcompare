// Brands (part and oil makers). A store's Shopify `vendor` field is the maker,
// written each store's own way ("Century", "Century Batteries", "CENTURY");
// they are folded into one key and shown with the spelling below, else the
// spelling most stores use. A vendor that is just the store's own name, or
// empty, falls back to a known maker at the start of the title.
import { slugify } from "./slug";

/** Display spellings for makers stores write many ways. */
const KNOWN: string[] = [
  "Penrite", "Castrol", "Nulon", "Mobil", "Shell", "Valvoline", "Liqui Moly", "Motul", "Fuchs", "Gulf Western", "Total", "Caltex",
  "Havoline", "Amsoil", "Royal Purple", "Red Line", "Eneos", "Idemitsu", "Toyota Genuine", "Bardahl", "Wynn's", "Lucas Oil", "STP",
  "Century", "Exide", "Varta", "Bosch", "Yuasa", "Optima", "Odyssey", "Supercharge", "Enertec", "R&J", "Ritar", "Fullriver",
  "Enerdrive", "Projecta", "Redarc", "Noco", "CTEK", "Kickass", "Ultimate9", "Matson", "Narva", "Philips", "Osram", "Hella",
  "Lightforce", "STEDI", "Hard Korr", "Ultravision", "PIAA", "Valeo", "Trico", "Rain-X", "Michelin", "Ryco", "Wesfil", "Sakura",
  "Mann-Filter", "Mahle", "K&N", "Fram", "Donaldson", "NGK", "Denso", "Champion", "Bendix", "Brembo", "DBA", "EBC", "Protex",
  "RDA", "Ferodo", "Textar", "TRW", "ACL", "Gates", "Dayco", "Monroe", "KYB", "Pedders", "Ironman 4x4", "ARB", "TJM",
  "Meguiar's", "Turtle Wax", "Armor All", "Chemical Guys", "Gyeon", "CarPro", "Bowden's Own", "Autoglym", "Koch-Chemie",
  "Mothers", "Sonax", "Mr Sheen", "Septone", "Repco", "SCA", "Ridge Ryder", "Kincrome", "Sidchrome", "Thinkcar", "Autel",
  "Nextbase", "Garmin", "Thinkware", "BlackVue", "Uniden", "Pioneer", "Kenwood",
];

/** "Jo Malone London" / "jo malone" → "jomalone". */
export function brandKey(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\b(co\.?,?\s*ltd|pty\.?\s*ltd|inc|ltd|official|australia|aust|automotive|lubricants?|oils?|products|batteries|spark\s*plugs|filters|lighting|auto\s*parts)\b\.?$/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const KNOWN_BY_KEY = new Map<string, string>();
for (const name of KNOWN) if (!KNOWN_BY_KEY.has(brandKey(name))) KNOWN_BY_KEY.set(brandKey(name), name);
// One maker under two names.
const ALIAS: Record<string, string> = {
  centurybatteries: "century",
  exidebatteries: "exide",
  vartabatteries: "varta",
  liquimolyaustralia: "liquimoly",
  penriteoil: "penrite",
  nulonproducts: "nulon",
  mobil1: "mobil",
  shellhelix: "shell",
  castroledge: "castrol",
  bowdensown: "bowdensown",
  hardkorr: "hardkorr",
  stediaustralia: "stedi",
  mannfilter: "mannfilter",
  mann: "mannfilter",
  kn: "kn",
  ngkspark: "ngk",
  boschautomotive: "bosch",
  rainx: "rainx",
  meguiars: "meguiars",
  armorall: "armorall",
  chemicalguysaustralia: "chemicalguys",
  ironman: "ironman4x4",
  kickassproducts: "kickass",
};

export function canonicalKey(raw: string): string {
  const k = brandKey(raw);
  return ALIAS[k] ?? k;
}

/** The display name for a brand key, given the spellings stores used. */
export function brandName(key: string, spellings: string[]): string {
  const known = KNOWN_BY_KEY.get(key);
  if (known) return known;
  const c = new Map<string, number>();
  for (const s of spellings) c.set(s.trim(), (c.get(s.trim()) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || (a[0] === a[0].toUpperCase() ? 1 : -1))[0]?.[0] ?? key;
}

const KNOWN_SORTED = [...KNOWN_BY_KEY.values()].sort((a, b) => b.length - a.length);

/** A known maker named at the start of a title ("Penrite HPR 5…"). */
export function brandFromTitle(title: string): string | null {
  const t = title.replace(/^\s*\[[^\]]*\]\s*/, "");
  for (const name of KNOWN_SORTED) {
    const re = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")}(?![a-z0-9])`, "i");
    if (re.test(t)) return name;
  }
  return null;
}

/**
 * The maker of one listing: the vendor, unless it is empty or the store's own
 * name (some shops put themselves there), then a known maker at the start of
 * the title.
 */
export function listingBrand(vendor: string, title: string, storeName: string): string | null {
  const v = vendor.trim();
  const store = brandKey(storeName);
  if (v && brandKey(v) && brandKey(v) !== store && !/^(default|vendor|unknown|various|misc|generic|other|n\/a|aftermarket)/i.test(v)) return v;
  return brandFromTitle(title);
}

export const brandSlug = (key: string, name: string) => slugify(name) || key;
