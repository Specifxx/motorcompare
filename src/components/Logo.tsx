// The mark (2026-11-08, option A of four in docs/icon-options until the owner picks): a
// gauge whose needle sits low, on signal orange. Same as src/app/icon.svg.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#d6520e" />
      <path d="M14 42a18 18 0 1 1 36 0" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M19 30l3 2M32 24v4M45 30l-3 2" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 42L20.5 33.5" stroke="#1d2430" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="42" r="5" fill="#1d2430" />
    </svg>
  );
}

/** `wordmark` sets when the name shows: the header hides it on the narrowest phones, where the region, theme and
 *  menu buttons need the row (owner, 2026-11-06: header overflow); the link keeps its aria-label. */
export function Logo({ wordmark = "flex" }: { wordmark?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className={`${wordmark} flex-col leading-none`}>
        <span className="font-display text-[24px] font-bold tracking-tight text-ink">MotorCompare</span>
        <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.2em] text-soft sm:block">The right part. The best price.</span>
      </span>
    </span>
  );
}
