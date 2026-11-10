import { DEFAULT_REGION, SITE } from "@/site";
import { getMeta, getProducts } from "@/lib/data";
import { heroPicks } from "@/lib/hero-picks";
import { homeImage, HOME_IMAGE_SIZE, photoDataUri } from "@/lib/og/home-image";

// The homepage's link preview, and every page's without one of its own: the
// brand line beside the two products the hero shows, with their photos,
// cheapest price and store count (owner, 2026-11-05). Drawn at the day's
// build, never per request (no params: a static route). src/lib/og/home-image.tsx.
export const alt = "MotorCompare: prices compared across parts stores, matched by part number";
export const size = HOME_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const picks = heroPicks(DEFAULT_REGION, getProducts(), 2);
  const photos = await Promise.all(picks.map((p) => photoDataUri(p.f.img)));
  return homeImage({
    region: DEFAULT_REGION,
    picks: picks.map((pick, i) => ({ pick, photo: photos[i] })),
    asOf: getMeta()?.updatedAt ?? null,
    brand: SITE.name,
    line1: "The right part.",
    line2: "The best price.",
    blurb: "Filters, spark plugs, batteries, globes and more, priced across parts stores. Matched part for part.",
    domain: SITE.domain,
  });
}
