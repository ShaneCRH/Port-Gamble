import Link from "next/link";
import { SITE } from "@/content/site";
import { PhoneLink, TrackedLink } from "./TrackedLink";

function Wordmark({ as: Tag = "span" }: { as?: "span" | "p" }) {
  return (
    <Tag className="wordmark">
      <span className="wordmark-name">Port Gamble</span>
      <span className="wordmark-sub">Weddings on Hood Canal</span>
    </Tag>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <nav aria-label="Main" className="main-nav nav-left">
          <Link href="/venues">Venues</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <Link href="/" className="brand" aria-label="Port Gamble Weddings, home">
          <Wordmark />
        </Link>
        <nav aria-label="Booking" className="main-nav nav-right">
          <Link href="/check-your-date">Check your date</Link>
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
          <Wordmark as="p" />
          <p className="footer-muted">{SITE.addressLine}</p>
        </div>
        <nav aria-label="Footer" className="footer-links">
          <Link href="/venues">Venues</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/check-your-date">Check your date</Link>
          <Link href="/book-a-tour">Book a tour</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <div>
          <p>
            <PhoneLink location="footer">{SITE.phoneDisplay}</PhoneLink>
          </p>
          <p className="footer-muted">Staged preview. Not the live site.</p>
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
