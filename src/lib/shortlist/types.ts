import type { CardStats } from "@/lib/cards/types";
import type { SlotId } from "@/lib/audit/types";

/**
 * The demand side of the skill.supply pairing.
 *
 * skill.supply builds the free scored talent pool (the supply). darktalent
 * sells companies access to it, packaged as a curated shortlist: five scored
 * candidates matched to one job description.
 *
 * Honesty rules that shape these types (see ECOSYSTEM.md):
 * - Nothing is claimed about a candidate unless it is defensible from the
 *   input, so every ShortlistEntry carries its own evidence lines.
 * - The pool source is always stated, because today it is NOT skill.supply
 *   (see pool.ts for why).
 */

export interface RoleSpec {
  /** Raw title as read from the JD, or a fallback. */
  title: string;
  /** Which squad slot this role occupies. */
  slot: SlotId;
  /** The card stat this slot demands most. */
  primaryStat: keyof CardStats;
  /** Required stat vector for a strong occupant, 0 to 100. */
  demand: CardStats;
  seniority: "junior" | "mid" | "senior" | "staff+";
  /** Signal words actually found in the JD, so the read is auditable. */
  matched: string[];
  /** Confidence in the parse, 0 to 1. Low means ask the company. */
  confidence: number;
}

export interface ShortlistEntry {
  handle: string;
  displayName: string;
  tagline: string;
  archetype: string;
  overall: number;
  stats: CardStats;
  /** 0 to 100 fit for THIS role, not raw quality. */
  fit: number;
  /** The arbitrage: high output against low pedigree. */
  darkSignal: number;
  /** Auditable reasons, drawn from the scoring engine's own factors. */
  evidence: string[];
  /** One line on why this person for this specific seat. */
  whyThisRole: string;
}

export interface Shortlist {
  role: RoleSpec;
  entries: ShortlistEntry[];
  /** Where the candidates came from. Never claim skill.supply until it persists. */
  poolSource: string;
  poolSize: number;
  /** Anything a buyer must know before trusting this artifact. */
  caveats: string[];
  computedAt: string;
}
