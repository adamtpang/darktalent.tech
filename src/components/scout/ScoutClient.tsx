"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/audit/types";
import { runAudit } from "@/app/scout/actions";
import { IdentityCard } from "./IdentityCard";
import { FullAudit } from "./FullAudit";

interface ExampleChip {
  key: string;
  displayName: string;
}

export function ScoutClient({
  initial,
  examples,
}: {
  initial: AuditResult;
  examples: ExampleChip[];
}) {
  const [handle, setHandle] = useState("");
  const [audit, setAudit] = useState<AuditResult>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  async function audition(value: string) {
    const q = value.trim();
    if (!q) {
      setError("Enter a GitHub handle to audit.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await runAudit(q);
    setLoading(false);
    if (res.ok) {
      setAudit(res.audit);
      setRevealed(false);
    } else {
      setError(res.error);
    }
  }

  return (
    <div>
      <form
        className="scout-form"
        onSubmit={(e) => {
          e.preventDefault();
          audition(handle);
        }}
      >
        <input
          className="scout-input"
          placeholder="a GitHub handle, e.g. torvalds"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          aria-label="GitHub handle"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button className="btn btn-gold" type="submit" disabled={loading}>
          {loading ? "Auditing…" : "Run the audit →"}
        </button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 14 }}>
        <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
          or try a demo card:
        </span>
        {examples.map((ex) => (
          <button
            key={ex.key}
            type="button"
            className="chip"
            onClick={() => {
              setHandle(ex.key);
              audition(ex.key);
            }}
          >
            {ex.displayName}
          </button>
        ))}
      </div>

      {error && (
        <p className="font-mono" style={{ color: "var(--danger)", fontSize: 13, marginTop: 16 }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "minmax(0, 420px) 1fr", gap: 34, alignItems: "start" }} className="scout-layout">
        <div>
          <IdentityCard audit={audit} />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
            onClick={() => setRevealed((v) => !v)}
            aria-expanded={revealed}
          >
            {revealed ? "Hide the private audit" : "🔒 Unlock the full audit (private)"}
          </button>
        </div>

        <div>
          {revealed ? (
            <FullAudit audit={audit} />
          ) : (
            <div
              className="panel"
              style={{
                minHeight: 220,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                color: "var(--ink-dim)",
                background:
                  "radial-gradient(120% 120% at 50% 0%, rgba(231,194,76,0.05), transparent 60%), rgba(255,255,255,0.012)",
              }}
            >
              <div style={{ maxWidth: 340, padding: 20 }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>🔒</div>
                <p style={{ fontSize: 15 }}>
                  The <b style={{ color: "var(--ink)" }}>archetype card</b> is what ships publicly, an identity, never a rank.
                </p>
                <p style={{ fontSize: 13.5, marginTop: 10 }}>
                  The overall, the six-stat radar, and the coaching stay private until{" "}
                  <b style={{ color: "var(--ink)" }}>you</b> unlock them. Because a percentile is a
                  flex for the top decile and a wound for everyone else.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
