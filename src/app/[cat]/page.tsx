import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, CAT_BY_KEY, type CatKey } from "@/site";
import { CatHub } from "@/components/CatHub";
import { CAT_SEO, fitDescription, fitTitle } from "@/lib/seo";
import { catCounts } from "@/lib/data";
import { CAT_MIN_INDEXED } from "@/lib/index-tiers";

export const dynamicParams = false;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ cat: c.key }));

export function generateMetadata({ params }: { params: { cat: string } }): Metadata {
  const c = CAT_BY_KEY[params.cat as CatKey];
  if (!c) return {};
  return {
    title: fitTitle(`${CAT_SEO[c.key]}: compare every store`, `${CAT_SEO[c.key]} compared`, CAT_SEO[c.key]),
    description: fitDescription(
      `Compare ${c.plural} prices across Australian parts stores. Matched by part number, size by size, updated daily.`,
      `Compare ${c.plural} prices across Australian parts stores. Matched by part number, updated daily.`,
      `${c.name} prices compared across Australian parts stores. Matched by part number, updated daily.`,
    ),
    alternates: { canonical: `/${c.key}` },
    // A hub with almost nothing on it is thin: it stays reachable, but asks not to be indexed (DECISIONS.md 2026-11-10).
    ...(catCounts()[c.key] < CAT_MIN_INDEXED ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function CatPage({ params }: { params: { cat: string } }) {
  if (!CAT_BY_KEY[params.cat as CatKey]) notFound();
  return <CatHub cat={params.cat as CatKey} page={1} />;
}
