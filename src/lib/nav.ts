// Every place the site goes, grouped the way a parts buyer looks: the part category,
// the code on the old part, brands and guides, and the rest. The header mega menus
// (components/HeaderMenus.tsx, lg up; they replaced the side panel, Bill
// 2026-11-09) and the phone menu (components/MobileMenu.tsx) draw this list,
// so they never disagree. Static links to pages that exist.
// No data import here: the client menus import isActive from this file.
import { saleStrip } from "@/lib/black-friday";
import { POSTS } from "@/content/blog";
import { CAT_BY_KEY, PART_BUCKETS, STEP_MENU_ORDER, type CatKey } from "@/site";

export type NavItem = { href: string; label: string; count?: number; cat?: CatKey };
export type NavGroup = { title: string; links: NavItem[] };

/** A header menu link; `regions` = the markets it has products in (absent: every market), drawn with the engine's rp-XX classes. */
export type MenuLink = { href: string; label: string; regions?: string[] };
export type HeaderMenu = { label: string; all: { href: string; label: string }; columns: { title?: string; links: MenuLink[] }[] };

/** What the header menus list beyond the groups: each already filtered to products and tagged with the markets that have them. */
export interface MenuFacts {
  catRegions: Partial<Record<CatKey, string[]>>;
  brands: MenuLink[];
}

function saleLinks(): NavItem[] {
  const s = saleStrip(new Date().toISOString().slice(0, 10));
  return s ? [{ href: s.href, label: `${s.name} deals` }] : [];
}

export function navGroups(counts: Record<CatKey, number>, topBrands: { slug: string; name: string }[] = []): NavGroup[] {
  return [
    {
      title: "Shop by section",
      links: STEP_MENU_ORDER.map((k) => CAT_BY_KEY[k]).filter((c) => counts[c.key] > 0).sort((x, y) => counts[y.key] - counts[x.key]).map((c) => ({ href: `/${c.key}`, label: c.name, count: counts[c.key], cat: c.key })),
    },
    {
      // The way a buyer really searches: the code printed on the old part (Bill, 2026-11-09).
      title: "Find your part by its number",
      links: [
        { href: "/fit", label: "Shop by part code" },
        { href: "/car", label: "Parts that name a car" },
        { href: "/garage", label: "Saved parts" },
        { href: "/popular", label: "Popular" },
      ],
    },
    {
      title: "Save",
      links: [
        // Black Friday, then Cyber Monday, while the strip shows (lib/black-friday.ts saleStrip).
        ...saleLinks(),
        { href: "/deals", label: "Deals today" },
        { href: "/basket", label: "Basket compare" },
        { href: "/new", label: "New arrivals" },
        { href: "/guides", label: "Price guides" },
        ...(POSTS.length ? [{ href: "/blog", label: "Blog" }] : []),
      ],
    },
    {
      title: "Brands",
      links: [...topBrands.map((b) => ({ href: `/brands/${b.slug}`, label: b.name })), { href: "/brands", label: "All brands" }],
    },
    {
      title: "MotorCompare",
      links: [
        { href: "/stores", label: "Stores we compare" },
        { href: "/about", label: "How it works" },
        { href: "/disclosure", label: "How we make money" },
      ],
    },
  ];
}

/**
 * The header's mega menus (components/HeaderMenus.tsx, lg up). Parts and the other groups ARE the groups the phone menu draws;
 * brands are the longer list "All brands" links to. Australia only, so no link carries a market class; a category or brand with
 * no products is left out (regions: []).
 */
/** The first group (every section by stock) as the buckets a buyer thinks in: Servicing, Brakes & suspension, Performance, 4WD & touring, Care & workshop. Empty buckets are left out. */
export function bucketGroups(first: NavGroup | undefined): NavGroup[] {
  if (!first) return [];
  return PART_BUCKETS.map((b) => ({ title: b.title, links: b.cats.flatMap((c) => first.links.filter((l) => l.cat === c)) })).filter((g) => g.links.length);
}

/** The groups the menus draw: the sections split into buckets, the rest as they are. */
export function menuGroups(groups: NavGroup[]): NavGroup[] {
  return [...bucketGroups(groups[0]), ...groups.slice(1)];
}

export function headerMenus(groups: NavGroup[], f: MenuFacts): HeaderMenu[] {
  const live = (l: MenuLink) => !l.regions || l.regions.length > 0;
  const buckets = bucketGroups(groups[0]).map((g) => ({ title: g.title, links: g.links.map((l): MenuLink => ({ href: l.href, label: l.label, regions: l.cat ? f.catRegions[l.cat] : undefined })).filter(live) })).filter((c) => c.links.length);
  const group = (title: string) => groups.find((g) => g.title === title)?.links ?? [];
  return [
    { label: "Parts", all: { href: "/popular", label: "Popular right now" }, columns: [...buckets, { title: "Find your part by its number", links: group("Find your part").filter((l) => l.href !== "/popular") }] },
    { label: "Brands", all: { href: "/brands", label: "All brands" }, columns: [{ links: f.brands.filter(live) }] },
    { label: "Deals & more", all: { href: "/deals", label: "Deals today" }, columns: [{ title: "Save", links: group("Save") }, { title: "MotorCompare", links: group("MotorCompare") }] },
  ];
}

/**
 * The quick row under the header below lg (components/CategoryStrip.tsx): the sections as the first group lists them, this niche's
 * second way in, then Brands. A subset of the groups above, so the strip never names a place the menus do not.
 */
/** The phone strip shows the sections with the most products; the menu lists them all. */
const QUICK_SECTIONS = 10;

export function quickLinks(groups: NavGroup[]): NavItem[] {
  return [...(groups[0]?.links ?? []).slice(0, QUICK_SECTIONS).map(({ href, label }) => ({ href, label })), { href: "/fit", label: "Part code" }, { href: "/brands", label: "Brands" }];
}

/** The current page is this link, or inside it ("/men/page/2" is in Men's cologne). */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
