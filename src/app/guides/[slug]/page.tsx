import type { Metadata } from "next";
import { fitDescription, fitTitle } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CAT_BY_KEY, REGIONS, REGION_BY_CODE, SITE, type RegionCode } from "@/site";
import { STORES } from "@/content/stores";
import { activeStores, bestIn, dealsIn, getMeta, getProduct, getProducts, popularIn, productsOfCat, spreadIn, storeName } from "@/lib/data";
import { shareRows } from "@/lib/og/share-rows";
import { GUIDES, GUIDE_BY_SLUG, countryName } from "@/lib/guides";
import { money, niceDate, pct } from "@/lib/format";
import { storeUrl } from "@/lib/affiliate";
import { PageHead } from "@/components/Section";
import { PriceList } from "@/components/PriceList";
import type { Product } from "@/lib/types";
import { Crumbs } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = GUIDE_BY_SLUG[params.slug];
  if (!g) return {};
  return {
    title: fitTitle(g.title, g.title.split(":")[0]),
    description: fitDescription(g.description),
    alternates: { canonical: `/guides/${g.slug}` },
    // The card itself is the sibling opengraph-image.tsx.
    openGraph: { siteName: SITE.name, type: "article", title: g.title, description: g.description, url: `/guides/${g.slug}` },
  };
}

const STORES_SHOWN = 12;

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = GUIDE_BY_SLUG[params.slug];
  if (!g) notFound();
  const meta = getMeta();
  const updated = meta ? niceDate(meta.updatedAt) : null;

  if (g.kind === "cat") {
    const c = CAT_BY_KEY[g.cat];
    const list = productsOfCat(g.cat);
    return (
      <div className="mx-auto max-w-5xl px-4">
        <Crumbs items={[{ name: "Guides", path: "/guides" }, { name: g.title, path: `/guides/${g.slug}` }]} />
        <PageHead
          eyebrow="Price guide"
          title={g.title}
          sub={
            <p>
              The {c.plural} stocked by the most stores {updated ? `as of ${updated}` : "today"}, cheapest first, with where each is cheapest and how much you save over the dearest store. Same part number, same size: only the price differs. See every product in{" "}
              <Link prefetch={false} href={`/${c.key}`} className="font-medium text-ink underline underline-offset-4">
                {c.name}
              </Link>
              .
            </p>
          }
        />
        {REGIONS.map((r) => (
          <div key={r.code} className={`rp rp-${r.code}`}>
            <h2 className="h-display mb-3 text-xl">
              {c.plural.replace(/^./, (x) => x.toUpperCase())} prices {r.phrase}
            </h2>
            <PriceList region={r.code} products={popularIn(r.code, 30, list)} />
          </div>
        ))}
        <p className="mt-4 text-xs text-soft">Prices exclude shipping. Change the region at the top of the page to see another country&apos;s stores.</p>
      </div>
    );
  }

  const r = REGION_BY_CODE[g.region];
  const counts = activeStores();
  const stores = STORES.filter((s) => s.region === g.region).sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  const deals = dealsIn(g.region, 15);
  const gaps = shareRows(g.region, getProducts(), 5, g.region === "NZ" ? 2 : 3).flatMap((x) => getProduct(x.slug) ?? []);
  return (
    <div className="mx-auto max-w-5xl px-4">
      <Crumbs items={[{ name: "Guides", path: "/guides" }, { name: g.title, path: `/guides/${g.slug}` }]} />
      <PageHead
        eyebrow="Price guide"
        title={g.title}
        sub={`${stores.length} parts stores sell in ${countryName(g.region)} in ${r.currency}. Here is who they are, which is cheapest for the best-known products, and today's biggest price gaps${updated ? `, as of ${updated}` : ""}.`}
      />
      <section className="mb-10">
        <h2 className="h-display mb-3 text-xl">The stores</h2>
        {/* The first dozen in view, the rest folded (still in the page's HTML, same order): the list ran to a hundred rows. */}
        {[stores.slice(0, STORES_SHOWN), stores.slice(STORES_SHOWN)].map((list, i) => {
          if (!list.length) return null;
          const ul = (
            <ul className={`grid gap-2 sm:grid-cols-2 ${i ? "mt-2" : ""}`}>
              {list.map((s) => (
                <li key={s.id} className="card flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <a href={storeUrl(s.id, s.base)} target="_blank" rel="nofollow noopener" className="min-w-0 font-medium hover:underline">
                    {s.name}
                  </a>
                  <span className="shrink-0 tabular-nums text-soft">{counts[s.id] ? `${counts[s.id].toLocaleString("en-US")} products compared` : "checking"}</span>
                </li>
              ))}
            </ul>
          );
          return i ? (
            <details key="rest" className="fine mt-2 text-sm">
              <summary>Show all {stores.length} stores</summary>
              {ul}
            </details>
          ) : (
            <div key="head">{ul}</div>
          );
        })}
      </section>
      {gaps.length > 0 && (
        <section className="mb-10">
          <h2 className="h-display mb-3 text-xl">Same product, different price</h2>
          <p className="mb-3 text-sm text-soft">Well-known products where one store charges much less than another for the same part and size. These are the rows on this guide&apos;s share card.</p>
          <PriceList region={g.region} products={gaps} />
        </section>
      )}
      <section className="mb-10">
        <h2 className="h-display mb-3 text-xl">The best-known products, cheapest first</h2>
        <PriceList region={g.region} products={popularIn(g.region, 30)} />
      </section>
      {deals.length > 0 && (
        <section className="mb-10">
          <h2 className="h-display mb-3 text-xl">Today&apos;s biggest price gaps</h2>
          <PriceList region={g.region} products={deals.map((d) => d.f)} />
        </section>
      )}
      <p className="text-xs text-soft">Prices exclude shipping, which differs by store and order size. Every price is the store&apos;s own, in {r.currency}, never converted.</p>
    </div>
  );
}
