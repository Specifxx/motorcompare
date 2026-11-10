// The cars and engines the "shop by car" hubs name (owner brief 2026-11-10). A hub lists the products whose own title, or
// the fitment a store quotes, names the car or engine. It is never a fitment claim: the page says the stores name it and
// the buyer checks fitment with the store.
export interface Vehicle {
  slug: string;
  name: string;
  kind: "car" | "engine";
  /** matched against the product title and the stores' quoted fit lines */
  re: RegExp;
}

export const VEHICLES: Vehicle[] = [
  { slug: "subaru-wrx", name: "Subaru WRX", kind: "car", re: /\bwrx\b|\bsti\b/i },
  { slug: "mitsubishi-evo", name: "Mitsubishi Lancer Evo", kind: "car", re: /\bevo(?:lution)?\s?(?:[ivx]{1,4}|\d{1,2})?\b|\bevo\b/i },
  { slug: "toyota-landcruiser", name: "Toyota Landcruiser", kind: "car", re: /land\s?cruiser|\blc[\s-]?\d{2,3}\b|\b(?:70|79|80|100|200|300)\s?series\b/i },
  { slug: "toyota-hilux", name: "Toyota Hilux", kind: "car", re: /\bhilux\b/i },
  { slug: "ford-ranger", name: "Ford Ranger", kind: "car", re: /\branger\b|\braptor\b/i },
  { slug: "nissan-patrol", name: "Nissan Patrol", kind: "car", re: /\bpatrol\b|\by6[0-2]\b|\bgu\b/i },
  { slug: "nissan-navara", name: "Nissan Navara", kind: "car", re: /\bnavara\b|\bnp300\b/i },
  { slug: "nissan-silvia", name: "Nissan Silvia", kind: "car", re: /\bsilvia\b|\bs1[3-5]\b|\b200sx\b|\b180sx\b/i },
  { slug: "nissan-skyline", name: "Nissan Skyline", kind: "car", re: /\bskyline\b|\br3[2-4]\b|\bgt-?r\b/i },
  { slug: "holden-commodore", name: "Holden Commodore", kind: "car", re: /\bcommodore\b|\bhsv\b/i },
  { slug: "ford-falcon", name: "Ford Falcon", kind: "car", re: /\bfalcon\b|\bxr[68]\b|\bfpv\b/i },
  { slug: "honda-civic", name: "Honda Civic", kind: "car", re: /\bcivic\b/i },
  { slug: "toyota-86-brz", name: "Toyota 86 / Subaru BRZ", kind: "car", re: /\bbrz\b|\bg[rt]-?86\b|toyota\s86\b/i },
  { slug: "toyota-supra", name: "Toyota Supra", kind: "car", re: /\bsupra\b|\bjza80\b/i },
  { slug: "mazda-mx5", name: "Mazda MX-5", kind: "car", re: /\bmx-?5\b|\bmiata\b/i },
  { slug: "mazda-rx7", name: "Mazda RX-7", kind: "car", re: /\brx-?7\b/i },
  { slug: "volkswagen-golf", name: "Volkswagen Golf", kind: "car", re: /\bgolf\b/i },
  { slug: "mitsubishi-triton", name: "Mitsubishi Triton", kind: "car", re: /\btriton\b/i },
  { slug: "isuzu-d-max", name: "Isuzu D-Max", kind: "car", re: /\bd-?max\b/i },
  { slug: "ford-mustang", name: "Ford Mustang", kind: "car", re: /\bmustang\b/i },
  { slug: "engine-rb", name: "Nissan RB (RB20, RB25, RB26)", kind: "engine", re: /\brb(?:20|25|26|30)\b/i },
  { slug: "engine-jz", name: "Toyota JZ (1JZ, 2JZ)", kind: "engine", re: /\b[12]jz\b/i },
  { slug: "engine-barra", name: "Ford Barra", kind: "engine", re: /\bbarra\b/i },
  { slug: "engine-ls", name: "GM LS", kind: "engine", re: /\bls[1-9x]?\b(?=.*(?:v8|gen|ls swap|rebel))|\bls\s?swap\b|\brebel ls\b/i },
  { slug: "engine-sr20", name: "Nissan SR20", kind: "engine", re: /\bsr20\b/i },
  { slug: "engine-4g63", name: "Mitsubishi 4G63", kind: "engine", re: /\b4g63\b/i },
];

/** A hub is indexable from this many products; thinner ones are reachable but noindex. */
export const VEHICLE_INDEX_MIN = 8;
