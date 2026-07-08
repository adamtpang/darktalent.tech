import type { Metadata } from "next";
import Link from "next/link";
import { PlayerCard } from "@/components/PlayerCard";
import { TiltCard } from "@/components/TiltCard";
import { INTEL, AMD, type Club } from "@/lib/orgs/duel";

export const metadata: Metadata = {
  title: "Intel ↔ AMD — the duel",
  description:
    "Sensible Transfers, companies edition: the fallen giant vs the perfect signing. A rival card duel — illustrative, not measured.",
};

function sparkPoints(values: number[], w: number, h: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const stepX = w / (values.length - 1);
  return values
    .map((v, i) => `${(i * stepX).toFixed(1)},${(h - ((v - min) / span) * h).toFixed(1)}`)
    .join(" ");
}

function FormSpark({ club }: { club: Club }) {
  const color = club.trend === "down" ? "var(--danger)" : "var(--signal)";
  return (
    <svg width="120" height="34" viewBox="0 0 120 34" fill="none" aria-hidden="true">
      <polyline
        points={sparkPoints(club.form, 118, 30)}
        transform="translate(1,2)"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClubMeta({ club, win }: { club: Club; win?: boolean }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className="font-mono" style={{ fontSize: 13, color: "var(--ink-dim)" }}>{club.ticker}</span>
        <FormSpark club={club} />
        <span
          className="chip"
          style={{
            pointerEvents: "none",
            color: club.trend === "down" ? "var(--danger)" : "var(--signal)",
            borderColor: club.trend === "down" ? "rgba(251,113,133,0.35)" : "rgba(94,234,212,0.35)",
          }}
        >
          {club.formLabel}
        </span>
      </div>
      <p style={{ color: "var(--ink-dim)", fontSize: 14, marginTop: 12, lineHeight: 1.55 }}>
        {win ? (
          <span className="gold-text" style={{ fontWeight: 700 }}>The signing that worked. </span>
        ) : (
          <span style={{ color: "var(--danger)", fontWeight: 700, fontFamily: "var(--font-mono), monospace", fontSize: 12, letterSpacing: "0.06em" }}>
            GAP: BUILD ·{" "}
          </span>
        )}
        {club.diagnosis}
      </p>
    </div>
  );
}

export default function DuelPage() {
  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="eyebrow">Sensible Transfers · companies edition</div>
        <h1 className="h2" style={{ marginTop: 12 }}>
          Intel <span style={{ color: "var(--ink-faint)" }}>↔</span> AMD — <span className="gold-text">the duel.</span>
        </h1>
        <p className="lead" style={{ marginTop: 14, maxWidth: 640 }}>
          People don't share org diagnoses — they share cards and pick sides. This one pairing is the whole
          thesis in a frame: the <strong style={{ color: "var(--ink)" }}>fallen giant</strong> vs the{" "}
          <strong style={{ color: "var(--ink)" }}>perfect signing</strong> that relegated it — and it comes
          with a built-in tribe ($INTC bears, $AMD bulls).
        </p>

        <div className="vs-arena" style={{ marginTop: 44 }}>
          <div className="vs-side">
            <div style={{ width: "100%", maxWidth: 236, margin: "0 auto" }}>
              <TiltCard>
                <PlayerCard legend={INTEL.legend} />
              </TiltCard>
            </div>
          </div>
          <div className="vs-seal gold-text">VS</div>
          <div className="vs-side" data-state="win">
            <div style={{ width: "100%", maxWidth: 236, margin: "0 auto" }}>
              <TiltCard>
                <PlayerCard legend={AMD.legend} />
              </TiltCard>
            </div>
          </div>
        </div>

        <div className="two-col" style={{ marginTop: 20, gridTemplateColumns: "1fr 1fr" }}>
          <ClubMeta club={INTEL} />
          <ClubMeta club={AMD} win />
        </div>

        <div
          className="panel"
          style={{
            marginTop: 40,
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              "radial-gradient(120% 120% at 100% 0%, rgba(94,234,212,0.06), transparent 55%), rgba(255,255,255,0.018)",
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: "var(--signal)" }}>Close the loop</div>
            <p style={{ marginTop: 10, fontSize: 15, maxWidth: 460, color: "var(--ink-dim)" }}>
              Intel's gap is <b style={{ color: "var(--ink)" }}>BUILD</b>. See a real, consented builder whose
              audited shape fills exactly that slot.
            </p>
          </div>
          <Link href="/scout" className="btn btn-gold">Audit a builder →</Link>
        </div>

        <p className="font-mono" style={{ color: "var(--ink-faint)", fontSize: 11, marginTop: 24, lineHeight: 1.7, maxWidth: 720 }}>
          ⚠ Illustrative, not measured. Company org stats can't be computed by the scoring engine — these are
          editorial ratings for the "Sensible Transfers" format. Real, computed scores are reserved for
          consented individuals with real public code (see <Link href="/scout" style={{ color: "var(--gold)" }}>Scout</Link>).
        </p>
      </div>
    </section>
  );
}
