import { InlineAds } from "@/components/InlineAds";
import type { Metadata } from "next";
import { fitDescription, fitTitle } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/site";
import { getBrand, getBrands, storeCount } from "@/lib/data";
import { TileGrid } from "@/components/ProductTile";
import { PageHead } from "@/components/Section";
import { Browse } from "@/components/Browse";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const b = getBrand(params.slug);
  if (!b) return {};
  const stores = new Set(b.products.flatMap((f) => Object.values(f.offers).flatMap((o) => (o ?? []).map((x) => x.s)))).size;
  return {
    // The brand name first (what people search: "Penrite oil price"), then the counts while they fit.
    title: fitTitle(
      `${b.name} prices: ${b.products.length} products, ${stores} stores`,
      `${b.name} prices compared`,
      `${b.name} prices`,
    ),
    description: fitDescription(
      `Compare ${b.name} prices across ${stores} parts stores. ${b.products.length} products, matched by part number.`,
      `Compare ${b.name} prices across ${stores} parts stores. ${b.products.length} products, matched by part number.`,
      `Compare ${b.name} prices across ${stores} parts stores: ${b.products.length} products, matched by part number, updated daily.`,
    ),
    alternates: { canonical: `/brands/${b.slug}` },
  };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const b = getBrand(params.slug);
  if (!b) notFound();
  const list = b.products.slice().sort((x, y) => storeCount(y) - storeCount(x) || x.name.localeCompare(y.name));
  const cats = CATEGORIES.filter((c) => list.some((f) => f.cat === c.key));
  return (
    <div className="mx-auto max-w-6xl px-4">
      <JsonLd data={breadcrumbLd([{ name: "Brands", path: "/brands" }, { name: b.name, path: `/brands/${b.slug}` }])} />
      <nav aria-label="Breadcrumb" className="mt-5 text-sm text-soft">
        <Link prefetch={false} href="/brands" className="hover:text-ink">Brands</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{b.name}</span>
      </nav>
      <PageHead
        eyebrow="Brand"
        title={`${b.name} prices`}
        sub={`${list.length} ${b.name} products compared across real parts stores, matched by part number, size by size. Most widely stocked first; prices show for your region.`}
      />
      <Browse brand={b.slug}>
      {cats.map((c) => {
        const inCat = list.filter((f) => f.cat === c.key);
        return (
          <section key={c.key} className="mb-10">
            <h2 className="h-display mb-4 text-xl">
              {c.name} <span className="text-base text-soft">({inCat.length})</span>
            </h2>
            <TileGrid products={inCat} />
          </section>
        );
      })}
      </Browse>
      <InlineAds page="brand" />
    </div>
  );
}
