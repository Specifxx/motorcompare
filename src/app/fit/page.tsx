import type { Metadata } from "next";
import Link from "next/link";
import { CAT_BY_KEY } from "@/site";
import { fitHubs } from "@/lib/data";
import { FIT_CATS, fitPath } from "@/lib/fit-codes";
import { PageHead } from "@/components/Section";
import { Crumbs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop car parts by the code on your old part",
  description: "Oil grade, battery size, globe code, wiper length or filter number: pick the code printed on your old part and compare every store's price.",
  alternates: { canonical: "/fit" },
};

export default function FitIndex() {
  const hubs = fitHubs();
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Crumbs items={[{ name: "Part codes", path: "/fit" }]} />
      <PageHead
        eyebrow="Shop by part code"
        title="Shop by the code on your old part"
        sub={<p>The oil grade on the cap, the size on top of the battery, the code on the globe&apos;s base, your wiper&apos;s length or the number on the old filter: pick it and compare every store. We don&apos;t claim which cars a part fits; the code on your old part is the safest match.</p>}
      />
      {FIT_CATS.map((fc) => {
        const list = [...(hubs.get(fc.cat)?.values() ?? [])].sort((a, b) => b.products.length - a.products.length || a.code.localeCompare(b.code));
        if (!list.length) return null;
        const cat = CAT_BY_KEY[fc.cat];
        return (
          <section key={fc.cat} className="mb-8">
            <h2 className="h-display mb-1 text-xl">{fc.what}</h2>
            <p className="mb-3 text-sm text-soft">{cat.fit}</p>
            <ul className="flex flex-wrap gap-2">
              {list.slice(0, 60).map((x) => (
                <li key={x.code}>
                  <Link prefetch={false} href={fitPath(fc.cat, x.code)} className="chip border border-line bg-card py-1.5 text-sm text-ink hover:border-soft">
                    {x.code} <span className="text-soft">{x.products.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!hubs.size && <p className="card p-6 text-center text-soft">Part codes appear here after the first price import.</p>}
    </div>
  );
}
