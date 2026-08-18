/**
 * Canonical site origin, shared between the root layout (global metadata,
 * Organization/WebSite JSON-LD) and individual pages that need to set their
 * own absolute canonical URL. Kept out of layout.tsx because Next.js only
 * allows a fixed set of named exports from special files like layout.tsx.
 */
export const SITE = "https://darktalent.tech";
