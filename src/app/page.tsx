import type { Metadata } from "next";
import Link from "next/link";
import { CAT_BY_KEY, REGIONS, SITE, STEP_MENU_ORDER, type CatKey } from "@/site";
import { activeStores, catCounts, dealsIn, getBrands, getMeta, getProducts, newestIn } from "@/lib/data";
import { popularNow } from "@/lib/ratings";
import { featuredIn } from "@/lib/featured";
import { ago } from "@/lib/format";
import { SearchBox } from "@/components/SearchBox";
import { RegionChips } from "@/components/RegionPicker";
import { TileGrid } from "@/components/ProductTile";
import { Section } from "@/components/Section";
import { ACTIVE_REGIONS } from "@/lib/regions";
import { CAT_TINT, CatIcon } from "@/components/Art";
import { HeroPicks } from "@/components/HeroPicks";
import { POST_BY_SLUG } from "@/content/blog";
import { GUIDES } from "@/lib/guides";
import { JsonLd, faqLd, siteLd } from "@/lib/seo";
import { SiteReviews } from "@/components/site-reviews/SiteReviews";

export const metadata: Metadata = {
  // 60 characters, keyword first, brand last (SEO audit, 2026-11-03).
  title: { absolute: `Car Parts Price Comparison Australia | ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

/** The homepage's category tiles: the easy-fit consumables first. */
const HOME_STEPS: CatKey[] = STEP_MENU_ORDER.filter((k) => k !== "other");

const FAQ: [string, string][] = [
  [
    "Where is the cheapest place to buy car parts in Australia?",
    "It depends on the part: a different store is cheapest for different parts, and the chains run new promotions every week. We compare each store's own price for the same part, matched by the maker's part number, and show the cheapest in-stock store first.",
  ],
  [
    "How do I know a part fits my car?",
    "We start with parts whose fit is a code you can read yourself: the oil grade in your owner's manual, the size printed on your old battery, the length of your old wiper blade, the code on your old globe and the number on your old filter. Always check that code against the part before you buy.",
  ],
  [
    "Do the prices include delivery?",
    "No. They are each store's listed price in Australian dollars. Delivery costs and click and collect differ by store, so check the checkout before you buy.",
  ],
  [
    "Which stores do you compare?",
    "Australian car parts, battery, oil, lighting and car care stores that sell online, listed on our stores page. eBay and Amazon rows are labelled as ads and never count as the cheapest store.",
  ],
  [
    "Is MotorCompare free?",
    "Yes. Some store links earn us a small commission when you buy, at no cost to you. It never changes the order: stores are always sorted by price.",
  ],
];

export default function Home() {
  const meta = getMeta();
  const all = getProducts();
  const total = all.length;
  const stores = Object.keys(activeStores()).length;
  const counts = catCounts();
  const brands = getBrands().slice(0, 16);
  return (
    <>
      <section className="sc-hero wash relative overflow-hidden border-b border-line">
        {/* The motion layer (owner, 2026-11-06): a slowly drifting wash. Decoration only; globals.css "motion" block. */}
        <span className="mo-bg mo-aurora" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 pb-10 pt-10 md:grid-cols-[1.15fr_1fr] md:pb-12 md:pt-14">
          <div className="min-w-0">
            <p className="mo-enter eyebrow mb-4 text-accent-deep">Car parts price comparison · Australia</p>
            <h1 className="mo-enter h-display max-w-3xl [--mo-d:1] text-[2.4rem] leading-[1.05] sm:text-6xl">
              The right part. <span className="mo-shine text-accent">The best price.</span>
            </h1>
            <p className="mo-enter mt-5 max-w-xl text-lg leading-relaxed text-soft [--mo-d:2]">
              Filters, spark plugs, batteries, globes, brakes and more: every parts store&apos;s price for the same product, side by side. {stores ? `${stores} Australian stores` : "Australian stores"}, matched part for part and checked every day.
            </p>
                        <div className="mo-enter mt-4 max-w-xl [--mo-d:3]">
              <SearchBox big />
            </div>
            <div className="mo-enter mt-6 flex flex-wrap items-center gap-2 text-sm text-soft [--mo-d:4]">
              <span className="rounded-full bg-card/80 px-3 py-1 ring-1 ring-line"><b className="font-semibold text-ink">{total.toLocaleString("en-US")}</b> products</span>
              <span className="rounded-full bg-card/80 px-3 py-1 ring-1 ring-line"><b className="font-semibold text-ink">{stores}</b> stores</span>
              {meta && <span className="rounded-full bg-card/80 px-3 py-1 ring-1 ring-line">Checked {ago(meta.updatedAt)}</span>}
            </div>
          </div>
          {/* Two popular products with price and stores, right of the copy from md, under the search on a phone
              (owner, 2026-11-05): the site's job shown, not described. The hero art it replaces stays in Art.tsx. */}
          <div className="mo-enter relative mx-auto w-full max-w-md md:max-w-none [--mo-d:3]">
            <HeroPicks />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <section className="mt-10">
          <h2 data-reveal className="h-display mb-4 text-2xl">Shop by part</h2>
          <div data-reveal="stagger" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {HOME_STEPS.map((k) => CAT_BY_KEY[k]).filter((c) => counts[c.key] > 0).sort((a, b) => counts[b.key] - counts[a.key]).map((c) => (
              <Link prefetch={false} key={c.key} href={`/${c.key}`} className={`tile-hover flex items-center gap-3 rounded-2xl px-3.5 py-3.5 ${CAT_TINT[c.key]}`}>
                <span className="mo-wiggle grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-card/80">
                  <CatIcon cat={c.key} size={36} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[15.5px] font-medium sm:text-[17px] leading-tight">{c.name}</span>
                  <span className="mt-0.5 block text-xs tabular-nums text-soft">{counts[c.key].toLocaleString("en-US")} compared</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {REGIONS.map((r) => {
          // Featured products (lib/featured.ts).
          const feat = featuredIn(r.code, all);
          const deals = dealsIn(r.code, 8, feat).map((d) => d.f);
          const pop = popularNow(r.code, 8, feat);
          const fresh = newestIn(r.code, 8, feat);
          return (
            <div key={r.code} className={`rp rp-${r.code}`}>
              {pop.length > 0 && (
                <Section title={`Popular ${r.phrase}`} sub="Stocked by the most stores." href="/popular" more="All popular">
                  <TileGrid products={pop} region={r.code} />
                </Section>
              )}
              {deals.length > 0 && (
                <Section title={`Biggest savings ${r.phrase}`} sub="Same part, at least 10% cheaper at one store." href="/deals" more="All deals">
                  <TileGrid products={deals} region={r.code} />
                </Section>
              )}
              {fresh.length > 0 && (
                <Section title="New arrivals" href="/new" more="Everything new">
                  <TileGrid products={fresh} region={r.code} />
                </Section>
              )}
              {!deals.length && !pop.length && (
                <p className="card mt-10 p-6 text-center text-soft">No store has products in stock right now.</p>
              )}
            </div>
          );
        })}

        {brands.length > 0 && (
          <Section title="Popular brands" href="/brands" more="All brands">
            <ul data-reveal="stagger" className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link prefetch={false} href={`/brands/${b.slug}`} className="tile-hover inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium transition hover:border-soft">
                    {b.name} <span className="text-xs text-soft">{b.products.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <section className="mt-16">
          <h2 data-reveal className="h-display mb-6 text-2xl sm:text-3xl">How MotorCompare works</h2>
          <ol data-reveal="stagger" className="grid gap-4 sm:grid-cols-3">
            {[
              ["Matched part for part", "Every listing is matched on the brand and the maker's own part number (or the barcode on the box). No exact number, no match: we never guess from a title, because a wrong part is worse than no price."],
              ["Fit you can check", "Each part shows the code that decides fit: oil grade, battery size, wiper length, globe code or filter number. Check it against your old part."],
              ["Checked every day", "Prices and stock are re-read daily, and each product keeps its price history, so you can tell a real deal from the usual promo price."],
            ].map(([t, d], i) => (
              <li key={t} className={`rounded-2xl p-5 ${["tint-rose", "tint-lavender", "tint-mint"][i]}`}>
                <span className="text-sm font-semibold tabular-nums text-accent-deep">0{i + 1}</span>
                <h3 className="h-display mt-1 text-xl">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 data-reveal className="h-display mb-4 text-2xl sm:text-3xl">Price guides</h2>
          <ul data-reveal className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link prefetch={false} href={`/guides/${g.slug}`} className="font-medium text-ink underline-offset-4 hover:underline">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* The site's own star score and approved reviews (owner, 2026-11-03), loaded in the browser; nothing until there is a rating. */}
        <SiteReviews className="mt-16" />

        <section className="mt-16 max-w-3xl">
          <h2 data-reveal className="h-display mb-4 text-2xl sm:text-3xl">Questions</h2>
          <div data-reveal="stagger" className="space-y-5">
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-soft">{a}</p>
              </div>
            ))}
          </div>
        </section>
        <JsonLd data={siteLd()} />
        <JsonLd data={faqLd(FAQ)} />
      </div>
    </>
  );
}
