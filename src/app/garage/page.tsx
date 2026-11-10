import type { Metadata } from "next";
import { liveVehicles } from "@/lib/vehicles";
import { GarageView } from "@/components/GarageView";
import { PageHead } from "@/components/Section";

export const metadata: Metadata = {
  title: "My garage",
  description: "Your saved car parts and the price change since you saved them. Kept in your browser only.",
  alternates: { canonical: "/garage" },
  robots: { index: false, follow: true },
};

export default function GaragePage() {
  return (
    <div className="mx-auto max-w-4xl px-4">
      <PageHead eyebrow="Your parts" title="My garage" sub={<p>The parts you saved, with today&apos;s lowest price beside the price when you saved them.</p>} />
      <div className="mb-12">
        <GarageView cars={liveVehicles().map(({ v }) => ({ slug: v.slug, name: v.name }))} />
      </div>
    </div>
  );
}
