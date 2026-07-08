import type { Legend } from "@/lib/cards/types";
import { STAT_KEYS, STAT_LABELS } from "@/lib/cards/types";
import { overall, tier, initials, ROLE_ABBR } from "@/lib/cards/rating";

/** Presentational FUT-style card. Pure render — wrap in <TiltCard> for motion. */
export function PlayerCard({ legend }: { legend: Legend }) {
  const ovr = overall(legend.stats);
  const t = tier(legend);

  return (
    <article className={`dt-card tier-${t}`}>
      <div className="dt-card__inner">
        <header className="dt-card__top">
          <div className="dt-card__rating">
            <span className="dt-card__ovr">{ovr}</span>
            <span className="dt-card__role">{ROLE_ABBR[legend.role]}</span>
            <span className="dt-card__div" />
            <span className="dt-card__domain">{legend.domain}</span>
          </div>
          <div className="dt-card__badge">
            {t === "icon" ? (
              "ICON"
            ) : (
              <span className="dt-card__live">
                <i />
                {t.toUpperCase()}
              </span>
            )}
          </div>
        </header>

        <div className="dt-card__avatar">
          <span className="dt-card__initials">{initials(legend.name)}</span>
        </div>

        <div className="dt-card__name">{legend.surname}</div>
        <div className="dt-card__sub">
          {legend.name}
          {legend.company ? ` · ${legend.company}` : ""}
        </div>

        <div className="dt-card__stats">
          {STAT_KEYS.map((k) => (
            <div className="dt-card__stat" key={k}>
              <b>{legend.stats[k]}</b>
              <span>{STAT_LABELS[k]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="dt-card__holo" aria-hidden="true" />
    </article>
  );
}
