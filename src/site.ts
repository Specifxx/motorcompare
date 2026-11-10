// MotorCompare's one config file: name, host, region and part categories.
// Store lists live in src/content/stores.ts.

export const SITE = {
  key: "motor",
  name: "MotorCompare",
  domain: "motorcompare.app",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://motorcompare.app").replace(/\/$/, ""),
  slogan: "The right part. The best price.",
  tagline: "Compare car part prices across Australian parts stores",
  description:
    "Compare prices on filters, spark plugs, car batteries, globes, brakes, engine oil and more across Australian car parts stores, matched part for part.",
  /** Every contact address on the site (owner, 2026-10-30: the family inbox). */
  email: "compareempire@gmail.com",
  /** A product gets a page only when this many stores sell it (comparing one shop is pointless). */
  minStoresPerRegion: 2,
  /** The eBay and Amazon side rails and the phone dock (components/SideRails.tsx). On since the 2026-11-10 full launch (owner). */
  sideRails: true as boolean,
} as const;

export type RegionCode = "US" | "UK" | "CA" | "AU" | "NZ" | "EU";

export interface Region {
  code: RegionCode;
  name: string;
  /** "in Australia" */
  phrase: string;
  currency: string;
  /** Shopify Markets country asked for on every request (prices follow the
   *  visitor's country, and GitHub's runners are in the US). */
  shopifyCountry: string;
  flag: string;
  ebayHost: string | null;
  amazonHost: string | null;
  /** IANA time zone prefixes that pick this region for a first-time visitor. */
  zones: string[];
}

/** Australia only for now (owner, 2026-11-08). The type keeps every code so the
 *  engine's shared code compiles unchanged; only AU is listed and served. */
export const ALL_REGIONS: Region[] = [
  { code: "US", name: "United States", phrase: "in the US", currency: "USD", shopifyCountry: "US", flag: "🇺🇸", ebayHost: "www.ebay.com", amazonHost: "www.amazon.com", zones: ["America/"] },
  { code: "UK", name: "United Kingdom", phrase: "in the UK", currency: "GBP", shopifyCountry: "GB", flag: "🇬🇧", ebayHost: "www.ebay.co.uk", amazonHost: "www.amazon.co.uk", zones: ["Europe/London"] },
  { code: "CA", name: "Canada", phrase: "in Canada", currency: "CAD", shopifyCountry: "CA", flag: "🇨🇦", ebayHost: "www.ebay.ca", amazonHost: "www.amazon.ca", zones: ["America/Toronto"] },
  { code: "AU", name: "Australia", phrase: "in Australia", currency: "AUD", shopifyCountry: "AU", flag: "🇦🇺", ebayHost: "www.ebay.com.au", amazonHost: "www.amazon.com.au", zones: ["Australia/"] },
  { code: "NZ", name: "New Zealand", phrase: "in New Zealand", currency: "NZD", shopifyCountry: "NZ", flag: "🇳🇿", ebayHost: null, amazonHost: null, zones: ["Pacific/Auckland"] },
  { code: "EU", name: "Europe", phrase: "in Europe", currency: "EUR", shopifyCountry: "DE", flag: "🇪🇺", ebayHost: "www.ebay.de", amazonHost: "www.amazon.de", zones: ["Europe/"] },
];

/** The regions the site serves: Australia only (owner, 2026-11-08). The engine's shared code can still look up any
 *  region (REGION_BY_CODE), but nothing iterates more than these. */
export const REGIONS: Region[] = ALL_REGIONS.filter((r) => r.code === "AU");

export const REGION_BY_CODE = Object.fromEntries(ALL_REGIONS.map((r) => [r.code, r])) as Record<RegionCode, Region>;

/** The one region every visitor gets. */
export const DEFAULT_REGION: RegionCode = "AU";

/** Pick a region from the browser's time zone; the more specific match wins
 *  (America/Toronto is Canada, not the US). */
export function regionForZone(_zone: string | undefined | null): RegionCode {
  return DEFAULT_REGION;
}

/**
 * The part categories. v1 sells parts whose fit is a code printed on the old
 * part or in the owner's manual (oil grade, battery size, wiper length, globe
 * code, filter number), so a buyer can check fit without a vehicle database.
 */
export type CatKey = "oil" | "batteries" | "wipers" | "globes" | "filters" | "plugs" | "brakes" | "fluids" | "care" | "accessories" | "turbo" | "engine" | "exhaust" | "cooling" | "driveline" | "suspension" | "electrics" | "tools" | "other";

export interface Category {
  key: CatKey;
  name: string;
  /** "car batteries": what people search for */
  plural: string;
  /** One sentence for hub pages; facts only. */
  about: string;
  /** Where the buyer finds the code that decides fit. */
  fit: string;
}

/** "other" is last and has no hub of its own in the nav. */
export const CATEGORIES: Category[] = [
  { key: "oil", name: "Engine oil", plural: "engine oils", about: "Engine oil by grade and size, from Penrite, Castrol, Nulon, Mobil, Shell, Valvoline and more.", fit: "Your owner's manual or the oil cap names the grade (5W-30) and the spec (API SP, ACEA C3)." },
  { key: "batteries", name: "Car batteries", plural: "car batteries", about: "Car, 4WD and deep-cycle batteries by size code, from Century, Exide, Varta, Bosch and more.", fit: "The size code (N70ZZ, NS40ZL, DIN55) and CCA are printed on top of your old battery." },
  { key: "wipers", name: "Wiper blades", plural: "wiper blades", about: "Wiper blades and refills by length, from Bosch, Valeo, Rain-X, Trico, PIAA and more.", fit: "Measure your old blades in millimetres; driver and passenger are often different lengths." },
  { key: "globes", name: "Globes & lighting", plural: "headlight globes and car lights", about: "Headlight, fog, indicator and interior globes by code, from Philips, Narva, Osram and more.", fit: "The globe code (H4, H7, 9005, T10) is printed on the base of the old globe." },
  { key: "filters", name: "Filters", plural: "oil, air, cabin and fuel filters", about: "Oil, air, cabin and fuel filters by part number, from Ryco, Wesfil, Sakura, Mann and more.", fit: "Match the number on your old filter (Ryco Z386) or your service book." },
  { key: "plugs", name: "Spark plugs", plural: "spark plugs and glow plugs", about: "Spark and glow plugs by part number, from NGK, Denso, Bosch and Champion.", fit: "Match the code printed on your old plug, or your owner's manual." },
  { key: "brakes", name: "Brakes", plural: "brake pads, rotors and brake fluid", about: "Brake pads, rotors and brake fluid, from Bendix, Brembo, DBA, Protex and more.", fit: "Brake parts fit by make, model and year: check the store's fitment list before you buy." },
  { key: "fluids", name: "Coolant & fluids", plural: "coolant, transmission and other fluids", about: "Coolant, transmission and diff oil, power steering fluid and additives.", fit: "The spec on your manual or reservoir decides (OAT coolant, Dexron VI, 75W-90)." },
  { key: "care", name: "Car care", plural: "car care and detailing products", about: "Car wash, wax, polish, ceramic coatings, microfibre and interior cleaners.", fit: "Fits any car: compare by size." },
  { key: "accessories", name: "Accessories & 12V", plural: "car accessories and 12V gear", about: "Jump starters, battery chargers, dash cams, tyre inflators and 12V accessories.", fit: "Check the voltage and the plug for your car." },
  { key: "turbo", name: "Turbo & boost", plural: "turbochargers, wastegates and boost control", about: "Turbochargers, wastegates, blow off valves and boost controllers, from Turbosmart and more.", fit: "Check the flange, the actuator pressure and the car it is listed for with the store before you buy." },
  { key: "engine", name: "Engine management", plural: "engine management, ECUs and injectors", about: "Aftermarket ECUs, harnesses, sensors, injectors and fuel parts, from Haltech, Injector Dynamics and more.", fit: "Check the car or engine the store lists it for, and the connector, before you buy." },
  { key: "exhaust", name: "Exhaust", plural: "exhaust systems", about: "Cat-back and performance exhaust systems, mufflers and pipes.", fit: "Check the car, the engine and the pipe size the store lists before you buy." },
  { key: "cooling", name: "Cooling", plural: "radiators, intercoolers and cooling parts", about: "Radiators, intercoolers, oil coolers and fans, from Koyorad, Process West and more.", fit: "Check the car and the core size the store lists before you buy." },
  { key: "driveline", name: "Clutch & driveline", plural: "clutches, flywheels and driveline parts", about: "Clutch kits, flywheels, gearbox and diff parts, from Exedy and more.", fit: "Check the car, the engine and the spline count the store lists before you buy." },
  { key: "suspension", name: "Suspension", plural: "shocks, springs and suspension", about: "Shock absorbers, struts, springs, coilovers and sway bars, from Whiteline, KYB, Ohlins and more.", fit: "Suspension fits by make, model and year: check the store's fitment list before you buy." },
  { key: "electrics", name: "4WD & touring electrics", plural: "4WD and touring electrics", about: "Dual battery and solar gear, fuses and fusible links, switches, UHF radios and wiring, from Narva, Redarc, Victron, GME and more.", fit: "Check the voltage, the amp rating and the plug type before you buy." },
  { key: "tools", name: "Tools", plural: "workshop tools", about: "Spanners, sockets, tool kits and workshop tools, from Kincrome and more.", fit: "Fits any car: compare by size and kit contents." },
  { key: "other", name: "More parts", plural: "more car parts", about: "Other car parts and fittings stores sell, matched by part number.", fit: "Check the part number against your old part." },
];

/** Menu order: the easy-fit consumables first. */
export const STEP_MENU_ORDER: CatKey[] = ["oil", "batteries", "wipers", "globes", "filters", "plugs", "brakes", "fluids", "care", "accessories", "turbo", "engine", "exhaust", "cooling", "driveline", "suspension", "electrics", "tools", "other"];

export const CAT_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<CatKey, Category>;

/**
 * How the menus group the categories (cousin's review, 2026-11-10: "the common way to categorise is servicing, performance
 * parts, 4WD"). The categories and their URLs are unchanged; this only decides the headings a menu puts them under.
 */
export const PART_BUCKETS: { title: string; cats: CatKey[] }[] = [
  { title: "Servicing", cats: ["oil", "filters", "plugs", "batteries", "wipers", "globes", "fluids"] },
  { title: "Brakes & suspension", cats: ["brakes", "suspension"] },
  { title: "Performance", cats: ["turbo", "engine", "exhaust", "cooling", "driveline"] },
  { title: "4WD & touring", cats: ["electrics", "accessories"] },
  { title: "Care & workshop", cats: ["care", "tools", "other"] },
];
