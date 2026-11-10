"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCar, getSaved, toggleSaved, type Saved } from "@/lib/garage";
import { money } from "@/lib/format";

/** The saved parts with today's lowest price beside the price when saved (read from the static /q/<slug> files). */
export function GarageView({ cars }: { cars: { slug: string; name: string }[] }) {
  const [saved, setSaved] = useState<Saved[] | null>(null);
  const [now, setNow] = useState<Record<string, number | null>>({});
  const [car, setCar] = useState("");
  useEffect(() => {
    const load = () => {
      setSaved(getSaved());
      setCar(getCar());
    };
    load();
    window.addEventListener("mc-garage", load);
    return () => window.removeEventListener("mc-garage", load);
  }, []);
  useEffect(() => {
    for (const s of saved ?? []) {
      if (s.slug in now) continue;
      fetch(`/q/${encodeURIComponent(s.slug)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setNow((n) => ({ ...n, [s.slug]: typeof d?.low === "number" ? d.low : null })))
        .catch(() => setNow((n) => ({ ...n, [s.slug]: null })));
    }
  }, [saved, now]);
  const mine = cars.find((c) => c.slug === car);
  return (
    <div>
      <p className="mb-6 text-soft">
        Kept in this browser only: no account, nothing is sent anywhere.{" "}
        {mine ? (
          <>
            Your car: <Link prefetch={false} href={`/car/${mine.slug}`} className="font-semibold text-ink underline">{mine.name}</Link>.
          </>
        ) : (
          <>
            Pick your car on the <Link prefetch={false} href="/" className="font-semibold text-ink underline">home page</Link>.
          </>
        )}
      </p>
      {saved && saved.length === 0 && <p className="card p-6 text-soft">Nothing saved yet. Open a part and press “Save to my garage”.</p>}
      <ul className="grid gap-3">
        {(saved ?? []).map((s) => {
          const cur = now[s.slug];
          const diff = cur != null && s.price != null ? cur - s.price : null;
          return (
            <li key={s.slug} className="card flex flex-wrap items-center gap-3 px-4 py-3">
              <Link prefetch={false} href={`/product/${s.slug}`} className="min-w-0 flex-1 font-medium text-ink hover:underline">{s.name}</Link>
              <span className="text-sm tabular-nums text-soft">saved {s.at}{s.price != null ? ` at ${money(s.price, "AU")}` : ""}</span>
              <span className="text-sm font-semibold tabular-nums">
                {cur == null ? (s.slug in now ? "no stock now" : "…") : money(cur, "AU")}
                {diff != null && diff !== 0 && <span className={`ml-2 ${diff < 0 ? "text-save" : "text-accent-deep"}`}>{diff < 0 ? "▼" : "▲"} {money(Math.abs(diff), "AU")}</span>}
              </span>
              <button type="button" onClick={() => toggleSaved({ slug: s.slug, name: s.name, price: s.price })} className="text-xs text-soft underline">remove</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
