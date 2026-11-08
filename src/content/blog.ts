// The blog. Each post is
// prose around live blocks drawn from the day's prices at build, so every
// number in a post is a real store price and the posts stay current without
// editing. Never repeat a category hub or a price guide as a post: a post asks
// one question the data answers (playbook: never a /rarity-style list).
import type { CatKey } from "@/site";
import { ADVICE_POSTS } from "./blog-advice";

export interface Post {
  slug: string;
  title: string;
  /** footer link text */
  short: string;
  description: string;
  /** The day the post goes live, YYYY-MM-DD: the real publication date, never
   *  a backdate. A future date holds the post back (no page, no link, not in
   *  the sitemap) until the first daily build on or after it, so posts come
   *  out a couple a week rather than all at once (DECISIONS.md, "Honest blog
   *  dates"). */
  date: string;
  /** The day the TEXT was last revised (not the live price tables, which
   *  change every day), shown as "Updated" when set. */
  updated?: string;
  /** Where the post's factual claims come from, listed at its foot. Posts
   *  built only from our own price data cite the daily import instead. */
  sources?: Source[];
  /** the drawing on its card and header */
  art: CatKey;
  /** The post's own thumbnail (public/blog/<slug>.jpg, 1200×630): its link preview and the picture on its card. Absent: the drawing and the site's share image. */
  image?: { src: string; alt: string };
  /** An advice post written as data: prose sections, each optionally followed
   *  by a live price table of the products its `picks` select (per region,
   *  most-stocked first, shown cheapest first). Posts without it have their
   *  own body in src/app/blog/[slug]/page.tsx. */
  sections?: Section[];
}

export interface Source {
  title: string;
  /** who published it: "American Academy of Dermatology" */
  by: string;
  url: string;
}

export interface Picks {
  /** table heading, "{region}" becomes "in Australia" etc. */
  title: string;
  /** a regular expression over the product name (case-insensitive) */
  match: string;
  cat?: CatKey;
  limit?: number;
}

export interface Section {
  h?: string;
  /** paragraphs; [text](/path) becomes a link */
  p: string[];
  picks?: Picks;
}

export const POSTS: Post[] = [
  // Car parts posts come once the first import has real prices.
];

/** Every post written, the advice posts after the launch posts, including
 *  those not out yet. Pages use LIVE_POSTS. */
export const ALL_POSTS: Post[] = [...POSTS, ...ADVICE_POSTS];

/** Out on the given day (UTC): the post's date has come. */
export function isLive(p: Post, today = new Date().toISOString().slice(0, 10)): boolean {
  return p.date <= today;
}

/** The posts out at this build, newest first. Each page is built once a day,
 *  so a scheduled post appears with the first build on its date. */
export const LIVE_POSTS: Post[] = ALL_POSTS.filter((p) => isLive(p)).sort((a, b) => b.date.localeCompare(a.date));

export const POST_BY_SLUG = Object.fromEntries(LIVE_POSTS.map((p) => [p.slug, p])) as Record<string, Post>;
