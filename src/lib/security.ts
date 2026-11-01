// Dev only: React Refresh evaluates strings; production never needs this.
const DEV_EVAL = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
// The shared fleet PostHog (see layout.tsx) loads from us-assets and posts to us.i.
const POSTHOG = "https://us-assets.i.posthog.com https://us.i.posthog.com";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${DEV_EVAL} https://us-assets.i.posthog.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://avatars.githubusercontent.com https://pbs.twimg.com",
  "font-src 'self' data:",
  `connect-src 'self' https://vitals.vercel-insights.com ${POSTHOG}`,
  "upgrade-insecure-requests",
].join("; ");

export const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
