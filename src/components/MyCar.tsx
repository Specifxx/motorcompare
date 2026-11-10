"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCar, setCar } from "@/lib/garage";

/** "My car" on the home page: pick it once and the home links straight to its parts (kept in this browser only). */
export function MyCar({ cars }: { cars: { slug: string; name: string; n: number }[] }) {
  const [car, setC] = useState("");
  useEffect(() => {
    setC(getCar());
  }, []);
  const mine = cars.find((c) => c.slug === car);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      {mine ? (
        <>
          <span className="text-soft">Your car:</span>
          <Link prefetch={false} href={`/car/${mine.slug}`} className="rounded-full bg-card px-3 py-1 font-semibold text-ink ring-1 ring-line hover:ring-soft">
            {mine.name} parts ({mine.n}) →
          </Link>
          <Link prefetch={false} href="/garage" className="font-semibold text-accent-deep">My garage</Link>
          <button type="button" onClick={() => { setCar(""); setC(""); }} className="text-soft underline">change</button>
        </>
      ) : (
        <label className="flex items-center gap-2 text-soft">
          Shop for my car:
          <select
            value=""
            onChange={(e) => { setCar(e.target.value); setC(e.target.value); }}
            aria-label="Pick your car or engine"
            className="rounded-full border border-line bg-card px-3 py-1.5 text-ink"
          >
            <option value="">Pick a car or engine</option>
            {cars.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name} ({c.n})</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
