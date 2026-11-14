import { Flag } from "@/components/Flag";
import type { Metadata } from "next";
import { REGIONS } from "@/site";
import { STORES } from "@/content/stores";
import { activeStores } from "@/lib/data";
import { storeUrl } from "@/lib/affiliate";
import { PageHead } from "@/components/Section";
import { SuggestStore } from "@/components/ReportForms";

export const metadata: Metadata = {
  title: "Where to buy car parts online",
  description: "The parts stores MotorCompare compares every day, by region: car parts, battery, oil and car care shops.",
  alternates: { canonical: "/stores" },
};

export default function Stores() {
  const counts = activeStores();
  return (
    <div className="mx-auto max-w-6xl px-4">
      <PageHead
        eyebrow="MotorCompare"
        title="Where to buy car parts online"
        sub="Every store we compare, by region, with how many of its products are on MotorCompare today. Real shops only: no open marketplaces. Know a store we should add? Suggest it below."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS.map((r) => {
          const list = STORES.filter((s) => s.region === r.code).sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || a.name.localeCompare(b.name));
          if (!list.length) return null;
          return (
            <section key={r.code} className="card p-5">
              <h2 className="h-display mb-3 text-xl">
                <Flag code={r.code} /> {r.name}
              </h2>
              {/* Stores with products today in view; the ones still being checked folded underneath (same order, still in the HTML). */}
              {[list.filter((s) => counts[s.id]), list.filter((s) => !counts[s.id])].map((part, i) => {
                if (!part.length) return null;
                const ul = (
                  <ul className={`space-y-1.5 text-sm ${i ? "mt-2" : ""}`}>
                    {part.map((s) => (
                      <li key={s.id} className="flex justify-between gap-2">
                        <a href={storeUrl(s.id, s.base)} rel="nofollow noopener" target="_blank" className="min-w-0 font-medium hover:underline">
                          {s.name}
                        </a>
                        <span className="shrink-0 whitespace-nowrap tabular-nums text-soft">{counts[s.id] ? `${counts[s.id].toLocaleString("en-US")} products` : "checking"}</span>
                      </li>
                    ))}
                  </ul>
                );
                return i ? (
                  <details key="checking" className={`fine text-sm ${list.length > part.length ? "mt-3 border-t border-line pt-1" : ""}`}>
                    <summary>{part.length} more we are still checking</summary>
                    {ul}
                  </details>
                ) : (
                  <div key="live">{ul}</div>
                );
              })}
            </section>
          );
        })}
      </div>
      <section id="suggest" className="mt-10">
        <h2 className="h-display mb-1 text-2xl">Suggest a store</h2>
        <p className="mb-2 text-sm text-soft">A real parts shop we don&apos;t compare yet? We look at every suggestion and add the store if its listings carry the makers&apos; part numbers or barcodes we can read. Store owners welcome: listing is free.</p>
        <SuggestStore regions={REGIONS.map((r) => [r.code, r.name])} what="car parts" buttonClassName="btn-pop btn-buy px-6 py-2 text-sm" />
      </section>
    </div>
  );
}
