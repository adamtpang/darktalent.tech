# Moneyball, studied properly, then applied to darktalent

Research compiled 2026-09-26. Sourced claims only. Companion to
`ECOSYSTEM.md` and `TALENT_SCOUTS.md`.

## 1. What actually happened (not the movie version)

- **The setup.** Oakland lost Giambi, Damon, and Isringhausen ($31.6M a
  year) and had about a $41M payroll. It had to buy what others ignored.
- **The bet.** Paul DePodesta, using Bill James's ideas, bet on on-base
  percentage. Walks were cheap because scouts paid for batting average,
  looks, and "tools."
- **The result.** A record 20-game win streak in 2002 on one of the
  lowest payrolls. They lost the division series to Minnesota.

## 2. The parts the book undersells

- **Pitching won 2002, not walks.** Hudson, Zito, and Mulder combined for
  57 wins. Zito won the Cy Young. Oakland led the league in ERA but was
  only mid-pack in runs.
- **The stars were not Moneyball players.** MVP Miguel Tejada and Eric
  Chavez hit home runs. Hatteberg, the book's hero, was about the 7th-best
  player.
- **The core came from draft picks** earned by losing in the late 1990s.

Lesson: the stat was a real edge, but a smaller one than the story says.
A good system plus a few genuine stars did most of the work.

## 3. The edge was real, then it vanished

Hakes and Sauer (Journal of Economic Perspectives, 2006) tested it.
On-base percentage really was underpaid before the book. Once the idea
spread, salaries corrected and the edge disappeared.

- Boston hired Bill James and won the 2004 World Series.
- Beane moved on to defense. Then catcher framing had its own cycle:
  early adopters won, late adopters caught up, the edge closed.

**Lesson: an inefficiency is a clock, not an asset.** The durable edge is
the process for finding the next one, plus proprietary data others lack.

## 4. The pattern outside baseball

- **Brentford (football).** Owner Matthew Benham built SmartOdds, a
  betting model covering 85,000+ players, and used it to buy low and sell
  high. Example: David Raya bought for about £3M, later valued near £35M.
  Brentford reached the Premier League in 2021 after 74 years away.
- **Google People Analytics.** Laszlo Bock's team found GPA and test
  scores had no correlation with performance except for brand-new grads.
  Brainteasers were "a complete waste of time." Work samples predicted
  best, structured interviews second.

## 5. The warning: Gild already tried this

Gild (founded around 2011) scored developers from GitHub and Stack
Overflow, built a database of 100M+ candidates, and sold to firms like
Facebook and Microsoft. MIT Technology Review covered it in 2013 as "a
startup that scores job seekers, whether they know it or not."

It did not become a big independent company. **Citadel bought it in 2016
to use as its own private hiring tool.**

What that suggests, as a hypothesis, not a proven cause:
- The scoring worked well enough that a sophisticated buyer wanted it.
- Selling scores to many recruiters did not become a large business.
- Scoring people without asking drew privacy criticism from the start.
  `/board` does the same thing, which makes the consent line
  (rank freely, sell only with consent) essential, not decorative.

## 6. Moneyball mapped to darktalent

| Baseball | darktalent today | Status |
| --- | --- | --- |
| Public box scores | Public GitHub data | Done |
| On-base percentage | "Depended on" over followers | A guess, untested |
| Wins to test stats against | Placements | **Zero. The missing piece.** |
| Poor team that must buy cheap | Seed-stage founders | Named, none paying yet |
| Beane's front office acting on it | $500 Shortlist | Live, $0 sold |

## 7. How to actually become Moneyball for tech

1. **Get outcomes before anything else.** Every intro becomes a
   `Placement` row with the score frozen at introduction. Baseball got
   results nightly. Hiring takes months, so start the clock now.
2. **Test, then cut.** At 20 to 30 outcomes, check which pillar predicted
   interviews, hires, and staying. Delete what does not predict.
3. **Own the outcome data, not the stat.** The stat will leak, as OBP
   did. Placements are private and compounding. That is the moat Gild
   never built as an independent company.
4. **Add a work sample.** Google's best predictor was a work sample. It
   is also Pioneer's and Cowen's lesson. A small paid take-home fills the
   gap GitHub cannot see.
5. **Plan for the edge closing.** Keep a list of candidate next
   inefficiencies, the way Beane moved from OBP to defense.
6. **Own some upside, Brentford-style.** A placement fee is one sale.
   Brentford profits from resale. The academy loop in `ECOSYSTEM.md`
   (develop, then place) is the closest version of that.

## 8. Honest bottom line

Moneyball needed wins to prove the stat. darktalent has none. The next
step is not more scoring. It is a first real placement, and one intro to
make it is already drafted and unsent (to `kubkon`).

## Sources

- DePodesta and the 2002 A's: https://en.wikipedia.org/wiki/Paul_DePodesta,
  https://www.shortform.com/blog/paul-depodesta-moneyball/
- What the book undersells: https://pitcherlist.com/moneyball-a-great-baseball-movie-that-betrays-the-stars-of-the-2002-as/,
  https://slate.com/culture/2011/09/moneyball-movie-the-numbers-are-good-but-the-story-is-still-bunk.html
- Hakes and Sauer: https://www.aeaweb.org/articles?id=10.1257%2Fjep.20.3.173
- Edge closing, framing: https://tht.fangraphs.com/pitch-framing-was-doomed-from-the-start/,
  https://neilpaine.substack.com/p/if-billy-beane-is-done-with-baseball
- Brentford: https://analyisport.com/insights/what-can-data-do-for-a-football-club/
- Google: https://signalvnoise.com/posts/3543-google-uses-big-data-to-prove-hiring-puzzles-useless-and-gpas-meaningless
- Gild: https://www.technologyreview.com/2013/03/07/179538/a-startup-that-scores-job-seekers-whether-they-know-it-or-not/,
  https://www.crunchbase.com/acquisition/citadel-acquires-gild--b47f07a1
