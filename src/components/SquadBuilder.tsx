"use client";

import { useMemo, useState } from "react";
import { LEGENDS, getLegend } from "@/lib/cards/legends";
import { overall } from "@/lib/cards/rating";
import type { CardStats } from "@/lib/cards/types";
import { PlayerCard } from "./PlayerCard";

type SlotId = "vision" | "build" | "influence" | "capital" | "grit";

const SLOTS: {
  id: SlotId;
  label: string;
  stat: keyof CardStats;
  x: number;
  y: number;
}[] = [
  { id: "vision", label: "VISION", stat: "vis", x: 50, y: 15 },
  { id: "build", label: "BUILD", stat: "ino", x: 26, y: 41 },
  { id: "influence", label: "INFLUENCE", stat: "inf", x: 74, y: 41 },
  { id: "capital", label: "CAPITAL", stat: "cap", x: 30, y: 74 },
  { id: "grit", label: "GRIT", stat: "grt", x: 70, y: 74 },
];

type Squad = Record<SlotId, string | null>;
const EMPTY: Squad = { vision: null, build: null, influence: null, capital: null, grit: null };

export function SquadBuilder() {
  const [squad, setSquad] = useState<Squad>(EMPTY);
  const [active, setActive] = useState<SlotId | null>(null);
  const [q, setQ] = useState("");

  const used = useMemo(() => new Set(Object.values(squad).filter(Boolean) as string[]), [squad]);

  const filled = SLOTS.map((s) => ({ slot: s, legend: squad[s.id] ? getLegend(squad[s.id]!) : undefined }));
  const picked = filled.filter((f) => f.legend);

  const teamOvr = picked.length
    ? Math.round(picked.reduce((s, f) => s + overall(f.legend!.stats), 0) / picked.length)
    : 0;
  // Chemistry: how well each pick's slot-relevant stat fits its position.
  const chem = picked.length
    ? Math.round(picked.reduce((s, f) => s + f.legend!.stats[f.slot.stat], 0) / picked.length)
    : 0;

  const drawerList = useMemo(() => {
    return LEGENDS.filter(
      (l) =>
        !used.has(l.id) &&
        (!q || `${l.name} ${l.company ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    ).sort((a, b) => overall(b.stats) - overall(a.stats));
  }, [used, q]);

  function assign(id: string) {
    if (!active) return;
    setSquad((s) => ({ ...s, [active]: id }));
    setActive(null);
    setQ("");
  }
  function clearSlot(slot: SlotId) {
    setSquad((s) => ({ ...s, [slot]: null }));
  }
  function randomize() {
    const pool = [...LEGENDS].sort(() => Math.random() - 0.5).slice(0, 5);
    const next: Squad = { ...EMPTY };
    SLOTS.forEach((s, i) => {
      const l = pool[i];
      next[s.id] = l ? l.id : null;
    });
    setSquad(next);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 28 }}>
      {/* scoreboard */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 28 }}>
          <Stat label="TEAM OVR" value={teamOvr || "-"} accent />
          <Stat label="CHEMISTRY" value={chem ? `${chem}` : "-"} />
          <Stat label="FILLED" value={`${picked.length}/5`} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="chip" onClick={randomize}>🎲 Random</button>
          <button className="chip" onClick={() => setSquad(EMPTY)}>Clear</button>
        </div>
      </div>

      {/* pitch */}
      <div style={{ maxWidth: 620, width: "100%", margin: "0 auto" }}>
        <div className="pitch">
          {filled.map(({ slot, legend }) => (
            <div key={slot.id} className="slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
              {legend ? (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setActive(slot.id)}
                    style={{ all: "unset", cursor: "pointer", display: "block" }}
                    title="Replace"
                  >
                    <PlayerCard legend={legend} />
                  </button>
                  <button
                    onClick={() => clearSlot(slot.id)}
                    aria-label="Remove"
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "1px solid var(--line-2)",
                      background: "var(--bg-2)",
                      color: "var(--danger)",
                      cursor: "pointer",
                      fontSize: 12,
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                  <div className="slot__pos" style={{ marginTop: 6 }}>{slot.label}</div>
                </div>
              ) : (
                <button className="slot__empty" onClick={() => setActive(slot.id)} style={{ width: "100%" }}>
                  <div>
                    <div className="slot__plus">+</div>
                    <div className="slot__pos">{slot.label}</div>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* picker drawer */}
      {active && (
        <>
          <div className="drawer-backdrop" onClick={() => setActive(null)} />
          <div className="drawer">
            <div style={{ padding: 20, borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="eyebrow">Pick for</div>
                  <div className="font-display" style={{ fontWeight: 800, fontSize: 22 }}>
                    {SLOTS.find((s) => s.id === active)?.label}
                  </div>
                </div>
                <button className="chip" onClick={() => setActive(null)}>Close</button>
              </div>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                style={{
                  marginTop: 14,
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--line-2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "var(--ink)",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ overflowY: "auto", padding: 12 }}>
              {drawerList.map((l) => (
                <button
                  key={l.id}
                  onClick={() => assign(l.id)}
                  style={{
                    all: "unset",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                  className="picker-row"
                >
                  <span
                    className="font-display gold-text"
                    style={{ fontWeight: 800, fontSize: 20, minWidth: 34 }}
                  >
                    {overall(l.stats)}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>{l.name}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                      {l.role} · {l.company ?? l.domain}
                    </span>
                  </span>
                  <span className="chip" style={{ pointerEvents: "none" }}>
                    {l.status === "dead" ? "ICON" : l.domain}
                  </span>
                </button>
              ))}
              {drawerList.length === 0 && (
                <p style={{ color: "var(--ink-dim)", padding: 16 }}>No one left to pick.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: "var(--ink-faint)" }}>{label}</div>
      <div
        className={`font-display ${accent ? "gold-text" : ""}`}
        style={{ fontWeight: 800, fontSize: 34, letterSpacing: "-0.04em", lineHeight: 1 }}
      >
        {value}
      </div>
    </div>
  );
}
