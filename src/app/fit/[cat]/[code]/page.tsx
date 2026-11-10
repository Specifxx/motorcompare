import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CAT_BY_KEY, type CatKey } from "@/site";
import { fitHub, fitHubs } from "@/lib/data";
import { fitCat, fitIndexable, fitPath } from "@/lib/fit-codes";
import { TileGrid } from "@/components/ProductTile";
import { PageHead } from "@/components/Section";
import { Crumbs } from "@/lib/seo";

// Shop by part code (lib/fit-codes.ts, DECISIONS.md 2026-11-08): every product whose name states this code, all
// prerendered at the release build; noindex until FIT_INDEX_MIN products.
export const dynamicParams = false;
export function generateStaticParams() {
  return [...fitHubs()].flatMap(([cat, hubs]) => [...hubs.keys()].map((code) => ({ cat, code })));
}

const PER_PAGE = 96;

export function generateMetadata({ params }: { params: { cat: string; code: string } }): Metadata {
  const h = fitHub(params.cat, params.code);
  const fc = fitCat(params.cat);
  if (!h || !fc) return {};
  const n = h.products.length;
  return {
    title: `${fc.noun(h.code)} prices: ${n} compared across stores`,
    description: `Compare ${n} ${fc.noun(h.code)} across parts stores, cheapest first by store. Check the code on your old part before you buy; matched by barcode, updated daily.`,
    alternates: { canonical: fitPath(params.cat as CatKey, h.code) },
    ...(fitIndexable(n) ? {} : { robots: { index: false, follow: true } }),
  };
}

export default function FitHubPage({ params }: { params: { cat: string; code: string } }) {
  const h = fitHub(params.cat, params.code);
  const fc = fitCat(params.cat);
  if (!h || !fc) notFound();
  const cat = CAT_BY_KEY[params.cat as CatKey];
  const others = [...(fitHubs().get(cat.key)?.values() ?? [])]
    .filter((x) => x.code !== h.code && fitIndexable(x.products.length))
    .sort((a, b) => b.products.length - a.products.length)
    .slice(0, 16);
  const title = fc.noun(h.code).replace(/^./, (x) => x.toUpperCase());
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Crumbs items={[{ name: "Part codes", path: "/fit" }, { name: cat.name, path: `/${cat.key}` }, { name: h.code, path: fitPath(cat.key, h.code) }]} />
      <PageHead
        eyebrow={`Shop by part code · ${fc.what}`}
        title={`${title} prices`}
        sub={
          <p>
            {h.products.length.toLocaleString("en-US")} products whose own listing states {h.code}, most widely stocked first, with every store&apos;s price. {cat.fit} We don&apos;t say which cars a part fits: check the code against your old part before you buy.
          </p>
        }
      />
      <TileGrid products={h.products.slice(0, PER_PAGE)} />
      {others.length > 0 && (
        <section className="mb-12 mt-10">
          <h2 className="eyebrow mb-2">Other {fc.what.toLowerCase()}s</h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((x) => (
              <li key={x.code}>
                <Link prefetch={false} href={fitPath(cat.key, x.code)} className="chip border border-line bg-card py-1.5 text-sm text-ink hover:border-soft">
                  {x.code} <span className="text-soft">{x.products.length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
