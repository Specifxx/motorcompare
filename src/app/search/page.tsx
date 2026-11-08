import type { Metadata } from "next";
import { PageHead } from "@/components/Section";
import { Browse } from "@/components/Browse";

export const metadata: Metadata = {
  title: "Search car parts",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function Search() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-40">
      <PageHead title="Search car parts" sub="Type a brand, a part, a code like N70ZZ, 5W-30 or H7, or a maker's part number like Z386 or BKR6E, then narrow it down by type, brand, rating and price." />
      <Browse search />
    </div>
  );
}
