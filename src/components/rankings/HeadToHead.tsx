"use client";

import { useEffect, useMemo, useState } from "react";
import type { Legend } from "@/lib/cards/types";
import { applyMatch, expectedScore, hashStr } from "@/lib/elo/engine";
import { PlayerCard } from "@/components/PlayerCard";
import { TiltCard } from "@/components/TiltCard";

export interface VersusEntry {
  id: string;
  elo: number;
  legend: Legend;
}

type Pair = { a: VersusEntry; b: VersusEntry };

function nearest(pool: VersusEntry[], a: VersusEntry): VersusEntry {
  let best = pool[0]!;
  let bd = Infinity;
  for (const e of pool) {
    if (e.id === a.id) continue;
    const d = Math.abs(e.elo - a.elo);
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  return best;
}

function initialPair(pool: VersusEntry[], seedA?: string): Pair {
  const a = (seedA && pool.find((e) => e.id === seedA)) || pool[0]!;
  return { a, b: nearest(pool, a) };
}

/** Client-only random pair (called after interaction — never during SSR). */
function randomPair(pool: VersusEntry[]): Pair {
  const a = pool[Math.floor(Math.random() * pool.length)]!;
  const near = [...pool]
    .filter((e) => e.id !== a.id)
    .sort((x, y) => Math.abs(x.elo - a.elo) - Math.abs(y.elo - a.elo))
    .slice(0, 8);
  const b = near[Math.floor(Math.random() * near.length)] ?? pool[0]!;
  return { a, b };
}

function communityPct(a: VersusEntry, b: VersusEntry): number {
  const base = expectedScore(a.elo, b.elo) * 100; // % who'd pick A
  const jitter = (hashStr(a.id + b.id) % 21) - 10; // ±10 deterministic
  return Math.round(Math.min(88, Math.max(12, base + jitter)));
}

export function HeadToHead({
  entries,
  seedA,
  endless = false,
}: {
  entries: VersusEntry[];
  seedA?: string;
  endless?: boolean;
}) {
  const [pair, setPair] = useState<Pair>(() => initialPair(entries, seedA));
  const [rA, setRA] = useState(pair.a.elo);
  const [rB, setRB] = useState(pair.b.elo);
  const [voted, setVoted] = useState<null | "a" | "b">(null);
  const [delta, setDelta] = useState(0);
  const [votes, setVotes] = useState(0);

  useEffect(() => {
    try {
      setVotes(Number(localStorage.getItem("dt_votes") || 0));
    } catch {}
  }, []);

  function reset(next: Pair) {
    setPair(next);
    setRA(next.a.elo);
    setRB(next.b.elo);
    setVoted(null);
    setDelta(0);
  }

  function vote(side: "a" | "b") {
    if (voted) return;
    const res = applyMatch(rA, rB, side, 24);
    setRA(Math.round(res.a));
    setRB(Math.round(res.b));
    setDelta(Math.round(res.delta));
    setVoted(side);
    setVotes((v) => {
      const n = v + 1;
      try {
        localStorage.setItem("dt_votes", String(n));
      } catch {}
      return n;
    });
  }

  const pctA = useMemo(() => communityPct(pair.a, pair.b), [pair]);
  const winner = voted === "a" ? pair.a : voted === "b" ? pair.b : null;
  const winnerPct = voted === "a" ? pctA : 100 - pctA;

  const Side = ({ side }: { side: "a" | "b" }) => {
    const e = side === "a" ? pair.a : pair.b;
    const r = side === "a" ? rA : rB;
    const isWinner = voted === side;
    const isLoser = voted !== null && !isWinner;
    return (
      <div className="vs-side" data-state={isWinner ? "win" : isLoser ? "lose" : "idle"}>
        <button className="vs-pick" onClick={() => vote(side)} disabled={voted !== null} aria-label={`Vote ${e.legend.surname}`}>
          <TiltCard>
            <PlayerCard legend={e.legend} />
          </TiltCard>
        </button>
        <div className="vs-meta">
          <span className="vs-name">{e.legend.surname}</span>
          <span className="vs-elo font-mono">
            {r}
            {voted && (
              <b className={isWinner ? "lb-up" : "lb-down"} style={{ marginLeft: 6 }}>
                {isWinner ? `+${delta}` : `−${delta}`}
              </b>
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="vs-wrap">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div className="eyebrow">Head to head · cast your vote</div>
        <h3 className="font-display" style={{ fontWeight: 800, fontSize: "clamp(22px,4vw,32px)", letterSpacing: "-0.03em", marginTop: 8 }}>
          Who&apos;s the bigger builder?
        </h3>
      </div>

      <div className="vs-arena">
        <Side side="a" />
        <div className="vs-seal font-display gold-text">VS</div>
        <Side side="b" />
      </div>

      {voted && winner ? (
        <div className="vs-result">
          <div className="vs-splitbar">
            <span style={{ width: `${pctA}%` }} data-side="a" />
            <span style={{ width: `${100 - pctA}%` }} data-side="b" />
          </div>
          <p style={{ marginTop: 10, color: "var(--ink-dim)", fontSize: 14 }}>
            You + <b style={{ color: "var(--ink)" }}>{winnerPct}%</b> of voters picked{" "}
            <b style={{ color: "var(--gold)" }}>{winner.legend.surname}</b>
          </p>
          <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => reset(randomPair(entries))}>
            Next matchup →
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={() => reset(endless ? randomPair(entries) : initialPair(entries, seedA))}>
            Skip · can&apos;t decide
          </button>
        </div>
      )}

      <p className="font-mono" style={{ textAlign: "center", color: "var(--ink-faint)", fontSize: 11, marginTop: 22 }}>
        {votes} vote{votes === 1 ? "" : "s"} cast · a preview of how your votes move the board
      </p>
    </div>
  );
}
