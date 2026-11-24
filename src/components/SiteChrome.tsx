import Link from "next/link";
import { SITE } from "@/content/site";
import { PhoneLink, TrackedLink } from "./TrackedLink";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand">
          Port Gamble <span>Weddings</span>
        </Link>
        <nav aria-label="Main" className="main-nav">
          <Link href="/venues">Venues</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/check-your-date">Check your date</Link>
          <Link href="/faq">FAQ</Link>
          <TrackedLink href="/book-a-tour" location="header" className="btn btn-primary btn-small">
            Book a tour
          </TrackedLink>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div>
          <p className="brand">Port Gamble <span>Weddings</span></p>
          <p className="muted">{SITE.addressLine}</p>
        </div>
        <div>
          <p>
            <PhoneLink location="footer">{SITE.phoneDisplay}</PhoneLink>
          </p>
          <p className="muted">Staged preview. Not the live site.</p>
        </div>
      </div>
    </footer>
  );
}

/** Always-visible tour button on phones, where most couples browse. */
export function StickyTourBar() {
  return (
    <div className="sticky-tour" role="region" aria-label="Book a tour">
      <PhoneLink location="sticky_bar" className="btn btn-secondary">
        Call
      </PhoneLink>
      <TrackedLink href="/book-a-tour" location="sticky_bar" className="btn btn-primary">
        Book a tour
      </TrackedLink>
    </div>
  );
}
