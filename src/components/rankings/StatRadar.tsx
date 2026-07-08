import type { CardStats } from "@/lib/cards/types";
import { STAT_KEYS, STAT_LABELS } from "@/lib/cards/types";
import { overall } from "@/lib/cards/rating";

/** Hexagonal six-stat radar (VIS/EXE/INF/INO/CAP/GRT) in the Obsidian aesthetic. */
export function StatRadar({ stats, size = 280 }: { stats: CardStats; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.34;
  const n = STAT_KEYS.length;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, r: number): [number, number] => [
    cx + Math.cos(angle(i)) * r,
    cy + Math.sin(angle(i)) * r,
  ];
  const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const grid = [0.25, 0.5, 0.75, 1].map((lvl) =>
    poly(STAT_KEYS.map((_, i) => pt(i, R * lvl))),
  );
  const valuePts = STAT_KEYS.map((k, i) => pt(i, R * (stats[k] / 100)));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Six-stat radar">
      {grid.map((g, i) => (
        <polygon key={i} points={g} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      ))}
      {STAT_KEYS.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}

      <polygon
        points={poly(valuePts)}
        fill="rgba(231,194,76,0.18)"
        stroke="var(--gold)"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      {valuePts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={2.5} fill="var(--gold)" />
      ))}

      {STAT_KEYS.map((k, i) => {
        const [lx, ly] = pt(i, R + 22);
        return (
          <text
            key={k}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono), monospace"
            fontSize={11}
            letterSpacing="0.08em"
          >
            <tspan fill="var(--ink-dim)">{STAT_LABELS[k]}</tspan>
            <tspan fill="var(--ink)" fontWeight={700} dx="4">
              {stats[k]}
            </tspan>
          </text>
        );
      })}

      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-display), sans-serif"
        fontSize={30}
        fontWeight={800}
        fill="var(--gold)"
      >
        {overall(stats)}
      </text>
    </svg>
  );
}
