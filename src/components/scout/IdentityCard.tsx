import type { AuditResult } from "@/lib/audit/types";

const ARROW: Record<AuditResult["trajectory"]["dir"], string> = {
  rising: "▲",
  steady: "→",
  cooling: "▽",
};

/**
 * The PUBLIC face of an audit — an identity object, not a verdict.
 * No overall number, no tier word: an archetype is a role, not a rung, so this
 * is shareable by the median builder, not just the top decile.
 */
export function IdentityCard({ audit }: { audit: AuditResult }) {
  const showName = audit.displayName && audit.displayName !== `@${audit.handle}`;
  return (
    <article className="idcard">
      <div className="idcard__foil" />
      <div className="idcard__lab">Archetype</div>
      <h3 className="idcard__arche">{audit.archetype}</h3>

      <div className="idcard__who">
        {showName && <b>{audit.displayName}</b>}
        <span>@{audit.handle}</span>
      </div>
      <div className="idcard__tag">{audit.tagline}</div>
      {audit.playsLike && <div className="idcard__plays">Plays like {audit.playsLike}.</div>}

      <div className="strengths">
        {audit.strengths.map((s, i) => (
          <div className="strength" key={i}>
            <i>{s.icon}</i>
            <span>{s.text}</span>
          </div>
        ))}
      </div>

      <div className={`traj-chip traj-${audit.trajectory.dir}`}>
        <span className="ar">{ARROW[audit.trajectory.dir]}</span>
        <span className="tl">{audit.trajectory.label}</span>
      </div>

      <div className="stamp">{audit.scopeNote} This is a shape, not a verdict.</div>
    </article>
  );
}
