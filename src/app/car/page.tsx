import type { Metadata } from "next";
import Link from "next/link";
import { liveVehicles } from "@/lib/vehicles";
import { PageHead } from "@/components/Section";
import { Crumbs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Car parts by car and engine, prices across Australian stores",
  description: "Find parts whose store listings name your car or engine: WRX, Evo, Landcruiser, Ranger, Patrol, Silvia, Skyline, RB26, 2JZ and more. Stores name the car; check fitment with the store.",
  alternates: { canonical: "/car" },
};

export default function CarIndex() {
  const live = liveVehicles();
  return (
    <div className="mx-auto max-w-6xl px-4">
      <Crumbs items={[{ name: "By car and engine", path: "/car" }]} />
      <PageHead eyebrow="Shop by car" title="Car parts by car and engine" sub={<p>Parts whose store listing names the car or engine. We never say a part fits: the stores name the car, and you check fitment with the store before you buy.</p>} />
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
