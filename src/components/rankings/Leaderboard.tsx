"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LeaderRow } from "@/lib/rankings/model";
import { initials, ROLE_ABBR } from "@/lib/cards/rating";
import { fmtNetWorth, tierFromOverall, flagOf, isoOf } from "@/lib/rankings/format";
import { Sparkline } from "./Sparkline";

const DOMAINS = ["Tech", "Business", "Finance", "Industry", "Science", "Creative"] as const;

type SortKey = "elo" | "move" | "networth" | "name";

function Move({ m }: { m: number }) {
  if (m > 0) return <span className="lb-up">▲{m}</span>;
  if (m < 0) return <span className="lb-down">▼{-m}</span>;
  return <span className="lb-flat">—</span>;
}

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "elo", dir: "desc" });
  const [domains, setDomains] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  function clickHeader(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );
  }
  function toggleDomain(d: string) {
    setDomains((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  }

  const view = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (domains.size && !domains.has(r.domain)) return false;
      if (ql && !`${r.name} ${r.industry} ${r.country}`.toLowerCase().includes(ql)) return false;
      return true;
    });
    const { key, dir } = sort;
    list = [...list].sort((a, b) => {
      let d = 0;
      if (key === "elo") d = a.elo - b.elo;
      else if (key === "move") d = a.move - b.move;
      else if (key === "networth") d = a.netWorthB - b.netWorthB;
      else d = a.surname.localeCompare(b.surname);
      return dir === "asc" ? d : -d;
    });
    return list;
  }, [rows, sort, domains, q]);

  const caret = (key: SortKey) => (sort.key === key ? (sort.dir === "asc" ? " ▴" : " ▾") : "");
  const sortLabel = (key: SortKey, name: string) =>
    sort.key === key ? `${name}, sorted ${sort.dir === "asc" ? "ascending" : "descending"}` : `Sort by ${name}`;

  return (
    <div>
      {/* filter bar */}
      <div className="lb-filters">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button className="chip" data-active={domains.size === 0} aria-pressed={domains.size === 0} onClick={() => setDomains(new Set())}>
            All
          </button>
          {DOMAINS.map((d) => (
            <button key={d} className="chip" data-active={domains.has(d)} aria-pressed={domains.has(d)} onClick={() => toggleDomain(d)}>
              {d}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, industry, country…"
          className="lb-search"
          aria-label="Search builders"
        />
      </div>

      <div className="font-mono" style={{ color: "var(--ink-faint)", fontSize: 12, margin: "14px 2px 10px" }}>
        {view.length} builders{domains.size ? " · filtered" : ""}
      </div>

      {/* table */}
      <div className="lb">
        <div className="lb-head">
          <span className="lb-c-rank">#</span>
          <button className="lb-h" data-active={sort.key === "move"} aria-label={sortLabel("move", "7-day movement")} onClick={() => clickHeader("move")}>
            7D{caret("move")}
          </button>
          <span className="lb-c-builder">Builder</span>
          <button className="lb-h lb-c-elo" data-active={sort.key === "elo"} aria-label={sortLabel("elo", "Elo")} onClick={() => clickHeader("elo")}>
            Elo{caret("elo")}
          </button>
          <button className="lb-h lb-c-worth" data-active={sort.key === "networth"} aria-label={sortLabel("networth", "net worth")} onClick={() => clickHeader("networth")}>
            Net worth{caret("networth")}
          </button>
          <span className="lb-c-domain">Domain</span>
          <span className="lb-c-country">•</span>
          <span className="lb-c-spark">30D</span>
        </div>

        {view.map((r) => (
          <Link key={r.id} href={`/p/${r.id}`} className="lb-row">
            <span className="lb-c-rank">
              <span className="lb-rank" data-top={r.rank <= 3}>
                <i>#</i>
                {r.rank}
              </span>
            </span>
            <span className="lb-c-move">
              <Move m={r.move} />
            </span>
            <span className="lb-c-builder">
              <span className="lb-mono" data-tier={tierFromOverall(r.overall)}>
                {initials(r.name)}
              </span>
              <span className="lb-name">
                <b>{r.surname}</b>
                <em>
                  {ROLE_ABBR[r.role]} · {r.industry}
                </em>
              </span>
            </span>
            <span className="lb-c-elo lb-elo">{r.elo}</span>
            <span className="lb-c-worth lb-worth" title={`$${r.netWorthB}B`}>
              {fmtNetWorth(r.netWorthB)}
            </span>
            <span className="lb-c-domain lb-domain">
              <i data-domain={r.domain} />
              {r.domain}
            </span>
            <span className="lb-c-country" title={r.country}>
              <span style={{ fontSize: 14 }}>{flagOf(r.country)}</span> {isoOf(r.country)}
            </span>
            <span className="lb-c-spark">
              <Sparkline values={r.spark} />
            </span>
          </Link>
        ))}

        {view.length === 0 && (
          <p style={{ color: "var(--ink-dim)", padding: "32px 4px" }}>No builders match those filters.</p>
        )}
      </div>
    </div>
  );
}
