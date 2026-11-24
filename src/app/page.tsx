import { DateChecker } from "@/components/DateChecker";
import { TrackedLink } from "@/components/TrackedLink";
import { VenueCards } from "@/components/VenueCards";
import { formatUsd, peakRateTable } from "@/lib/pricing";

export default function Home() {
  const combo = peakRateTable(2027, "combination");
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">Port Gamble, Washington</p>
          <h1>Say it in an 1879 church. Celebrate over Hood Canal.</h1>
          <p className="lede">A historic waterfront village an hour from Seattle. Check your date, see the price, and book a tour in under a minute.</p>
          <DateChecker location="home_hero" />
        </div>
        <span className="photo-note">Hero photo or video goes here</span>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="eyebrow">How it works</p>
          <h2>From first look to booked</h2>
          <ol className="steps">
            <li><h3>Check your date</h3><p className="muted">Live availability and the price for that day.</p></li>
            <li><h3>Tour in person</h3><p className="muted">Pick a time online. Walk the church and the bluff with us.</p></li>
            <li><h3>Hold your date</h3><p className="muted">We hold it while you decide.</p></li>
            <li><h3>Book it</h3><p className="muted">Sign the agreement and pay the 50% retainer.</p></li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="eyebrow">Two venues, one village</p>
          <h2>The church and the Pavilion</h2>
          <VenueCards />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="callout">
            <div>
              <h2>Fridays and Sundays: same view, lower price</h2>
              <p>
                Summer Saturdays book up a year ahead. A 2027 Friday or Sunday with the church and Pavilion is
                {combo?.fri ? ` ${formatUsd(combo.fri)}` : " less"}
                {combo?.sat ? `, against ${formatUsd(combo.sat)} on a Saturday` : ""}. October to April is quieter still.
              </p>
            </div>
            <TrackedLink href="/pricing" location="home_value_callout" className="btn btn-primary">
              See all pricing
            </TrackedLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap panel">
          <h2>Couples who tour, book.</h2>
          <p className="muted">Photos never quite do it justice. Come walk it with us; tours take about an hour.</p>
          <TrackedLink href="/book-a-tour" location="home_tour_panel" className="btn btn-primary btn-lg">
            Book a tour
          </TrackedLink>
        </div>
      </section>
    </>
  );
}
