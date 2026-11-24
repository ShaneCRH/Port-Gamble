import { DateChecker } from "@/components/DateChecker";
import { TrackedLink } from "@/components/TrackedLink";
import { VenueCards } from "@/components/VenueCards";
import { formatUsd, peakRateTable } from "@/lib/pricing";

export default function Home() {
  const combo = peakRateTable(2027, "combination");
  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          <img src="/images/hero-placeholder.svg" alt="" />
        </div>
        <div className="wrap hero-inner">
          <p className="eyebrow">Port Gamble &middot; Hood Canal &middot; Washington</p>
          <h1>
            Say it in an 1879 church.
            <em> Celebrate over Hood Canal.</em>
          </h1>
          <p className="lede">A historic waterfront village, an hour from Seattle.</p>
          <DateChecker location="home_hero" />
        </div>
        <span className="photo-note">Illustration. Hero photo or film to come.</span>
      </section>

      <section className="intro">
        <div className="wrap narrow">
          <span className="ornament" aria-hidden="true" />
          <p className="intro-text">
            A white steeple among the firs, a lawn that runs to the water, and the Olympics turning gold at dusk.
            Port Gamble has been a village since 1853, and it still feels like one.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="section-head">
            <p className="eyebrow">Two venues, one village</p>
            <h2>The church and the Pavilion</h2>
          </header>
          <VenueCards />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>From first look to booked</h2>
          </header>
          <ol className="steps">
            <li><h3>Check your date</h3><p>Live availability and the price for that day.</p></li>
            <li><h3>Tour in person</h3><p>Pick a time online, then walk the church and the bluff with us.</p></li>
            <li><h3>Hold your date</h3><p>We hold it while you decide.</p></li>
            <li><h3>Book it</h3><p>Sign the agreement and pay the 50% retainer.</p></li>
          </ol>
        </div>
      </section>

      <section className="band">
        <div className="wrap narrow">
          <p className="eyebrow">A quieter kind of value</p>
          <h2>Fridays and Sundays: <em>the same view, a lower price</em></h2>
          <p>
            Summer Saturdays book up a year ahead. A 2027 Friday or Sunday with the church and Pavilion is
            {combo?.fri ? ` ${formatUsd(combo.fri)}` : " less"}
            {combo?.sat ? `, against ${formatUsd(combo.sat)} on a Saturday` : ""}. October to April is quieter still.
          </p>
          <TrackedLink href="/pricing" location="home_value_callout" className="btn btn-light">
            See all pricing
          </TrackedLink>
        </div>
      </section>

      <section className="invite">
        <div className="invite-media" aria-hidden="true">
          <img src="/images/hero-placeholder.svg" alt="" />
        </div>
        <div className="wrap narrow invite-inner">
          <h2>Come walk it with us.</h2>
          <p>Photos never quite do it justice. Tours take about an hour, and couples who tour usually book.</p>
          <TrackedLink href="/book-a-tour" location="home_tour_panel" className="btn btn-light btn-lg">
            Book a tour
          </TrackedLink>
        </div>
      </section>
    </>
  );
}
