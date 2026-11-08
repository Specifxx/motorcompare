// The mark (owner, 2026-11-08: option B of the four in docs/icon-options): a price tag with a spanner, signal
// orange on workshop dark. Same as src/app/icon.svg.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#1d2430" />
      <path d="M33 12h17a2 2 0 0 1 2 2v17L30 53a3 3 0 0 1-4 0L11 38a3 3 0 0 1 0-4z" fill="#d6520e" />
      <circle cx="44" cy="20" r="3.5" fill="#1d2430" />
      <path d="M36.5 27.5a7 7 0 0 0-9.4 8.7L20 43.3l3.7 3.7 7.1-7.1a7 7 0 0 0 8.7-9.4l-4 4-3.3-.9-.9-3.3z" fill="#fff" />
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
