/**
 * Proof that the shortlist pipeline discriminates: different JDs must produce
 * different seats and different rankings. Run: npx tsx scripts/shortlist-demo.ts
 */
import { parseJD } from "../src/lib/shortlist/jd";
import { buildShortlist } from "../src/lib/shortlist/build";

const JDS: Record<string, string> = {
  "infra engineer": `Senior Infrastructure Engineer. Own our distributed systems platform.
Ship production Rust and Go services, run the Kubernetes migration, and set
technical direction for how we scale the API. Tests, CI and documentation matter.`,

  "developer relations": `Head of Developer Relations. Grow our community of developers.
You will write docs, run the advocate program, speak at conferences, and own
the content and brand voice for our go to market motion.`,

  "reliability lead": `Staff Site Reliability Engineer. Own on-call, incident response and
the quality of our production operations. You will run the process for
reliability reviews and drive down our incident rate.`,
};

for (const [label, jd] of Object.entries(JDS)) {
  const role = parseJD(jd);
  const list = buildShortlist(role);
  console.log(`\n=== ${label} ===`);
  console.log(`seat: ${role.slot} (${role.primaryStat}) | seniority: ${role.seniority} | confidence: ${role.confidence}`);
  console.log(`matched: ${role.matched.slice(0, 6).join(", ")}`);
  list.entries.forEach((e, i) => {
    console.log(`  ${i + 1}. fit ${e.fit}  ovr ${e.overall}  dark ${e.darkSignal}  ${e.displayName} (${e.archetype})`);
  });
}
