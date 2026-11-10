"use client";
import { useEffect, useState } from "react";
import { isSaved, toggleSaved } from "@/lib/garage";

/** "Save this part": remembers this part and today's lowest price in this browser only. */
export function WatchButton({ slug, name, price, className = "" }: { slug: string; name: string; price: number | null; className?: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(isSaved(slug));
  }, [slug]);
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => setSaved(toggleSaved({ slug, name, price }))}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${saved ? "border-accent bg-accent-pale text-accent-deep" : "border-line bg-card text-ink hover:border-soft"} ${className}`}
    >
      <span aria-hidden>{saved ? "★" : "☆"}</span> {saved ? "Saved" : "Save this part"}
    </button>
  );
}
