import type { Metadata } from "next";
import { DateChecker } from "@/components/DateChecker";
import { isPackageId } from "@/lib/venue";

export const metadata: Metadata = { title: "Check your date" };

export default async function CheckYourDate({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const pkg = isPackageId(sp.package) ? sp.package : "combination";
  return (
    <div className="wrap">
      <div className="page-head">
        <p className="eyebrow">Live availability</p>
        <h1>Check your date</h1>
        <p className="lede">See whether your day is open and what it costs. If it&apos;s taken, we&apos;ll show you the closest open dates.</p>
      </div>
      <DateChecker location="check_page" initialPackage={pkg} />
    </div>
  );
}
