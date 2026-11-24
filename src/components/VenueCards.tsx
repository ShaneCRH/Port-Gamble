import { TrackedLink } from "./TrackedLink";

/**
 * St. Paul's and the Pavilion with equal weight (about two-thirds of couples use the church).
 * The images are illustrated stand-ins until photo usage rights are confirmed.
 */
export function VenueCards() {
  return (
    <div className="features">
      <article className="feature">
        <figure className="feature-photo">
          <img src="/images/church-placeholder.svg" alt="St. Paul's Church, white with a tall steeple, among evergreens" />
          <figcaption>Illustration. Venue photography to come.</figcaption>
        </figure>
        <div className="feature-body">
          <p className="numeral">I.</p>
          <p className="eyebrow">Built 1879</p>
          <h3>St. Paul&apos;s Church</h3>
          <p className="feature-lede">
            Eight stained-glass windows, the original pews, and the steeple bell you ring together after the recessional.
          </p>
          <ul className="facts">
            <li>Sanctuary seats 150</li>
            <li>Downstairs room up to 40; waterfront terrace up to 80</li>
            <li>Nondenominational; A/C, heat, ADA ramp</li>
            <li>Sundays from 1 pm</li>
          </ul>
          <TrackedLink href="/check-your-date?package=church" location="venue_card_church" className="text-link">
            Check a church date
          </TrackedLink>
        </div>
      </article>
      <article className="feature feature-flip">
        <figure className="feature-photo">
          <img src="/images/pavilion-placeholder.svg" alt="The Pavilion at dusk, windows lit, string lights over the lawn above Hood Canal" />
          <figcaption>Illustration. Venue photography to come.</figcaption>
        </figure>
        <div className="feature-body">
          <p className="numeral">II.</p>
          <p className="eyebrow">On the bluff</p>
          <h3>Hood Canal Vista Pavilion</h3>
          <p className="feature-lede">
            Six sets of French doors, 31 windows and a stone fireplace, with a lawn running down to the water.
          </p>
          <ul className="facts">
            <li>120 seated inside (128 in winter), 150 standing</li>
            <li>Tented terrace for about 185, mid-April to mid-October</li>
            <li>Tables, chairs, sound, mics and projector included</li>
            <li>Free, unlimited parking</li>
          </ul>
          <TrackedLink href="/check-your-date?package=pavilion" location="venue_card_pavilion" className="text-link">
            Check a Pavilion date
          </TrackedLink>
        </div>
      </article>
    </div>
  );
}
