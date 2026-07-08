import type { CardStats, Domain, Role } from "@/lib/cards/types";

/** A ranked person — Forbes-caliber living tech/business figure. */
export interface RankPerson {
  id: string;
  name: string;
  surname: string;
  company: string;
  domain: Domain;
  industry: string;
  country: string;
  netWorthB: number; // approximate net worth, USD billions
  role: Role;
  blurb: string;
  stats: CardStats;
}
