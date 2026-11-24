import type { Metadata } from "next";
import { TrackedLink } from "@/components/TrackedLink";
import { CHURCH_EXTRA_HOUR, PAVILION_EXTRA_HOUR, formatUsd, peakRateTable, PUBLISHED_RATE_YEARS, type DayType } from "@/lib/pricing";

export const metadata: Metadata = { title: "Pricing" };

const DAYS: { key: DayType; label: string }[] = [
  { key: "sat", label: "Saturday" },
  { key: "fri", label: "Friday" },
  { key: "sun", label: "Sunday" },
  { key: "monThu", label: "Mon to Thu" },
];

const cell = (v: number | null | undefined) => (v ? formatUsd(v) : "Ask us");

export default function Pricing() {
  const years = PUBLISHED_RATE_YEARS.filter((y) => y >= 2027);
  return (
    <div className="wrap">
      <div className="page-head">
        <p className="eyebrow">Pricing</p>
        <h1>Clear prices, by day</h1>
        <p className="lede">All-day rates for May through September. Fridays and Sundays cost less than Saturdays and offer the same view.</p>
      </div>

      {years.map((year) => {
        const combo = peakRateTable(year, "combination");
        const pav = peakRateTable(year, "pavilion");
        return (
          <section key={year} className="section-tight section">
            <h2>{year} weddings, May to September</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Package</th>
                    {DAYS.map((d) => <th key={d.key} scope="col">{d.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hl">
                    <td>Church + Pavilion <span className="muted">(most popular)</span><br /><span className="muted">Church 4-hour block, Pavilion 9 am to 10 pm</span></td>
                    {DAYS.map((d) => <td key={d.key} className="num">{cell(combo?.[d.key])}</td>)}
                  </tr>
                  <tr>
                    <td>Pavilion only<br /><span className="muted">9 am to 10 pm</span></td>
                    {DAYS.map((d) => <td key={d.key} className="num">{cell(pav?.[d.key])}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <section className="section-tight section">
        <div className="grid-2">
          <div className="panel">
            <h3>October to April</h3>
            <p className="muted">Seasonal packages with lower rates. We&apos;ll share them on your tour.</p>
          </div>
          <div className="panel">
            <h3>Church only</h3>
            <p className="muted">
              Hourly with a 3-hour minimum, year-round. Extra hours {CHURCH_EXTRA_HOUR[2027] ? `${formatUsd(CHURCH_EXTRA_HOUR[2027])} each in 2027` : "available"}.
            </p>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 16 }}>
          Extra Pavilion hours are about {formatUsd(PAVILION_EXTRA_HOUR.amount)} each. A signed agreement and a 50% retainer secure your date.
        </p>
        <TrackedLink href="/check-your-date" location="pricing_page" className="btn btn-primary">Check your date</TrackedLink>
      </section>
    </div>
  );
}
