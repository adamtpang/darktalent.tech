"use server";

import { fetchGitHubSignals } from "@/lib/integrations/github";
import { buildAudit } from "@/lib/audit/build";
import { getExample } from "@/lib/audit/examples";
import { upsertCard } from "@/lib/card/service";
import type { AuditResult } from "@/lib/audit/types";

export type AuditResponse =
  | { ok: true; audit: AuditResult }
  | { ok: false; error: string };

/**
 * Run an audit for a GitHub handle (or a demo example key). Server-only: the
 * live path hits GitHub via Octokit. Everything degrades gracefully, a bad
 * handle or a rate-limit returns a friendly error, never a crash.
 */
export async function runAudit(rawHandle: string): Promise<AuditResponse> {
  const handle = rawHandle.trim().replace(/^@/, "").replace(/\s+/g, "");
  if (!handle) return { ok: false, error: "Enter a GitHub handle to audit." };

  // Demo composites, instant, no network, clearly labelled in the UI.
  const example = getExample(handle);
  if (example) {
    return {
      ok: true,
      audit: buildAudit(example.signals, {
        displayName: example.displayName,
        tagline: example.tagline,
        playsLike: example.playsLike,
        isExample: true,
      }),
    };
  }

  if (!/^[a-zA-Z0-9-]{1,39}$/.test(handle)) {
    return { ok: false, error: `"${rawHandle}" isn't a valid GitHub handle.` };
  }

  try {
    const signals = await fetchGitHubSignals(handle);
    if (signals.account.publicRepos === 0 && signals.output.originalRepos === 0) {
      return {
        ok: false,
        error: `@${handle} has no public repositories to audit yet.`,
      };
    }
    return { ok: true, audit: buildAudit(signals, { displayName: `@${handle}`, tagline: "audited from public GitHub" }) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/not found|404/i.test(msg)) {
      return { ok: false, error: `No GitHub user called "${handle}".` };
    }
    if (/rate limit|403/i.test(msg)) {
      return {
        ok: false,
        error: "GitHub rate limit hit. Add a GITHUB_TOKEN, or try a demo card below.",
      };
    }
    return { ok: false, error: "Couldn't reach GitHub just now. Try a demo card below." };
  }
}

export type ClaimResponse =
  | { ok: true; overall: number }
  | { ok: false; error: string };

/**
 * Claim your own card: same-origin, so no CORS needed, unlike skill.supply's
 * cross-origin opt-in. Deliberately does NOT reuse the audit already shown on
 * screen, it re-fetches so the claimed score is fresh, not whatever was
 * cached when the person first looked themselves up. This is the person
 * clicking their own consent; nothing here should ever be called on someone
 * else's behalf.
 */
export async function claimCard(handle: string, contact: boolean): Promise<ClaimResponse> {
  const clean = handle.trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(clean)) {
    return { ok: false, error: "Not a valid GitHub handle." };
  }
  const result = await upsertCard({
    handle: clean,
    origin: "darktalent.tech",
    consent: { display: true, contact },
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, overall: result.overall };
}
