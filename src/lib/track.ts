/**
 * Named funnel events into the shared fleet PostHog (loaded in layout.tsx).
 * A no-op when PostHog has not loaded, so tracking can never break a flow.
 *
 * The funnel: buy_shortlist_click, shortlist_built, card_claimed.
 */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const ph = (window as unknown as { posthog?: { capture?: (e: string, p?: object) => void } }).posthog;
  ph?.capture?.(event, props);
}
