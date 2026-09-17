import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { getLegend } from "@/lib/cards/legends";
import type { Legend } from "@/lib/cards/types";
import { PlayerCard } from "@/components/PlayerCard";
import { TiltCard } from "@/components/TiltCard";
import { Reviews } from "@/components/Reviews";
import reviewsData from "@/lib/reviews.json";

// Explicit absolute canonical for the homepage. Scoped here rather than in
// the root layout so it doesn't get inherited by /scout, /hiring, /rankings,
// etc. (those would each wrongly canonicalize to "/" otherwise).
export const metadata: Metadata = {
  alternates: { canonical: SITE },
};

// E19 perfection pass, 2026-09-17. The page had 993 visible words, 38 links
// and buttons, three hero buttons, a marquee, a 15-row table, three panels,
// a 12-card wall, a six-cell stats grid and two more boxed calls to action.
// One headline, one sentence, one action, three still cards, one thesis line,
// one card offer, one row of links. Everything deleted still exists on its own
// route (/rankings, /cards, /squad, /scout).

const pick = (ids: string[]) => ids.map(getLegend).filter(Boolean) as Legend[];
const heroCards = pick(["jobs", "musk", "ramanujan"]);
const HERO_LAYOUT = [
  { left: "34%", top: "2%", z: 3, rot: "-7deg", w: 230 },
  { left: "2%", top: "20%", z: 2, rot: "-2deg", w: 205 },
  { left: "60%", top: "26%", z: 1, rot: "8deg", w: 205 },
];

export default function Home() {
  return (
    <>
      <section className="section" style={{ paddingTop: 72, paddingBottom: 72 }}>
        <div className="wrap hero-grid">
          <div>
            <h1 className="h-title">
              Hire the <span className="gold-text">1729</span> hiding in plain sight.
            </h1>
            <p className="lead" style={{ marginTop: 22, maxWidth: 480 }}>
              Paste a real req. Get five scored candidates for that seat, with the evidence behind every number.
            </p>
            <div style={{ display: "grid", justifyItems: "start", gap: 8, marginTop: 30 }}>
              <Link href="/hiring" className="btn btn-gold" style={{ minHeight: 48 }}>Build a shortlist</Link>
              <a
                href="https://buy.stripe.com/dRmaEX9340OhcME6KtaMU1F"
                target="_blank"
                rel="noopener noreferrer"
                className="quiet-link"
              >
                Buy a shortlist, $500
              </a>
            </div>
            <div style={{ marginTop: 40, maxWidth: 480 }}>
              <Reviews reviews={reviewsData.reviews} mailto="adamtpang@gmail.com" />
            </div>
          </div>

          <div className="hero-cards">
            {heroCards.map((l, i) => {
              const layout = HERO_LAYOUT[i]!;
              return (
                <div
                  key={l.id}
                  style={{
                    position: "absolute",
                    left: layout.left,
                    top: layout.top,
                    width: layout.w,
                    zIndex: layout.z,
                    transform: `rotate(${layout.rot})`,
                  }}
                >
                  <TiltCard>
                    <PlayerCard legend={l} />
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="h2" style={{ maxWidth: 720 }}>
            Talent is everywhere. Opportunity isn't.
          </h2>
          <p className="lead" style={{ marginTop: 16, maxWidth: 640 }}>
            Legacy filters reward pedigree. The engine scores what a person has actually built.
          </p>
        </div>
      </section>

      <section className="section" id="card" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 40 }}>
            <h2 className="h2">
              Get your <span className="gold-text">card.</span>
            </h2>
            <p className="lead" style={{ marginTop: 14, maxWidth: 520 }}>
              Enter a GitHub handle. The engine reads its real signal and you get an archetype card to post.
            </p>
            <Link href="/scout" className="btn btn-ghost" style={{ marginTop: 24 }}>
              Get your card
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <nav aria-label="More" className="font-mono" style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 13 }}>
            <Link href="/rankings" className="quiet-link">Live rankings</Link>
            <Link href="/cards" className="quiet-link">All legends</Link>
            <Link href="/squad" className="quiet-link">Squad builder</Link>
          </nav>
        </div>
      </section>
    </>
  );
}
