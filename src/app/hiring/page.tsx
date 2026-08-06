import type { Metadata } from "next";
import Link from "next/link";
import { parseJD } from "@/lib/shortlist/jd";
import { buildShortlist } from "@/lib/shortlist/build";
import { loadPool } from "@/lib/shortlist/pool";
import { HiringClient } from "@/components/hiring/HiringClient";

export const metadata: Metadata = {
  title: "Hire from the pool",
  description:
    "The hiring side of skill.supply. Paste a job description, get five scored candidates matched to that seat, with the evidence behind every number.",
};

// The initial shortlist reads the live pool, so this page must render per
// request rather than freeze at build time. A static build would keep
// showing "no one has opted in yet" forever, even after real opt-ins land.
export const dynamic = "force-dynamic";

const SEED_JD = `Senior Infrastructure Engineer

Own our distributed systems platform. Ship production Rust and Go services,
run the Kubernetes migration, and set technical direction for how we scale
the API. Tests, CI, and documentation matter here.`;

export default async function HiringPage() {
  const initial = buildShortlist(parseJD(SEED_JD), await loadPool());

  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">
        <div className="eyebrow" style={{ color: "var(--signal)" }}>The hiring side of skill.supply</div>
        <h1 className="h2" style={{ marginTop: 12 }}>
          Five scored candidates. <span className="gold-text">One job description.</span>
        </h1>
        <p className="lead" style={{ marginTop: 14, maxWidth: 640 }}>
          <Link href="https://skill.supply" style={{ color: "var(--signal)" }}>skill.supply</Link>{" "}
          makes the supply irresistible and stays free for seekers forever. This is the other
          half: companies paste a real req and get a ranked shortlist scored on demonstrated
          output, not pedigree. Instead of 500 blind applications, five with receipts.
        </p>

        <div style={{ marginTop: 34 }}>
          <HiringClient initial={initial} />
        </div>
      </div>
    </section>
  );
}
