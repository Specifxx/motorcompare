import type { Metadata } from "next";
import { SITE } from "@/site";
import { STORES } from "@/content/stores";
import { PageHead } from "@/components/Section";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "About MotorCompare and how matching works",
  description: "How MotorCompare compares prices: matching by the maker's part number, real parts stores only, daily price checks, and how the site is paid for.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <PageHead title="About MotorCompare" sub="An independent price guide for car parts in Australia. The right part, the best price." />
      <Prose>
        <p>
          MotorCompare checks {STORES.length} Australian parts, battery, oil, lighting and car care stores every day and shows every store&apos;s price for the same part, side by side, in Australian dollars.
        </p>
        <h2>How a part is matched</h2>
        <p>
          Every part has its maker&apos;s own part number (Ryco Z386, NGK BKR6E, Century NS70ZZ), and most parts shops list it. We match store listings <strong>only</strong> by the brand plus that exact number, or by the barcode on the box when a shop lists one. A listing without one is left out rather than guessed from its title, because a 1 L and a 5 L, a 600 mm and a 650 mm blade, or two batteries one letter apart all look alike in a title. A wrong part is worse than a missing price.
        </p>
        <p>Used, reconditioned and damaged stock, exchange and core charges, and store-made bundles are left out too. A part gets a page once at least two stores sell it: comparing one shop is not a comparison.</p>
        <h2>Will it fit my car?</h2>
        <p>
          We start with parts whose fit is a code you can read yourself: the oil grade in your owner&apos;s manual, the size printed on top of your battery (N70ZZ, DIN55), the length of your old wiper blades, the code on your old globe (H4, H7) and the number on your old filter (Z386). Each product page shows that code. Always check it against the part you are replacing. Brakes and other make-and-model parts are listed, but check the store&apos;s fitment list before you buy.
        </p>
        <h2>Which stores</h2>
        <p>
          Australian stores that sell new parts online. No open marketplaces in the store list. eBay and Amazon appear above the store prices as rows labelled as ads, and Supercheap Auto, Repco and Sparesbox, whose prices we can&apos;t read yet, appear as labelled search links. None of them is ever counted as a store or as &quot;the cheapest&quot;.
        </p>
        <h2>Prices and currencies</h2>
        <p>
          Prices are in Australian dollars, exactly as the store lists them. Stores are sorted by the item price. Beside each store we show what delivery cost in that store&apos;s own quote for a small
          order to one Australian city, and from what order total it became free, checked once a week; your address can change it. To compare several products with delivery, use the <a href="/basket">basket</a>.
        </p>
        <h2>How fresh and how accurate</h2>
        <p>
          A program reads every store&apos;s own product feed once a day and the date of the last check is shown at the foot of every page. Between checks a store can change a price, run a sale or sell out, so the price at the store&apos;s
          checkout is always the one that counts. We would rather leave a listing out than show a wrong one: anything we can&apos;t match by part number or barcode is dropped, and when three or more stores sell a product, a price far below or above the others
          is dropped as a likely mistake. When you find an error, email us and we fix it, usually the same day.
        </p>
        <h2>How the site is paid for</h2>
        <p>
          MotorCompare is free and has no ads beside the prices. It is paid for by affiliate links: if you buy after clicking eBay or Amazon (and, once its program accepts us, Supercheap Auto), we may earn a commission at no cost to you.
          Today none of the stores in the comparison pays us anything. Commission never changes the order: stores are always sorted by price. The details are in <a href="/disclosure">how we make money</a>. No sign-up, no accounts, no pop-ups.
        </p>
        <h2>Spotted a mistake? Want a store added?</h2>
        <p>
          Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </Prose>
    </div>
  );
}
