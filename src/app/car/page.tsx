import type { Metadata } from "next";
import Link from "next/link";
import { liveVehicles } from "@/lib/vehicles";
import { PageHead } from "@/components/Section";
import { Crumbs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Parts whose listings name a car or engine, prices across Australian stores",
  description: "Parts whose store listings mention a car or engine (WRX, Evo, Landcruiser, Ranger, Patrol, RB26, 2JZ and more). We have not checked that any part fits: match the part number to your old part.",
  alternates: { canonical: "/car" },
};

export default function CarIndex() {
  const live = liveVehicles();
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Crumbs items={[{ name: "Parts that name a car", path: "/car" }]} />
      <PageHead eyebrow="Mentioned in listings" title="Parts that name a car or engine" sub={<p>These are only parts whose store listing mentions the car or engine. We have not checked fitment, so this is a starting point: always match the part number to your old part, or ask the store, before you buy. <Link prefetch={false} href="/fit" className="font-semibold text-accent-deep">Start from the part number instead →</Link></p>} />
      <ul className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {live.map(({ v, n }) => (
          <li key={v.slug}>
            <Link prefetch={false} href={`/car/${v.slug}`} className="card tile-hover flex items-center justify-between px-4 py-3.5">
              <span className="font-display text-[17px] font-medium">{v.name}</span>
              <span className="text-xs tabular-nums text-soft">{n.toLocaleString("en-US")} parts</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
