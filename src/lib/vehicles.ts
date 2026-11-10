// Shop by car and engine: the products whose title or quoted fitment names a vehicle (content/vehicles.ts).
import { VEHICLES, type Vehicle } from "@/content/vehicles";
import { getProducts, storeCount } from "./data";
import type { Product } from "./types";

const text = (f: Product) => `${f.name} ${Object.values(f.fit ?? {}).flat().join(" ")}`;

let cache: Map<string, Product[]> | null = null;
function hubs(): Map<string, Product[]> {
  if (!cache) {
    cache = new Map(VEHICLES.map((v) => [v.slug, [] as Product[]]));
    for (const f of getProducts()) {
      const t = text(f);
      for (const v of VEHICLES) if (v.re.test(t)) cache.get(v.slug)!.push(f);
    }
    for (const list of cache.values()) list.sort((a, b) => storeCount(b) - storeCount(a) || a.slug.localeCompare(b.slug));
  }
  return cache;
}

export const vehicleProducts = (v: Vehicle): Product[] => hubs().get(v.slug) ?? [];
/** The hubs that have at least one product, biggest first. */
export const liveVehicles = (): { v: Vehicle; n: number }[] =>
  VEHICLES.map((v) => ({ v, n: vehicleProducts(v).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
