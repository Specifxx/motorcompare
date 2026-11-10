// MotorCompare's drawings: flat, generic car parts (an oil bottle, a battery,
// a wiper blade, a globe, a filter…), drawn in SVG so they cost nothing to
// load. No maker's own packaging is drawn: these are generic shapes.
import type { CatKey } from "@/site";

/** Each category's tile colour (globals.css .tint-*). */
export const CAT_TINT: Record<CatKey, string> = {
  oil: "tint-butter",
  batteries: "tint-rose",
  wipers: "tint-sky",
  globes: "tint-butter",
  filters: "tint-mint",
  plugs: "tint-lavender",
  brakes: "tint-peach",
  fluids: "tint-sky",
  care: "tint-mint",
  accessories: "tint-lavender",
  turbo: "tint-rose",
  engine: "tint-lavender",
  exhaust: "tint-sky",
  cooling: "tint-mint",
  driveline: "tint-butter",
  suspension: "tint-peach",
  electrics: "tint-butter",
  tools: "tint-sky",
  other: "tint-peach",
};

const INK = "#1d2430";
const ORANGE = "#e2570f";
const AMBER = "#f2b233";
const STEEL = "#9aa6b4";
const BLUE = "#4a7bd0";
const GREEN = "#2f9e63";
const WHITE = "#fbfcfd";

const S = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** A small drawing for a category, 48×48. */
export function CatIcon({ cat, size = 40 }: { cat: CatKey; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      {ICONS[cat]}
    </svg>
  );
}

const ICONS: Record<CatKey, React.ReactNode> = {
  // a 5 L oil bottle with a handle and a label
  oil: (
    <g {...S}>
      <rect x="25" y="5" width="7" height="5" rx="1" fill={INK} />
      <path d="M12 16q0-6 6-6h14q6 0 6 6v24q0 3-3 3H15q-3 0-3-3z" fill={AMBER} />
      <path d="M14 12q-4 4-2 10" fill="none" />
      <rect x="16" y="22" width="18" height="12" rx="1.5" fill={WHITE} />
      <path d="M20 28h10" />
    </g>
  ),
  // a car battery with two terminals
  batteries: (
    <g {...S}>
      <rect x="12" y="10" width="6" height="5" rx="1" fill={STEEL} />
      <rect x="30" y="10" width="6" height="5" rx="1" fill={STEEL} />
      <rect x="6" y="15" width="36" height="26" rx="3" fill={INK} />
      <path d="M13 23h4M15 21v4M31 23h4" stroke={WHITE} strokeWidth="2" />
      <path d="M22 26l-3 7h4l-2 6 6-9h-4l2-4z" fill={AMBER} stroke={AMBER} />
    </g>
  ),
  // a wiper blade across a windscreen arc
  wipers: (
    <g {...S}>
      <path d="M5 38q19-26 38 0" fill="none" stroke={STEEL} strokeWidth="2" />
      <path d="M24 40L9 14" strokeWidth="3" />
      <path d="M9 14l3-2 14 25-3 2z" fill={INK} />
      <circle cx="24" cy="40" r="3" fill={ORANGE} />
    </g>
  ),
  // a headlight globe with an H4-style base
  globes: (
    <g {...S}>
      <path d="M24 5q10 0 10 11 0 6-4 10v4H18v-4q-4-4-4-10 0-11 10-11z" fill={AMBER} />
      <rect x="17" y="30" width="14" height="6" rx="1" fill={STEEL} />
      <path d="M19 36h10v4H19z" fill={INK} />
      <path d="M21 41v4M27 41v4" />
      <path d="M20 14q4-4 8 0" fill="none" stroke={WHITE} strokeWidth="2" />
    </g>
  ),
  // a spin-on oil filter
  filters: (
    <g {...S}>
      <rect x="11" y="9" width="26" height="32" rx="4" fill={BLUE} />
      <path d="M11 16h26M11 34h26" />
      <rect x="15" y="20" width="18" height="10" rx="1.5" fill={WHITE} />
      <rect x="17" y="5" width="14" height="4" rx="1" fill={STEEL} />
    </g>
  ),
  // a spark plug
  plugs: (
    <g {...S}>
      <rect x="21" y="3" width="6" height="8" rx="1" fill={STEEL} />
      <path d="M19 11h10l-1 14h-8z" fill={WHITE} />
      <rect x="17" y="25" width="14" height="6" fill={STEEL} />
      <path d="M20 31h8v8h-8z" fill={STEEL} />
      <path d="M21 33h6M21 36h6" />
      <path d="M24 39v4h5" fill="none" />
    </g>
  ),
  // a brake disc with a caliper
  brakes: (
    <g {...S}>
      <circle cx="22" cy="26" r="17" fill={STEEL} />
      <circle cx="22" cy="26" r="7" fill={WHITE} />
      <circle cx="22" cy="26" r="2.5" fill={INK} />
      <path d="M33 10q9 6 9 16-1 4-4 4l-6-2q2-8-3-14z" fill={ORANGE} />
    </g>
  ),
  // a coolant jug
  fluids: (
    <g {...S}>
      <rect x="17" y="5" width="9" height="5" rx="1" fill={INK} />
      <path d="M12 14q0-4 4-4h12q8 0 8 8v22q0 3-3 3H15q-3 0-3-3z" fill={GREEN} />
      <path d="M30 14q4 0 4 6" fill="none" stroke={WHITE} />
      <path d="M17 26q5-6 10 0-5 6-10 0z" fill={WHITE} />
    </g>
  ),
  // a spray bottle and a bubble
  care: (
    <g {...S}>
      <path d="M18 6h10v6h-10z" fill={INK} />
      <path d="M28 8h6l2 3" fill="none" />
      <path d="M15 18q0-6 6-6h4q6 0 6 6v22q0 3-3 3H18q-3 0-3-3z" fill={BLUE} />
      <rect x="18" y="24" width="10" height="9" rx="1.5" fill={WHITE} />
      <circle cx="40" cy="20" r="3" fill={WHITE} />
      <circle cx="38" cy="28" r="2" fill={WHITE} />
    </g>
  ),
  // a jump starter with clamps
  accessories: (
    <g {...S}>
      <rect x="10" y="12" width="22" height="28" rx="4" fill={INK} />
      <rect x="14" y="17" width="14" height="8" rx="1.5" fill={AMBER} />
      <circle cx="21" cy="32" r="3" fill={WHITE} />
      <path d="M32 18q8 0 8 8v6" fill="none" stroke={ORANGE} strokeWidth="2" />
      <path d="M37 32h6l-1 6h-4z" fill={ORANGE} />
    </g>
  ),
  // a spanner
  // a turbo snail housing with a compressor wheel
  turbo: (
    <g {...S}>
      <path d="M8 26a16 16 0 1 1 16 16h-6" fill={STEEL} />
      <circle cx="22" cy="26" r="7" fill={INK} />
      <path d="M22 19v14M15 26h14" stroke={WHITE} />
      <path d="M32 40h10v-4" fill="none" stroke={ORANGE} strokeWidth="2" />
    </g>
  ),
  // an ECU box with connector pins
  engine: (
    <g {...S}>
      <rect x="8" y="14" width="32" height="22" rx="3" fill={INK} />
      <path d="M13 20h12M13 25h8" stroke={AMBER} strokeWidth="2" />
      <path d="M14 36v5M20 36v5M26 36v5M32 36v5" stroke={STEEL} strokeWidth="2" />
      <circle cx="33" cy="22" r="2.5" fill={ORANGE} />
    </g>
  ),
  // a muffler with a tail pipe
  exhaust: (
    <g {...S}>
      <rect x="10" y="16" width="24" height="16" rx="8" fill={STEEL} />
      <path d="M34 24h10M3 24h7" strokeWidth="3" fill="none" />
      <path d="M17 20v8M23 20v8M29 20v8" stroke={INK} />
    </g>
  ),
  // a radiator core with a cap
  cooling: (
    <g {...S}>
      <rect x="8" y="14" width="32" height="26" rx="2" fill={BLUE} />
      <path d="M14 18v18M20 18v18M26 18v18M32 18v18" stroke={WHITE} />
      <rect x="20" y="8" width="8" height="6" rx="1" fill={INK} />
    </g>
  ),
  // a clutch disc
  driveline: (
    <g {...S}>
      <circle cx="24" cy="24" r="17" fill={STEEL} />
      <circle cx="24" cy="24" r="9" fill={AMBER} />
      <circle cx="24" cy="24" r="3" fill={INK} />
      <path d="M24 7v6M24 35v6M7 24h6M35 24h6" />
    </g>
  ),
  // a coil spring on a shock
  suspension: (
    <g {...S}>
      <path d="M24 5v38" strokeWidth="3" />
      <path d="M16 12l16 4-16 4 16 4-16 4 16 4-16 4" fill="none" stroke={ORANGE} strokeWidth="2.5" />
      <rect x="19" y="3" width="10" height="4" rx="1" fill={INK} />
    </g>
  ),
  // a blade fuse
  electrics: (
    <g {...S}>
      <path d="M12 8h24l2 10v22H10V18z" fill={AMBER} />
      <path d="M17 18v14l7-4 7 4V18" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M17 8V4M31 8V4" />
    </g>
  ),
  // a spanner
  tools: (
    <g {...S}>
      <path d="M32 6a8 8 0 0 0-8 10L8 32a4 4 0 0 0 8 8l16-16a8 8 0 0 0 10-8l-5 5-5-1-1-5 5-5a8 8 0 0 0-6-1z" fill={STEEL} />
      <circle cx="12" cy="36" r="1.5" fill={INK} />
    </g>
  ),
  other: (
    <g {...S}>
      <path d="M33 6a9 9 0 0 0-8 12L8 35a4 4 0 1 0 5 5l17-17a9 9 0 0 0 12-8l-5 3-5-2-1-5z" fill={STEEL} />
    </g>
  ),
};

/** The hero drawing: a workshop shelf of generic car parts. */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 340" className={className} aria-hidden role="presentation">
      <circle cx="215" cy="170" r="150" fill="#eef1f5" />
      <circle cx="330" cy="90" r="56" fill="#fde9dc" />
      {/* shelf */}
      <rect x="45" y="270" width="330" height="12" rx="6" fill="#c3cbd6" />
      <g {...S} strokeWidth="2.2">
        {/* 5 L oil bottle */}
        <rect x="118" y="88" width="22" height="16" rx="3" fill={INK} />
        <path d="M70 128q0-24 24-24h48q24 0 24 24v134q0 8-8 8H78q-8 0-8-8z" fill={AMBER} />
        <path d="M80 112q-14 14-8 36" fill="none" strokeWidth="6" stroke={INK} />
        <rect x="88" y="160" width="62" height="58" rx="5" fill={WHITE} />
        <path d="M98 180h42M98 196h30" />
        {/* car battery */}
        <rect x="200" y="166" width="20" height="14" rx="3" fill={STEEL} />
        <rect x="286" y="166" width="20" height="14" rx="3" fill={STEEL} />
        <rect x="186" y="180" width="134" height="90" rx="8" fill={INK} />
        <path d="M204 204h16M212 196v16M286 204h16" stroke={WHITE} strokeWidth="5" />
        <path d="M258 206l-14 30h18l-8 26 26-38h-18l8-18z" fill={AMBER} stroke={AMBER} />
        {/* globe on top of the battery */}
        <path d="M268 74q24 0 24 26 0 14-10 24v10h-28v-10q-10-10-10-24 0-26 24-26z" fill="#ffe9a8" />
        <rect x="252" y="134" width="32" height="12" rx="2" fill={STEEL} />
        <rect x="256" y="146" width="24" height="10" fill={INK} />
        {/* wiper blade leaning */}
        <g transform="rotate(-24 360 200)">
          <rect x="354" y="80" width="12" height="190" rx="4" fill={INK} />
          <rect x="350" y="90" width="4" height="170" fill={STEEL} />
        </g>
      </g>
      <g fill={ORANGE}>
        <circle cx="58" cy="92" r="6" />
        <circle cx="388" cy="48" r="4" />
      </g>
    </svg>
  );
}
