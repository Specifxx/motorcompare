"use client";
// My garage and watchlist (owner brief 2026-11-10): no account, kept in this browser only (localStorage). The car is the slug of
// a /car hub; a saved part remembers the lowest price when it was saved, so the garage can show the change since.
export interface Saved {
  slug: string;
  name: string;
  /** lowest orderable price when saved, cents; null when none then */
  price: number | null;
  at: string;
}

const CAR = "mc-garage-car";
const WATCH = "mc-garage-watch";

function read<T>(k: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
    window.dispatchEvent(new Event("mc-garage"));
  } catch {
    /* private window or blocked storage: the garage just does not remember */
  }
}

export const getCar = (): string => read<string>(CAR, "");
export const setCar = (slug: string) => write(CAR, slug);
export const getSaved = (): Saved[] => read<Saved[]>(WATCH, []);
export const isSaved = (slug: string) => getSaved().some((s) => s.slug === slug);
export function toggleSaved(item: Omit<Saved, "at">): boolean {
  const list = getSaved();
  const has = list.some((s) => s.slug === item.slug);
  write(WATCH, has ? list.filter((s) => s.slug !== item.slug) : [...list, { ...item, at: new Date().toISOString().slice(0, 10) }].slice(-60));
  return !has;
}
