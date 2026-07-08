import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project is nested inside a parent folder that has its own lockfile;
  // pin the tracing root so Next doesn't infer the wrong workspace root.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
    ],
  },
};

export default nextConfig;
