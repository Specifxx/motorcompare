import type { Metadata } from "next";
import { REGIONS, SITE } from "@/site";
import { STORES } from "@/content/stores";
import { PageHead } from "@/components/Section";
import { Prose } from "@/components/Prose";
import { ListYourStore } from "@/components/ListYourStore";

// The store-owner page every site in the family shares (owner, 2026-11-04).
export const metadata: Metadata = {
  title: "List your parts store, free",
  description: "Run a store that sells car parts? Get it listed on MotorCompare's price comparison for free: shoppers comparing prices go straight to your product pages.",
  alternates: { canonical: "/list-your-store" },
};

export default function Page() {
  const names = REGIONS.map((r) => r.name);
  const markets = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return (
    <div className="mx-auto max-w-3xl px-4">
      <PageHead title="List your store on MotorCompare" />
      <Prose>
        <ListYourStore
          showTitle={false}
          site="MotorCompare"
          what="car parts"
          markets={markets}
          storeCount={STORES.length}
          regions={REGIONS.map((r) => [r.code, r.name])}
          email={SITE.email}
          platforms="Shopify and WooCommerce"
          pricesRule="with three or more stores selling a product, a price under 40% of their median is dropped as a likely mistake"
          suggestHref="/stores#suggest"
          buttonClassName="btn-pop btn-buy px-6 py-2 text-sm"
        >
          <li><strong>The maker&apos;s part number (or barcode) on each variant.</strong> We match products only by brand plus the maker&apos;s own part number in the SKU, or by the EAN barcode, never by title, so a variant without one is left out.</li>
        </ListYourStore>
      </Prose>
    </div>
  );
}
