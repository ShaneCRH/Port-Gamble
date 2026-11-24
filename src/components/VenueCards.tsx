import { TrackedLink } from "./TrackedLink";

/** St. Paul's and the Pavilion side by side, with equal weight (about two-thirds of couples use the church). */
export function VenueCards() {
  return (
    <div className="cards">
      <article className="card">
        <div className="card-photo photo-church">Photo: St. Paul&apos;s, interior and steeple</div>
        <div className="card-body">
          <p className="eyebrow">Built 1879</p>
          <h3>St. Paul&apos;s Church</h3>
          <p>Eight stained-glass windows, the original pews and the steeple bell you ring together after the recessional.</p>
          <ul className="facts">
            <li>Sanctuary seats 150</li>
            <li>Downstairs room up to 40; waterfront terrace up to 80</li>
            <li>Nondenominational; A/C, heat, ADA ramp</li>
            <li>Sundays from 1 pm</li>
          </ul>
          <TrackedLink href="/check-your-date?package=church" location="venue_card_church" className="btn btn-secondary btn-small">
            Check a church date
          </TrackedLink>
        </div>
      </article>
      <article className="card">
        <div className="card-photo photo-pavilion">Photo: Pavilion and bluff over Hood Canal</div>
        <div className="card-body">
          <p className="eyebrow">On the bluff</p>
          <h3>Hood Canal Vista Pavilion</h3>
          <p>Six sets of French doors, 31 windows and a stone fireplace, with a lawn running to the water.</p>
          <ul className="facts">
            <li>120 seated inside (128 in winter), 150 standing</li>
            <li>Tented terrace for about 185, mid-April to mid-October</li>
            <li>Tables, chairs, sound, mics and projector included</li>
            <li>Free, unlimited parking</li>
          </ul>
          <TrackedLink href="/check-your-date?package=pavilion" location="venue_card_pavilion" className="btn btn-secondary btn-small">
            Check a Pavilion date
          </TrackedLink>
        </div>
      </article>
    </div>
  );
}
