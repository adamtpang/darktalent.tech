import { describe, expect, it } from "vitest";
import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from "./security";

describe("public response security headers", () => {
  it("enforces a restrictive CSP without broad wildcard sources", () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/(?:^|\s)\*(?:\s|;|$)/);
    expect(CONTENT_SECURITY_POLICY).not.toContain("'unsafe-eval'");
  });

  it("prevents MIME sniffing", () => {
    expect(SECURITY_HEADERS).toContainEqual({
      key: "X-Content-Type-Options",
      value: "nosniff",
    });
  });
});
