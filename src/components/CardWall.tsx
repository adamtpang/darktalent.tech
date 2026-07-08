"use client";

import { useMemo, useState } from "react";
import { LEGENDS } from "@/lib/cards/legends";
import { overall } from "@/lib/cards/rating";
import type { Domain } from "@/lib/cards/types";
import { PlayerCard } from "./PlayerCard";
import { TiltCard } from "./TiltCard";

const CATS = ["All", "ICONs", "Living"] as const;
const DOMAINS: ("All" | Domain)[] = [
  "All",
  "Tech",
  "Business",
  "Finance",
  "Industry",
  "Science",
  "Creative",
];

export function CardWall() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [domain, setDomain] = useState<"All" | Domain>("All");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return LEGENDS.filter((l) => {
      if (cat === "ICONs" && l.status !== "dead") return false;
      if (cat === "Living" && l.status !== "living") return false;
      if (domain !== "All" && l.domain !== domain) return false;
      if (q && !`${l.name} ${l.company ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    }).sort((a, b) => overall(b.stats) - overall(a.stats));
  }, [cat, domain, q]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATS.map((c) => (
            <button key={c} className="chip" data-active={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
          <span style={{ width: 1, background: "var(--line-2)", margin: "0 4px" }} />
          {DOMAINS.map((d) => (
            <button
              key={d}
              className="chip"
              data-active={domain === d}
              onClick={() => setDomain(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search legends…"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--line-2)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--ink)",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            minWidth: 220,
            outline: "none",
          }}
        />
      </div>

      <div
        className="font-mono"
        style={{ color: "var(--ink-faint)", fontSize: 12, marginBottom: 18 }}
      >
        {list.length} {list.length === 1 ? "card" : "cards"}
      </div>

      {list.length === 0 ? (
        <p style={{ color: "var(--ink-dim)", padding: "40px 0" }}>No legends match that filter.</p>
      ) : (
        <div className="card-grid">
          {list.map((l, i) => (
            <div key={l.id} className="rise" style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}>
              <TiltCard>
                <PlayerCard legend={l} />
              </TiltCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
