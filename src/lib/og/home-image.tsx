import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { REGION_BY_CODE, type RegionCode } from "@/site";
import { money, niceDate } from "@/lib/format";
import { storeName } from "@/lib/data";
import type { HeroPick } from "@/lib/hero-picks";

// The homepage's link preview (owner, 2026-11-05: "same with the link
// thumbnail"): the brand line beside the two products the hero shows, each
// with its photo, cheapest price and store count. Drawn ONCE at the day's
// build like every page (a static route with no params is prerendered), never
// per request. The photos are read at build by the route, which hands them in
// as data URIs or nulls; with no products, or no photo, the card falls back to
// the text-only brand card, never a broken image.
export const HOME_IMAGE_SIZE = { width: 1200, height: 630 };

const INK = "#181f29";
const SOFT = "#5c6876";
const LINE = "#dee3e9";
const ACCENT = "#d6520e";

const font = (f: string) => fs.readFileSync(path.join(process.cwd(), "src/lib/og/fonts", f));
const ICON =
  "data:image/svg+xml;base64," +
  Buffer.from(fs.readFileSync(path.join(process.cwd(), "src/app/icon.svg"))).toString("base64");

/** The size moves to its own line, so a long name loses words, never its size. */
export const shortName = (name: string, brand: string) => {
  const n = brand && name.startsWith(brand) ? name.slice(brand.length).trim() : name;
  return n.replace(/\s*\(?\d+(\.\d+)?\s*(ml|g|oz|fl\.? ?oz|ea|pcs|sheets?|pads?)\b.*$/i, "").trim() || n;
};

export interface HomeImageOpts {
  region: RegionCode;
  /** the hero's picks, each with its photo as a data URI (null: no photo could be read) */
  picks: { pick: HeroPick; photo: string | null }[];
  asOf: string | null;
  /** "KaeYoung" */
  brand: string;
  /** "Stay young." */
  line1: string;
  /** "Pay less." */
  line2: string;
  /** "Korean skincare prices from real K-beauty stores, side by side." */
  blurb: string;
  domain: string;
}

export function homeImage(o: HomeImageOpts) {
  const r = REGION_BY_CODE[o.region];
  const picks = o.picks.filter((p) => p.photo);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "44px 60px 34px",
          color: INK,
          fontFamily: "Inter",
          backgroundColor: "#f5f7f9",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, #fde6d6 0%, rgba(245,247,249,0) 45%), radial-gradient(circle at 100% 0%, #e3e8ee 0%, rgba(245,247,249,0) 40%), radial-gradient(circle at 60% 100%, #e8edf2 0%, rgba(245,247,249,0) 50%)",
        }}
      >
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 12, backgroundColor: ACCENT }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, paddingRight: picks.length ? 36 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={ICON} width={48} height={48} />
            <div style={{ display: "flex", fontFamily: "Barlow", fontWeight: 800, fontSize: 46, letterSpacing: 1, textTransform: "uppercase" }}>{o.brand}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: picks.length ? 54 : 70, fontFamily: "Barlow", fontWeight: 800, fontSize: picks.length ? 72 : 140, lineHeight: 0.95, textTransform: "uppercase" }}>
            <div style={{ display: "flex" }}>{o.line1}</div>
            <div style={{ display: "flex", color: ACCENT }}>{o.line2}</div>
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: picks.length ? 22 : 30, lineHeight: 1.35, color: SOFT, maxWidth: picks.length ? 480 : 900 }}>{o.blurb}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 6 }}>
            <div style={{ display: "flex", fontSize: 16, color: SOFT, letterSpacing: 2.5, textTransform: "uppercase" }}>
              {picks.length ? `Popular ${r.phrase}${o.asOf ? ` · ${niceDate(o.asOf)}` : ""}` : "parts stores · prices updated daily"}
            </div>
            <div style={{ display: "flex", fontSize: 18, fontWeight: 700 }}>{o.domain}</div>
          </div>
        </div>
        {picks.length > 0 && (
          <div style={{ display: "flex", gap: 22, alignItems: "stretch" }}>
            {picks.map(({ pick, photo }) => (
              <div key={pick.f.ean} style={{ display: "flex", flexDirection: "column", width: 268, backgroundColor: "#ffffff", border: `2px solid ${LINE}`, borderRadius: 24, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, padding: 22, backgroundImage: "linear-gradient(180deg, #ffffff, #eef1f5)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img src={photo!} width={224} height={256} style={{ objectFit: "contain" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "16px 20px 18px", borderTop: `2px solid ${LINE}` }}>
                  <div style={{ display: "flex", fontSize: 14, letterSpacing: 2, color: SOFT, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pick.f.size && !/^1 [a-z]+$/i.test(pick.f.size) ? `${pick.f.brand} · ${pick.f.size}` : pick.f.brand}</div>
                  <div style={{ display: "flex", marginTop: 4, fontSize: 21, fontWeight: 700, lineHeight: 1.2, maxHeight: 52, overflow: "hidden" }}>{shortName(pick.f.name, pick.f.brand)}</div>
                  <div style={{ display: "flex", alignItems: "baseline", marginTop: "auto", paddingTop: 10, gap: 10, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", fontSize: 27, fontWeight: 700, color: ACCENT }}>{money(pick.lo, o.region)}</div>
                    <div style={{ display: "flex", fontSize: 16, color: SOFT }}>{`${pick.stores} stores`}</div>
                  </div>
                  <div style={{ display: "flex", fontSize: 15, color: SOFT, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden" }}>{`cheapest at ${storeName(pick.loStore)}`}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    {
      ...HOME_IMAGE_SIZE,
      fonts: [
        { name: "Barlow", data: font("barlow-condensed-latin-800-normal.woff"), weight: 800, style: "normal" },
        { name: "Inter", data: font("inter-latin-500-normal.woff"), weight: 500, style: "normal" },
        { name: "Inter", data: font("inter-latin-700-normal.woff"), weight: 700, style: "normal" },
      ],
    },
  );
}

/**
 * A product photo as a data URI for the card, read once at build. Anything but
 * a small raster image in a few seconds is null, and the card leaves that
 * product out: a store's photo that is gone must never break the build.
 */
export async function photoDataUri(url: string | null, timeoutMs = 8000): Promise<string | null> {
  if (!url || !/^https:\/\//.test(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { accept: "image/*" } });
    const type = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (!res.ok || !/^image\/(png|jpeg|webp|gif)$/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length || buf.length > 4_000_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
