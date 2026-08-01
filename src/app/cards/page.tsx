import type { Metadata } from "next";
import { CardWall } from "@/components/CardWall";

export const metadata: Metadata = {
  title: "Legends",
  description: "Every legend, rated. Filter the Forbes-tier living and the Founders-canon ICONs.",
};

export default function CardsPage() {
  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="eyebrow">The vault</div>
        <h1 className="h2" style={{ marginTop: 12 }}>
          Every legend, <span className="gold-text">rated.</span>
        </h1>
        <p className="lead" style={{ marginTop: 14, maxWidth: 580 }}>
          Living legends from the Forbes tier. Dead legends from the Founders
          canon, rendered as gold ICONs. Six stats, one number, pedigree not
          included.
        </p>
        <div style={{ marginTop: 38 }}>
          <CardWall />
        </div>
      </div>
    </section>
  );
}
