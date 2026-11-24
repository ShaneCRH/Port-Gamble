import type { Metadata } from "next";
import { TrackedLink } from "@/components/TrackedLink";
import { VenueCards } from "@/components/VenueCards";

export const metadata: Metadata = { title: "Venues: St. Paul's Church and Hood Canal Vista Pavilion" };

export default function Venues() {
  return (
    <div className="wrap">
      <div className="page-head">
        <p className="eyebrow">Venues</p>
        <h1>St. Paul&apos;s Church and the Hood Canal Vista Pavilion</h1>
        <p className="lede">Most couples marry in the church and walk to the Pavilion for the reception. You can also do both in the Pavilion, or book the church on its own.</p>
      </div>
      <VenueCards />
      <section className="section-tight section">
        <h2>Always included</h2>
        <ul className="facts">
          <li>A one-hour rehearsal, scheduled about two months before</li>
          <li>Getting-ready spaces</li>
          <li>Tables and chairs set up and broken down by our staff</li>
          <li>A personalised floor plan</li>
          <li>Microphones and sound system (projector at the Pavilion)</li>
          <li>Venue staff on site for the rehearsal and the whole day</li>
        </ul>
        <TrackedLink href="/book-a-tour" location="venues_page" className="btn btn-primary">Book a tour</TrackedLink>
      </section>
    </div>
  );
}
