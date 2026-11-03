"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * One delegated listener: any element with data-track="event_name" fires that
 * event on click. Lets server-rendered links (like the Stripe buy button) be
 * tracked without becoming client components.
 */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (el?.dataset.track) track(el.dataset.track, { path: location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
