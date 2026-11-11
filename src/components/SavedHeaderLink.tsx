"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSaved } from "@/lib/garage";

/** "Saved (n)" in the header: the way back to /garage (kept in this browser only). Hidden until something is saved. */
export function SavedHeaderLink({ className = "" }: { className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => setN(getSaved().length);
    sync();
    window.addEventListener("mc-garage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mc-garage", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  if (n === 0) return null;
  return (
    <Link prefetch={false} href="/garage" className={`inline-flex items-center gap-1 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-semibold text-ink hover:border-soft ${className}`}>
      <span aria-hidden>★</span> Saved ({n})
    </Link>
  );
}
