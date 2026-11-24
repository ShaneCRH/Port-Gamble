import type { Metadata } from "next";
import { TourBooker } from "@/components/TourBooker";
import { isIsoDate } from "@/lib/dates";
import { isPackageId } from "@/lib/venue";

export const metadata: Metadata = { title: "Book a tour" };

export default async function BookATour({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const date = typeof sp.date === "string" && isIsoDate(sp.date) ? sp.date : undefined;
  const pkg = isPackageId(sp.package) ? sp.package : undefined;
  return (
    <div className="wrap">
      <div className="page-head">
        <p className="eyebrow">About an hour, on site</p>
        <h1>Book a tour</h1>
        <p className="lede">Pick a time that suits you. We&apos;ll walk St. Paul&apos;s, the Pavilion and the bluff, and bring the calendar.</p>
      </div>
      <div className="panel">
        <TourBooker weddingDate={date} initialPackage={pkg} />
      </div>
    </div>
  );
}
