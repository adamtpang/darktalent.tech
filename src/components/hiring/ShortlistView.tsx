import type { Shortlist } from "@/lib/shortlist/types";
import { STAT_KEYS, STAT_LABELS } from "@/lib/cards/types";

/** The sellable artifact, rendered. Five scored candidates matched to one JD. */
export function ShortlistView({ shortlist }: { shortlist: Shortlist }) {
  const { role, entries } = shortlist;

  return (
    <div>
      {/* the parsed read of the role, shown so the buyer can audit it */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ color: "var(--signal)" }}>The seat we read</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "baseline", marginTop: 12 }}>
          <div>
            <div className="font-display" style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>
              {role.title}
            </div>
            <div className="font-mono" style={{ fontSize: 12, color: "var(--ink-dim)", marginTop: 4 }}>
              {role.seniority} · demands {STAT_LABELS[role.primaryStat]} {role.demand[role.primaryStat]}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div className="font-mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>SLOT</div>
            <div className="font-display gold-text" style={{ fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em" }}>
              {role.slot}
            </div>
          </div>
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 12, lineHeight: 1.7 }}>
          Parse confidence {Math.round(role.confidence * 100)}%
          {role.matched.length > 0 && <> · matched on: {role.matched.slice(0, 8).join(", ")}</>}
          {role.matched.length === 0 && <> · no strong signal words found, so this read is a guess. Confirm the seat with the company.</>}
        </div>
      </div>

      {/* the candidates */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.map((e, i) => (
          <div className="panel" key={e.handle} style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div
                className="font-display"
                style={{ fontWeight: 800, fontSize: 15, color: "var(--ink-faint)", minWidth: 22, paddingTop: 6 }}
              >
                {i + 1}
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span className="font-display" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em" }}>
                    {e.displayName}
                  </span>
                  <span className="chip" style={{ pointerEvents: "none" }}>{e.archetype}</span>
                </div>
                <div className="font-mono" style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 3 }}>
                  {e.tagline}
                </div>
                <p style={{ fontSize: 14, color: "var(--ink-dim)", marginTop: 10 }}>{e.whyThisRole}</p>
                <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                  {e.evidence.map((ev, k) => (
                    <li key={k} style={{ fontSize: 12.5, color: "var(--ink-dim)", display: "flex", gap: 8 }}>
                      <span style={{ color: "var(--signal)" }}>+</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ textAlign: "right", minWidth: 130 }}>
                <div className="font-mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", letterSpacing: "0.1em" }}>
                  FIT FOR THIS SEAT
                </div>
                <div
                  className="font-display gold-text"
                  style={{ fontWeight: 800, fontSize: 38, lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}
                >
                  {e.fit}
                </div>
                <div className="font-mono" style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 6 }}>
                  OVR {e.overall} · dark signal {e.darkSignal}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px 8px", marginTop: 10 }}>
                  {STAT_KEYS.map((k) => (
                    <div key={k} className="font-mono" style={{ fontSize: 10, color: "var(--ink-faint)" }}>
                      {STAT_LABELS[k]} <b style={{ color: "var(--ink-dim)" }}>{e.stats[k]}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* honesty block: never claim more than the input supports */}
      <div className="panel" style={{ marginTop: 18, background: "rgba(255,255,255,0.012)" }}>
        <div className="eyebrow" style={{ color: "var(--ink-faint)" }}>What this artifact does not claim</div>
        <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {shortlist.caveats.map((c, i) => (
            <li key={i} className="font-mono" style={{ fontSize: 11.5, color: "var(--ink-faint)", lineHeight: 1.65, display: "flex", gap: 8 }}>
              <span>·</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <div className="font-mono" style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          Pool: {shortlist.poolSize} candidates. {shortlist.poolSource}
        </div>
      </div>
    </div>
  );
}
