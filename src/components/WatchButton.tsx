"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { isSaved, toggleSaved } from "@/lib/garage";

/** "Save this part": remembers this part and today's lowest price in this browser only. */
export function WatchButton({ slug, name, price, className = "" }: { slug: string; name: string; price: number | null; className?: string }) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(false);
  useEffect(() => {
    setSaved(isSaved(slug));
  }, [slug]);
  return (
    <span className="relative inline-flex">
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => {
        const now = toggleSaved({ slug, name, price });
        setSaved(now);
        setToast(now);
        if (now) window.setTimeout(() => setToast(false), 5000);
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${saved ? "border-accent bg-accent-pale text-accent-deep" : "border-line bg-card text-ink hover:border-soft"} ${className}`}
    >
      <span aria-hidden>{saved ? "★" : "☆"}</span> {saved ? "Saved" : "Save this part"}
    </button>
    {toast && (
      <span role="status" className="absolute left-0 top-full z-20 mt-2 whitespace-nowrap rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink shadow-lg">
        Saved. <Link prefetch={false} href="/garage" className="font-semibold text-accent-deep underline">View saved parts</Link>
      </span>
    )}
    </span>
  );
}
