"use server";

import { parseJD } from "@/lib/shortlist/jd";
import { buildShortlist } from "@/lib/shortlist/build";
import type { Shortlist } from "@/lib/shortlist/types";

export type ShortlistResponse =
  | { ok: true; shortlist: Shortlist }
  | { ok: false; error: string };

/**
 * Intake a company's JD and return the shortlist artifact.
 * Pure compute over the local pool: no network, no third party call.
 */
export async function runShortlist(jd: string): Promise<ShortlistResponse> {
  const text = (jd || "").trim();
  if (text.length < 40) {
    return {
      ok: false,
      error: "Paste a bit more of the job description. Forty characters or more gives the parser something to read.",
    };
  }
  try {
    const role = parseJD(text);
    return { ok: true, shortlist: buildShortlist(role) };
  } catch {
    return { ok: false, error: "Could not build a shortlist from that text. Try pasting the full job description." };
  }
}
