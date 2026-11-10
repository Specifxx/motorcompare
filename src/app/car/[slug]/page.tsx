import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VEHICLES, VEHICLE_INDEX_MIN } from "@/content/vehicles";
import { liveVehicles, vehicleProducts } from "@/lib/vehicles";
import { TileGrid } from "@/components/ProductTile";
import { PageHead } from "@/components/Section";
import { Crumbs } from "@/lib/seo";

// Shop by car and engine (DECISIONS.md 2026-11-10). One static page per named car or engine; noindex under VEHICLE_INDEX_MIN.
export const dynamicParams = false;
export const generateStaticParams = () => VEHICLES.map((v) => ({ slug: v.slug }));

const PER_PAGE = 96;
const find = (slug: string) => VEHICLES.find((v) => v.slug === slug);

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const v = find(params.slug);
  if (!v) return {};
  const n = vehicleProducts(v).length;
  return {
    title: `${v.name} parts prices across Australian stores`,
    description: `${n} parts whose store listings name the ${v.name}, compared across Australian stores. The stores name the ${v.kind}; check fitment with the store before you buy.`,
    alternates: { canonical: `/car/${v.slug}` },
    ...(n >= VEHICLE_INDEX_MIN ? {} : { robots: { index: false, follow: true } }),
  };
}

export default function CarHub({ params }: { params: { slug: string } }) {
  const v = find(params.slug);
  if (!v) notFound();
  const list = vehicleProducts(v);
  if (!list.length) notFound();
  const others = liveVehicles().filter((x) => x.v.slug !== v.slug).slice(0, 14);
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Crumbs items={[{ name: "By car and engine", path: "/car" }, { name: v.name, path: `/car/${v.slug}` }]} />
      <PageHead
        eyebrow={v.kind === "engine" ? "Shop by engine" : "Shop by car"}
        title={`${v.name} parts prices`}
        sub={<p>{list.length.toLocaleString("en-US")} parts whose store listing names the {v.name}, most widely stocked first, with every store&apos;s price. The stores name the {v.kind}: we do not say a part fits. Check fitment with the store and the part number against your old part before you buy.</p>}
      />
      <TileGrid products={list.slice(0, PER_PAGE)} />
      <section className="mb-12 mt-10">
        <h2 className="eyebrow mb-2">Other cars and engines</h2>
        <ul className="flex flex-wrap gap-2">
          {others.map(({ v: o, n }) => (
            <li key={o.slug}>
              <Link prefetch={false} href={`/car/${o.slug}`} className="chip border border-line bg-card py-1.5 text-sm text-ink hover:border-soft">
                {o.name} <span className="text-soft">{n}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
