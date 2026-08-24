# The talent scouts: who finds undervalued people, and what they actually look for

Research compiled 2026-08-24 for darktalent.tech. Every claim below is
sourced to a real, checkable public statement. Where a scout's method
cannot be reproduced by this codebase, that is said plainly rather than
quietly dropped.

Companion to `ECOSYSTEM.md` (the talent trifecta constitution). This file
answers a narrower question: the people who are demonstrably good at
spotting undervalued talent, what specifically do they look at?

## The roster

### Peter Thiel

The canonical case: at PayPal he recruited people who went on to found
YouTube, LinkedIn, Yelp, Affirm, and Yammer, which is about as strong a
track record in talent identification as exists.

- **The contrarian question.** "What important truth do very few people
  agree with you on?" The point is not the answer's correctness. It is
  that a good answer must be both contrarian and right, which filters for
  independent thinking rather than credential-shaped thinking.
- **Zen-like opposites.** Thiel says talent is "very difficult to reduce
  to any single trait" and that he looks for people who are "really
  stubborn and really open-minded" at once. He looks for idiosyncratic
  people with unusual combinations of traits that counterbalance each
  other.
- **The 20th-hire test**, aimed at founders: "Why will the 20th talented
  person join your company when they can get paid way more at Google?"

### Tyler Cowen and Daniel Gross, *Talent* (2022)

The only book-length treatment of this specific problem, and the one
Adam asked about. Cowen is an economist, Gross ran Pioneer (below).

- **"What are the open tabs in your browser right now?"** Their favorite
  question, because it captures intellectual habits, curiosity, and how
  someone spends free time all at once, and because nobody rehearses it,
  so it is hard to fake.
- **"What do you do to train that is comparable to a pianist practicing
  scales?"** Tests for deliberate, structured self-improvement rather
  than accumulated years.
- **Stamina is underrated.** They call evidence of untiring drive "one of
  the great underrated concepts for talent," and ask whether a person has
  an obsession with continual self-improvement.
- **Personality shows on weekends.** What someone does unpaid and
  unwatched is the signal; what they do at work is partly the job.
- Their explicit target is *underrated* talent, and much of the book is
  about getting past your own biases to see it.

### Daniel Gross, Pioneer

Worth separating from the book, because Pioneer is the closest existing
thing to what darktalent.tech is trying to be.

- Founded 2018 as "a search engine for the millions of Lost Einsteins,"
  extraordinarily creative people who have talent but lack opportunity.
  Funded by Marc Andreessen and Stripe.
- **The most revealing question they asked applicants:** "What is
  something weird or unusual you built or did early on in life?"
- Gross's own view is that psychometrics are **probably overrated and not
  that scientific**, which is a useful caution against over-trusting any
  single numeric score, including ours.

### Paul Graham / Y Combinator

- **Relentless resourcefulness** is his named single most important
  quality in a founder: the ability to figure things out when the path is
  unclear. His metaphor is a good running back, "not merely determined,
  but flexible as well."
- **Determination over intelligence.** YC weights determination as the
  top quality, because it is what survives the sea of obstacles.
- Graham is typically **more swayed by his impression of the founders
  than by the idea**.

### Marc Andreessen / a16z

- **Courage and genius, because they cannot be faked.** "Skills can be
  taught, networks can be hacked, but courage and genius cannot be
  faked."
- **Genius shows as navigating the idea maze**: being able to walk you
  through the pivots and dead ends that led to this exact strategy.
- **They want to be argued with**, preferring a founder who explains
  precisely why a suggestion is wrong.
- Founder traits are reported as roughly **90% of the decision**.

### Keith Rabois

- **Barrels and ammunition.** A "barrel" is someone who can take an idea
  from inception all the way to shipped product. Most people are
  ammunition; barrels are the constraint on company velocity.
- **How you spot one:** the person who brings an idea forward, gets the
  team behind it, builds it, and then evaluates the results. His example
  is an intern who solved a problem several high performers had already
  failed at.
- **Barrels are culturally specific.** A barrel at one company may not be
  a barrel at another, which is an argument against a single global
  ranking and for scoring against a named seat.

### Balaji Srinivasan

Already the thesis behind this repo (see `ECOSYSTEM.md` and
`src/lib/discovery/search.ts`): "dark talent," the idea that as more of
the world comes online, undiscovered ability becomes visible outside the
traditional pipeline. This is the *where to look* claim rather than the
*what to look for* claim, and it pairs with, rather than replaces, the
scouts above.

## What they converge on

Stripping out the individual phrasing, the same five things recur:

1. **Output over credentials.** Every one of them discounts pedigree and
   looks for what the person actually did.
2. **Trajectory over level.** Stamina (Cowen/Gross), determination
   (Graham), drive (Andreessen). The slope, not the intercept.
3. **Independent thinking, tested adversarially.** Thiel's contrarian
   question, Andreessen wanting to be argued with, Graham's flexibility.
4. **Unpaid, unwatched behavior is the honest signal.** Browser tabs,
   weekends, the weird thing you built as a kid.
5. **Ownership end to end.** Rabois's barrel, Andreessen's idea maze.
   Not "contributed to" but "carried it".

## Honest mapping to what darktalent actually measures

Current pillars and weights (`src/lib/scoring/weights.ts`, `dts-1.0.0`):
technical 0.30, darkSignal 0.25, trajectory 0.20, alignment 0.15,
influence 0.10.

**Genuinely covered:**

- *Output over credentials* is the whole design. Pedigree is a discount,
  never a credit.
- *Trajectory* is real and directly measured: `trajectory` weights
  velocity at 0.5 (year-over-year commit acceleration), consistency 0.3,
  breadth 0.2. This is the closest thing in the engine to Cowen and
  Gross's stamina.
- *Ownership end to end* is partly covered: `technical` counts original
  repos and merged PRs, and `influence` weights "dependents" at 0.45,
  meaning code other people rely on, over raw followers at 0.20. That is
  a real, deliberate anti-vanity choice and it is the nearest proxy for a
  Rabois barrel that public data allows.

**Not covered, and not coverable by GitHub scraping alone:**

- *Independent thinking.* There is no public-signal proxy for Thiel's
  contrarian question. It requires a conversation.
- *The unpaid, unwatched signal.* Browser tabs and weekend behavior are
  by definition not in a commit history. Weekend commit timing is a weak
  and easily-misread substitute, not the real thing.
- *Courage.* No proxy exists. Andreessen's own claim is that it cannot be
  faked, but it also cannot be scraped.
- *Barrel-ness in a specific culture.* Rabois's point that barrels are
  culturally specific is an argument our `/hiring` shortlist already
  half-answers by scoring against a named seat rather than absolutely,
  but the engine still produces a global `overall` that invites exactly
  the context-free comparison he warns about.

**The structural takeaway.** Nearly every elite talent identifier relies
on signals that are conversational, adversarial, or observed over time.
darktalent's engine sees one slice: demonstrated public technical output.
That slice is real, underused, and defensible, and it is also narrower
than what any of these people actually do. Two honest consequences:

1. The score should keep being presented as a shape, not a verdict. The
   `/scout` page already says this in copy ("This is a shape, not a
   verdict") and that framing is doing real work; it should not be
   quietly dropped as the product grows.
2. The missing half is an interview layer, which is exactly where
   skill.supply sits in `ECOSYSTEM.md`'s loop. The questions above are
   the best available raw material for it. That is a real, specific
   thing the trifecta could build, and it is not built yet.

Gross's own caution belongs here too: he thinks psychometrics are
overrated and not very scientific. He built the closest predecessor to
this product and still says that. The `Placement` table exists precisely
so the engine's predictions can eventually be checked against real
outcomes. Until one placement closes, every number here is an
instrumented opinion.

## Sources

- Thiel, contrarian question and trait combinations:
  https://www.startuparchive.org/p/peter-thiel-on-how-to-identify-great-talent
  and https://www.safegraph.com/blog/why-the-famous-peter-thiel-interview-question-is-so-predictive/
- Cowen and Gross, *Talent* (St. Martin's Press, 2022), on browser tabs,
  scales, stamina, weekends:
  https://www.inc.com/jessica-stillman/hiring-job-interview-question-tyler-cowen.html,
  https://www.city-journal.org/article/spotting-talent,
  https://time.com/charter/6197647/talent-tyler-cowen-daniel-gross/
- Gross on Pioneer and on psychometrics:
  https://www.joincolossus.com/episodes/41971294/gross-finding-undiscovered-talent
  and https://www.forbes.com/sites/jonathanmoed/2019/01/31/this-startup-uncovers-the-worlds-hidden-geniuses-to-solve-global-problems/
- Graham, relentless resourcefulness:
  https://www.ycombinator.com/library/94-be-relentlessly-resourceful
- Andreessen, courage and genius, idea maze:
  https://medium.com/startup-grind/building-bridges-to-the-future-with-marc-andreessen-co-founder-of-a16z-ffd93a713bb6
- Rabois, barrels and ammunition:
  https://www.conordewey.com/blog/barrels-and-ammunition/

## Library status (checked 2026-08-24)

Cowen and Gross's *Talent* is **not** in Adam's library. Two near misses
that are easy to confuse with it:

- `Library/Books/no-pdfs/talent is overrated.md` is Geoff Colvin's
  *Talent Is Overrated*, a different book with a nearly opposite thesis
  (deliberate practice, not innate talent).
- `Library/Books/no-pdfs/goat.md` is Tyler Cowen, but it is *GOAT: Who is
  the Greatest Economist of all Time*, not *Talent*.
