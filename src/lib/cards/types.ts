/**
 * The card model — a person reduced to a collectible.
 * Six universal stats that work for tech AND business, living AND dead.
 */
export type CardStatus = "living" | "dead";
export type CardTier = "icon" | "elite" | "gold" | "silver" | "bronze";

export type Domain =
  | "Tech"
  | "Business"
  | "Finance"
  | "Industry"
  | "Science"
  | "Creative";

export type Role =
  | "Founder"
  | "Investor"
  | "Inventor"
  | "Operator"
  | "Visionary"
  | "Financier"
  | "Industrialist"
  | "Scientist"
  | "Creative";

export interface CardStats {
  vis: number; // Vision
  exe: number; // Execution
  inf: number; // Influence
  ino: number; // Innovation
  cap: number; // Capital (value created)
  grt: number; // Grit
}

export interface Legend {
  id: string;
  name: string; // full name
  surname: string; // shown large on the card
  role: Role;
  status: CardStatus;
  domain: Domain;
  company?: string;
  era: string; // "1839-1937" | "b. 1971"
  blurb?: string;
  stats: CardStats;
}

export const STAT_KEYS = ["vis", "exe", "inf", "ino", "cap", "grt"] as const;

export const STAT_LABELS: Record<keyof CardStats, string> = {
  vis: "VIS",
  exe: "EXE",
  inf: "INF",
  ino: "INO",
  cap: "CAP",
  grt: "GRT",
};

export const STAT_FULL: Record<keyof CardStats, string> = {
  vis: "Vision",
  exe: "Execution",
  inf: "Influence",
  ino: "Innovation",
  cap: "Capital",
  grt: "Grit",
};
