"use client";

import { useMemo, useRef, useState } from "react";

const W = 720;
const H = 260;
const PAD = 16;

const RANGES = [
  { label: "2W", days: 14 },
  { label: "1M", days: 30 },
  { label: "ALL", days: 90 },
] as const;

export function EloChart({ history }: { history: number[] }) {
  const [days, setDays] = useState<number>(90);
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => history.slice(-days), [history, days]);

  const { min, max, linePath, areaPath, xOf, yOf } = useMemo(() => {
    const lo0 = Math.min(...data);
    const hi0 = Math.max(...data);
    const span = hi0 - lo0 || 1;
    const lo = lo0 - span * 0.18;
    const hi = hi0 + span * 0.18;
    const xOf = (i: number) => PAD + (i / Math.max(1, data.length - 1)) * (W - 2 * PAD);
    const yOf = (v: number) => PAD + (1 - (v - lo) / (hi - lo)) * (H - 2 * PAD);
    const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(" ");
    const area = `${line} L${xOf(data.length - 1).toFixed(1)} ${H - PAD} L${xOf(0).toFixed(1)} ${H - PAD} Z`;
    return { min: Math.round(lo0), max: Math.round(hi0), linePath: line, areaPath: area, xOf, yOf };
  }, [data]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = (e.clientX - r.left) / r.width;
    const i = Math.max(0, Math.min(data.length - 1, Math.round(frac * (data.length - 1))));
    setHover(i);
  }

  const hoverV = hover !== null ? data[hover] : null;
  const gridVals = [0, 0.5, 1].map((t) => Math.round(min + (max - min) * t));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="eyebrow">Elo history</div>
        <div style={{ display: "flex", gap: 6 }}>
          {RANGES.map((r) => (
            <button key={r.label} className="chip" data-active={days === r.days} aria-pressed={days === r.days} onClick={() => { setDays(r.days); setHover(null); }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={wrapRef} onPointerMove={onMove} onPointerLeave={() => setHover(null)} style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Elo history over ${data.length} days`} style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="eloFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(94,234,212,0.20)" />
              <stop offset="100%" stopColor="rgba(94,234,212,0)" />
            </linearGradient>
          </defs>

          {gridVals.map((gv, i) => {
            const yy = yOf(gv);
            return (
              <g key={i}>
                <line x1={PAD} y1={yy} x2={W - PAD} y2={yy} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={W - PAD} y={yy - 4} textAnchor="end" fontFamily="var(--font-mono), monospace" fontSize={10} fill="var(--ink-faint)">
                  {gv}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#eloFill)" />
          <path d={linePath} fill="none" stroke="var(--signal)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hover !== null && hoverV !== undefined && hoverV !== null && (
            <g>
              <line x1={xOf(hover)} y1={PAD} x2={xOf(hover)} y2={H - PAD} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
              <circle cx={xOf(hover)} cy={yOf(hoverV)} r={4} fill="var(--signal)" stroke="#08090c" strokeWidth={2} />
            </g>
          )}
          <circle cx={xOf(data.length - 1)} cy={yOf(data[data.length - 1]!)} r={3.5} fill="var(--signal)" />
        </svg>

        {hover !== null && hoverV !== undefined && hoverV !== null && (
          <div
            className="font-mono"
            style={{
              position: "absolute",
              left: `${(xOf(hover) / W) * 100}%`,
              top: 0,
              transform: "translateX(-50%)",
              pointerEvents: "none",
              background: "var(--bg-2)",
              border: "1px solid var(--line-2)",
              borderRadius: 8,
              padding: "5px 9px",
              fontSize: 11,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--ink-faint)" }}>{data.length - hover}d ago · </span>
            <b style={{ color: "var(--signal)" }}>{hoverV}</b>
          </div>
        )}
      </div>
    </div>
  );
}
