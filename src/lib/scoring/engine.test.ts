import { describe, it, expect } from "vitest";
import { scoreTalent } from "./engine";
import { baseSignals, DARK_TALENT, CREDENTIALED } from "./fixtures";

const NOW = new Date("2026-06-09T00:00:00.000Z");

describe("scoreTalent", () => {
  it("is deterministic for fixed inputs and clock", () => {
    const a = scoreTalent(DARK_TALENT, { now: NOW });
    const b = scoreTalent(DARK_TALENT, { now: NOW });
    expect(a).toEqual(b);
  });

  it("keeps every score within 0..100", () => {
    for (const s of [DARK_TALENT, CREDENTIALED, baseSignals()]) {
      const r = scoreTalent(s, { now: NOW });
      expect(r.overall).toBeGreaterThanOrEqual(0);
      expect(r.overall).toBeLessThanOrEqual(100);
      for (const p of r.pillars) {
        expect(p.score).toBeGreaterThanOrEqual(0);
        expect(p.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("rates the dark-talent archetype above the credentialed-but-quiet one", () => {
    const dark = scoreTalent(DARK_TALENT, { now: NOW });
    const cred = scoreTalent(CREDENTIALED, { now: NOW });
    expect(dark.overall).toBeGreaterThan(cred.overall);
  });

  it("the dark signal specifically rewards high-output + low-pedigree", () => {
    const dark = scoreTalent(DARK_TALENT, { now: NOW });
    const cred = scoreTalent(CREDENTIALED, { now: NOW });
    const ds = (r: typeof dark) => r.pillars.find((p) => p.key === "darkSignal")!.score;
    expect(ds(dark)).toBeGreaterThan(ds(cred) + 20);
  });

  it("pedigree is a discount: adding logos lowers the dark signal, all else equal", () => {
    const plain = baseSignals({
      output: { ...baseSignals().output, totalStars: 3000, originalRepos: 30, commitsLast12mo: 1500, mergedPRs: 150 },
    });
    const withLogos = baseSignals({
      output: plain.output,
      pedigree: { eliteEducation: true, bigTechExperience: true, credentialedYears: 10 },
    });
    const ds = (s: typeof plain) =>
      scoreTalent(s, { now: NOW }).pillars.find((p) => p.key === "darkSignal")!.score;
    expect(ds(plain)).toBeGreaterThan(ds(withLogos));
  });

  it("redistributes weight when optional alignment data is absent", () => {
    const r = scoreTalent(CREDENTIALED, { now: NOW }); // no alignment block
    const alignment = r.pillars.find((p) => p.key === "alignment")!;
    expect(alignment.confidence).toBe(0);
    expect(alignment.weight).toBe(0);
    const totalWeight = r.pillars.reduce((s, p) => s + p.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 5);
  });

  it("custom weights change the blend", () => {
    const a = scoreTalent(DARK_TALENT, { now: NOW, weights: { darkSignal: 0.8 } });
    const b = scoreTalent(DARK_TALENT, { now: NOW, weights: { darkSignal: 0.0 } });
    expect(a.overall).not.toBe(b.overall);
  });
});
