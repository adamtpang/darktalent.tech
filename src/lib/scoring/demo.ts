/**
 * Visual sanity check for the scoring engine.
 *   npm run score:demo
 */
import { scoreTalent } from "./engine";
import { DARK_TALENT, CREDENTIALED } from "./fixtures";
import type { TalentSignals } from "./types";

// Fixed clock → deterministic, copy-pasteable output.
const NOW = new Date("2026-06-09T00:00:00.000Z");

function render(signals: TalentSignals): void {
  const r = scoreTalent(signals, { now: NOW });
  const bar = (n: number) => "█".repeat(Math.round(n / 5)).padEnd(20, "·");

  console.log(`\n  ${signals.handle}`);
  console.log(`  ${"─".repeat(54)}`);
  console.log(`  OVERALL  ${bar(r.overall)}  ${r.overall}   (confidence ${r.confidence})`);
  for (const p of r.pillars) {
    const tag = p.weight === 0 ? "  (n/a)" : `  w=${p.weight.toFixed(2)}`;
    console.log(`  ${p.label.padEnd(22)} ${bar(p.score)}  ${String(p.score).padStart(5)}${tag}`);
  }
  if (r.highlights.length) {
    console.log("");
    for (const h of r.highlights) console.log(`  ${h}`);
  }
}

console.log("\n  darktalent.tech, scoring engine demo");
render(DARK_TALENT);
render(CREDENTIALED);
console.log("");
