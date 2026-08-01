import Link from "next/link";
import type { AuditResult } from "@/lib/audit/types";
import { StatRadar } from "@/components/rankings/StatRadar";

/**
 * The PRIVATE face, the mirror the person unlocks for themselves. The overall,
 * the six-stat radar, the five explainable pillars, and honest development
 * levers. Coaching, not a caste label for the timeline.
 */
export function FullAudit({ audit }: { audit: AuditResult }) {
  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <div className="eyebrow" style={{ color: "var(--danger)" }}>🔒 Private · only you see this</div>

      <div className="detail-radar" style={{ marginTop: 20 }}>
        <div style={{ display: "grid", placeItems: "center" }}>
          <StatRadar stats={audit.stats} size={300} />
          <p
            className="font-mono"
            style={{ fontSize: 11, color: "var(--ink-faint)", textAlign: "center", marginTop: 4, lineHeight: 1.6 }}
          >
            <b style={{ color: "var(--ink-dim)" }}>Overall {audit.overall}</b>, one input, not a verdict.
            <br />
            Never printed on the public card.
          </p>
        </div>

        <div>
          <div className="eyebrow" style={{ color: "var(--ink-faint)" }}>The five pillars</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 16 }}>
            {audit.pillars.map((p) => (
              <div key={p.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14.5 }}>{p.label}</span>
                  <span
                    className="font-mono"
                    style={{ fontWeight: 700, fontSize: 16, color: "var(--gold)", fontVariantNumeric: "tabular-nums" }}
                  >
                    {Math.round(p.score)}
                  </span>
                </div>
                <div className="statbar" style={{ marginTop: 6 }}>
                  <span style={{ width: `${Math.round(p.score)}%` }} />
                </div>
                <p style={{ color: "var(--ink-dim)", fontSize: 12.5, marginTop: 6 }}>{p.topFactor}</p>
                <p className="font-mono" style={{ color: "var(--ink-faint)", fontSize: 10.5, marginTop: 3 }}>
                  confidence {Math.round(p.confidence * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* placement, closes the supply → demand loop */}
      <div style={{ marginTop: 26, borderTop: "1px solid var(--line)", paddingTop: 22 }}>
        <div className="eyebrow" style={{ color: "var(--signal)" }}>Placement</div>
        <p style={{ marginTop: 10, fontSize: 15 }}>
          Best-slot fit: <b className="gold-text" style={{ fontWeight: 800 }}>{audit.bestSlot}</b>.{" "}
          {audit.placement.href ? (
            <Link href={audit.placement.href} style={{ color: "var(--signal)" }}>
              {audit.placement.label} →
            </Link>
          ) : (
            <span style={{ color: "var(--ink-dim)" }}>{audit.placement.label}</span>
          )}
        </p>
      </div>

      {/* development areas, levers, not a rejection letter */}
      <div style={{ marginTop: 24, borderTop: "1px solid var(--line)", paddingTop: 22 }}>
        <div className="eyebrow" style={{ color: "var(--ink-faint)" }}>Development areas · three levers</div>
        <div className="two-col" style={{ marginTop: 16, gridTemplateColumns: "repeat(2, 1fr)" }}>
          {audit.developmentAreas.map((d) => (
            <div
              key={d.stat}
              style={{
                border: "1px solid var(--line-2)",
                borderLeft: "3px solid var(--gold-deep)",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <div
                className="font-mono"
                style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)" }}
              >
                {d.stat.toUpperCase()} · {d.slot}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, margin: "8px 0 6px" }}>{d.title}</div>
              <p style={{ color: "var(--ink-dim)", fontSize: 13.5 }}>{d.action}</p>
            </div>
          ))}
        </div>
      </div>

      {audit.dataCaveat && (
        <p
          className="font-mono"
          style={{ marginTop: 20, fontSize: 11, color: "var(--ink-faint)", lineHeight: 1.6 }}
        >
          ⚠ {audit.dataCaveat}
        </p>
      )}
    </div>
  );
}
