import type { Legend } from "@/lib/cards/types";

/**
 * The DEMAND side, in one frame: two rival "club" cards.
 *
 * IMPORTANT, unlike the /scout audit (real, consented GitHub data), a company's
 * org stats cannot be computed by the engine. These are ILLUSTRATIVE editorial
 * ratings, a stage set for the "Sensible Transfers" format, and every surface
 * that shows them says so.
 */
export interface Club {
  legend: Legend;
  ticker: string;
  sector: string;
  form: number[]; // market-cap "form" line
  formLabel: string;
  trend: "down" | "up";
  diagnosis: string;
}

export const INTEL: Club = {
  ticker: "$INTC",
  sector: "Semiconductors",
  form: [88, 84, 80, 74, 68, 60, 54, 48],
  formLabel: "Relegation zone",
  trend: "down",
  diagnosis:
    "Plays IDM, designs and builds its own chips, a style that lives or dies on process leadership, and they got caught behind the line. The gap is BUILD: a playmaker who can run a fab and a roadmap.",
  legend: {
    id: "intel",
    name: "Intel",
    surname: "INTEL",
    role: "Industrialist",
    status: "living",
    domain: "Tech",
    company: "Semiconductors",
    era: "$INTC",
    blurb: "The fallen giant of Santa Clara.",
    // Illustrative org capabilities. Low INO (58) = the diagnosed BUILD gap.
    stats: { vis: 70, exe: 74, inf: 78, ino: 58, cap: 80, grt: 72 },
  },
};

export const AMD: Club = {
  ticker: "$AMD",
  sector: "Semiconductors",
  form: [40, 48, 58, 66, 74, 82, 90, 96],
  formLabel: "Title race",
  trend: "up",
  diagnosis:
    "The model club, proof the thesis is real. The signing that worked: a technical leader into the VISION/BUILD slot flipped the club's whole trajectory. Right talent, right seat, table turned.",
  legend: {
    id: "amd",
    name: "AMD",
    surname: "AMD",
    role: "Industrialist",
    status: "living",
    domain: "Tech",
    company: "Semiconductors",
    era: "$AMD",
    blurb: "The perfect transfer window.",
    stats: { vis: 86, exe: 88, inf: 82, ino: 90, cap: 84, grt: 85 },
  },
};
