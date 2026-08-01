"use server";

import { fetchGitHubSignals } from "@/lib/integrations/github";
import { buildAudit } from "@/lib/audit/build";
import { getExample } from "@/lib/audit/examples";
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
