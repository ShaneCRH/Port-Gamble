"use client";

import { useEffect } from "react";
import { captureUtm, getSessionId } from "@/lib/analytics/client";

/** Starts the analytics session and captures UTM tags on first load. Renders nothing. */
export function AnalyticsBoot() {
  useEffect(() => {
    getSessionId();
    captureUtm(window.location.search);
  }, []);
  return null;
}
