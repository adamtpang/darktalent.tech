/**
 * The fleet ring (see Aether/DISTRIBUTION.md part 2).
 *
 * Source of truth is `Aether/fleet.json`, which lives above this repo and so
 * cannot be imported at build time. This is the per-repo snippet, kept in sync
 * by hand. If a URL changes in fleet.json, change it here in the same commit.
 *
 * Sisters are the other two surfaces of the talent trifecta, so the ring also
 * carries the story: the academy, the scout, the transfer market.
 */

export const FLEET_HUB = { name: "adam.gives", url: "https://adam.gives" };

export const FLEET_SISTERS = [
  { name: "skill.supply", url: "https://skill.supply", one: "the supply side, free forever" },
  { name: "company.university", url: "https://company.university", one: "every company gets a school" },
];
