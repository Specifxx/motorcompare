// Shop by the code on your old part (competitor scan, owner 2026-11-08: search-by-need hubs). A buyer who knows the
// code printed on the old part (a 5W-30 oil, an N70ZZ battery, an H4 globe, a 600 mm wiper, a Z386 filter) lands on
// every product that states it, with every store's price. The code is read from the product's own name
// (`partCode`, lib/title.ts); never guessed. Make-and-model fitment is still NOT claimed anywhere (CLAUDE.md): the page
// tells the buyer to check the code against the old part. Indexed and in the sitemap only with FIT_INDEX_MIN products
// (owner: 3+). PURE. DECISIONS.md 2026-11-08.
import type { CatKey } from "@/site";

export const FIT_INDEX_MIN = 3;

/** The sections a code decides, in menu order, with how a hub names its products. */
export const FIT_CATS: { cat: CatKey; noun: (code: string) => string; what: string }[] = [
  { cat: "oil", noun: (c) => `${c} engine oil`, what: "Oil grade" },
  { cat: "batteries", noun: (c) => `${c} car batteries`, what: "Battery size" },
  { cat: "globes", noun: (c) => `${c} globes`, what: "Globe code" },
  { cat: "wipers", noun: (c) => `${c} wiper blades`, what: "Wiper length" },
  { cat: "filters", noun: (c) => `${c} filters`, what: "Filter number" },
];
export const FIT_CAT_KEYS = new Set<CatKey>(FIT_CATS.map((x) => x.cat));
export const fitCat = (cat: string) => FIT_CATS.find((x) => x.cat === cat);

/** "5W-30" → "5w-30", "N70ZZ" → "n70zz", "600mm" → "600mm". */
export const codeSlug = (code: string) =>
  code
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const fitPath = (cat: CatKey, code: string) => `/fit/${cat}/${codeSlug(code)}`;
export const fitIndexable = (count: number) => count >= FIT_INDEX_MIN;
