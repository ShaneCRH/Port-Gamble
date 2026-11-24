"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics/client";
import type { FunnelEventName } from "@/lib/analytics/events";
import { SITE } from "@/content/site";

type Props = ComponentProps<typeof Link> & { event?: FunnelEventName; location: string };

/** A link that emits a funnel event (default cta_clicked) when clicked. */
export function TrackedLink({ event = "cta_clicked", location, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        track(event, { location, href: String(rest.href) });
        onClick?.(e);
      }}
    />
  );
}

export function PhoneLink({ location, className, children }: { location: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={SITE.phoneHref} className={className} onClick={() => track("phone_clicked", { location })}>
      {children}
    </a>
  );
}
