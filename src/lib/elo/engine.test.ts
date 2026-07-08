import { describe, it, expect } from "vitest";
import {
  seedElo,
  expectedScore,
  applyMatch,
  seededHistory,
  hashStr,
} from "./engine";

describe("expectedScore", () => {
  it("is 0.5 for equal ratings and symmetric (E_a + E_b = 1)", () => {
    expect(expectedScore(1500, 1500)).toBeCloseTo(0.5, 10);
    for (const [a, b] of [[1500, 1700], [2000, 1600], [1400, 2100]] as const) {
      expect(expectedScore(a, b) + expectedScore(b, a)).toBeCloseTo(1, 10);
    }
  });
  it("is monotonic in rating difference and bounded in (0,1)", () => {
    expect(expectedScore(1800, 1500)).toBeGreaterThan(expectedScore(1600, 1500));
    const e = expectedScore(2200, 1300);
    expect(e).toBeGreaterThan(0);
    expect(e).toBeLessThan(1);
  });
});

describe("applyMatch", () => {
  it("is zero-sum: winner gains exactly what loser loses", () => {
    const { a, b } = applyMatch(1600, 1500, "a");
    expect(a + b).toBeCloseTo(1600 + 1500, 8);
    expect(a).toBeGreaterThan(1600);
    expect(b).toBeLessThan(1500);
  });
  it("rewards an upset more than an expected win", () => {
    const upset = applyMatch(1400, 1900, "a").delta; // underdog wins
    const expectedWin = applyMatch(1900, 1400, "a").delta; // favorite wins
    expect(upset).toBeGreaterThan(expectedWin);
  });
});

describe("seedElo", () => {
  it("stays within ~[1400, 2150]", () => {
    for (const [nw, ov] of [[0, 40], [2, 60], [100, 90], [342, 99]] as const) {
      const r = seedElo(nw, ov);
      expect(r).toBeGreaterThanOrEqual(1400);
      expect(r).toBeLessThanOrEqual(2150);
    }
  });
  it("is monotonic in net worth (overall fixed) and in overall (net worth fixed)", () => {
    expect(seedElo(300, 80)).toBeGreaterThan(seedElo(10, 80));
    expect(seedElo(50, 95)).toBeGreaterThan(seedElo(50, 60));
  });
});

describe("seededHistory", () => {
  it("is deterministic for a given id", () => {
    expect(seededHistory("elon-musk", 2100)).toEqual(seededHistory("elon-musk", 2100));
  });
  it("differs by id and returns finite values of the right length", () => {
    const a = seededHistory("a-one", 1800);
    const b = seededHistory("b-two", 1800);
    expect(a).not.toEqual(b);
    expect(a).toHaveLength(90);
    expect(a.every((n) => Number.isFinite(n))).toBe(true);
  });
  it("ends near the seed rating", () => {
    const h = seededHistory("someone", 1750);
    expect(Math.abs(h[h.length - 1]! - 1750)).toBeLessThan(60);
  });
});

describe("hashStr", () => {
  it("is a stable unsigned 32-bit hash", () => {
    expect(hashStr("x")).toBe(hashStr("x"));
    expect(hashStr("x")).toBeGreaterThanOrEqual(0);
  });
});
