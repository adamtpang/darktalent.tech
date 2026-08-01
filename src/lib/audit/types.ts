import type { CardStats } from "@/lib/cards/types";

/**
 * The audit domain, a *consented* individual scored from their real public
 * GitHub. Deliberately split into two faces (see build.ts and the /scout UI):
 *
 *   PUBLIC, an identity object: archetype, strengths, a trajectory *direction*.
 *             No overall number, no tier word. Identity isn't zero-sum, so the
 *             median builder's card is as postable as the top one's.
 *   PRIVATE, the full mirror the person unlocks for themselves: overall, the
 *             six-stat radar, the five explainable pillars, development areas.
 *
 * This is the ethics baked into the type, not bolted onto the copy.
 */

export type SlotId = "VISION" | "BUILD" | "INFLUENCE" | "CAPITAL" | "GRIT";
export type TrajectoryDir = "rising" | "steady" | "cooling";

export interface AuditStrength {
  icon: string;
  text: string;
}

export interface AuditPillar {
  key: string;
  label: string;
  score: number; // 0..100
  confidence: number; // 0..1
  topFactor: string;
}

export interface DevelopmentArea {
  stat: keyof CardStats;
  slot: SlotId;
  title: string;
  action: string;
}

export interface AuditResult {
  handle: string;
  displayName: string;
  tagline: string;
  isExample: boolean;

  // ── public identity card ──
  archetype: string;
  archetypeDef: string;
  playsLike?: string;
  strengths: AuditStrength[];
  trajectory: { dir: TrajectoryDir; label: string };

  // ── private full audit ──
  overall: number;
  stats: CardStats;
  pillars: AuditPillar[];
  bestSlot: SlotId;
  placement: { label: string; href?: string };
  developmentAreas: DevelopmentArea[];

  // ── honesty ──
  scopeNote: string;
  dataCaveat?: string;
}
