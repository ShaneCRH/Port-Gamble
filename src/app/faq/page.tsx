import type { Metadata } from "next";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = { title: "FAQ" };

/** From the venue's tour document (docs/HANDOFF.md section 3). Confirm before launch. */
const FAQ: { q: string; a: string }[] = [
  { q: "Can we bring our own caterer?", a: "We work with preferred caterers. Outside caterers are possible with a separate agreement, a site walkthrough, a business license, insurance and a health permit, and a higher security deposit." },
  { q: "How does alcohol work?", a: "All alcohol is served by a licensed, insured bartending service (or your caterer's), with a Washington banquet permit. No self-serve." },
  { q: "What's the rental window?", a: "The Pavilion is yours 9 am to 10 pm. Church + Pavilion packages include a 4-hour church block. Extra hours can be added." },
  { q: "Is there parking?", a: "Yes, free and unlimited, with reserved spots for VIPs and an attendant on the day." },
  { q: "Can we decorate?", a: "Yes, with a few rules: nothing attached to walls or pews (pew clips work well), candles in containers taller than the flame, and light-coloured petals only in the church." },
  { q: "What sendoffs are allowed?", a: "Almost anything except fireworks, birdseed, rice, foil confetti and floating lanterns. Sparklers are case by case." },
  { q: "How do we secure a date?", a: "Tour, then sign the rental agreement and pay a 50% retainer. The balance and security deposit are due 10 days before the wedding." },
];

export default function Faq() {
  return (
    <div className="wrap">
      <div className="page-head">
        <p className="eyebrow">Good to know</p>
        <h1>Questions couples ask</h1>
      </div>
      <dl className="faq panel">
        {FAQ.map((f) => (
          <div key={f.q}>
            <dt>{f.q}</dt>
            <dd>{f.a}</dd>
          </div>
        ))}
      </dl>
      <p style={{ marginTop: 24 }}>
        <TrackedLink href="/book-a-tour" location="faq_page" className="btn btn-primary">Ask us on a tour</TrackedLink>
      </p>
    </div>
  );
}
