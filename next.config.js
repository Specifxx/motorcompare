/** @type {import('next').NextConfig} */
// Cost notes (DECISIONS.md "A fully static site"): every page is prerendered at
// the day's one [deploy] build from the committed data/, so a visit is a CDN
// file, never a function. The only function is eBay's account-deletion hook.
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Store photos are hotlinked from the stores' CDNs at the size we ask for;
  // Vercel image optimisation is billed per source image, so it stays off.
  images: { unoptimized: true },
  // Product pages and quick-view files outside the prebuilt top 500 render on their
  // first request (DECISIONS.md 2026-11-06), so those functions must carry the data
  // they read: data.ts and ratings.ts read data/public, PriceTable data/amazon-live.
  // Without it data.ts's loader falls back to empty and every such page is a 404.
  experimental: {
    outputFileTracingIncludes: {
      "/product/[slug]": ["./data/public/**", "./data/amazon-live/**"],
      "/q/[slug]": ["./data/public/**", "./data/amazon-live/**"],
    },
  },
  // The full launch (owner, 2026-11-10): the old vercel.app host sends everyone to the real domain, and the creators
  // page (a fragrance-site leftover with no MotorCompare creators yet) is gone from the nav, the sitemap and the web.
  // A product Google is not asked to index is linked as /p/<slug> (lib/index-tiers.ts productPath): the same page,
  // and robots.txt keeps crawlers out, so ~33,000 noindex pages stop being rendered and written after each release
  // (Vercel cost, 2026-11-14: ISR writes were the team's largest line).
  async rewrites() {
    return [{ source: "/p/:slug", destination: "/product/:slug" }];
  },
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host", value: "motorcompare.vercel.app" }], destination: "https://motorcompare.app/:path*", permanent: true },
      { source: "/creators", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // The quick view's JSON (one per product) is data for the pop-up, never a page to rank: robots.txt cannot hold it
      // back (no query to match), so the header does. The product page is the one URL for each product.
      { source: "/q/:slug*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};
