// The niche's own filters on the browse bar (components/Browse.tsx), beside brand and rating: the dimensions a buyer in this space
// narrows by (Bill, 2026-11-09). Each reads only the product's NAME, which the browser already holds in /search-index.json, so a
// filter never reaches a function and nothing here is guessed: a name that does not say, has no value. Client-safe, pure.
import { partCode } from "@/lib/title";
import type { CatKey } from "@/site";

export interface Facet {
  key: string;
  /** the select's accessible name */
  label: string;
  /** its first option: "Any size" */
  any: string;
  /** shown before the index has loaded, so the control is never empty */
  values?: string[];
  /** options in this order (else most products first) */
  order?: string[];
  /** at most this many options (default 40) */
  max?: number;
  of(name: string, cat: string): string[];
}


export const FACETS: Facet[] = [
  // The code printed on the old part (oil grade, battery size, globe code, wiper length): what a buyer matches by (/fit).
  { key: "fit", label: "Part code", any: "Any part code", max: 60, of: (n, cat) => [partCode(n, cat as CatKey)].filter((x): x is string => !!x) },
];
