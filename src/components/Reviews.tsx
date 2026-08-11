/**
 * Reviews — the empty-until-real evidence slot, React/Tailwind version.
 * See README.md in this folder. Never seed this with fake reviews.
 *
 * Usage: <Reviews reviews={reviewsJson.reviews} mailto="you@example.com" />
 * Load reviewsJson from a local reviews.json (empty reviews: [] until real ones exist).
 */

export interface Review {
  quote: string;
  author: string;
  context?: string;
  date?: string;
}

export interface ReviewsProps {
  reviews: Review[];
  mailto?: string;
}

export function Reviews({ reviews, mailto }: ReviewsProps) {
  return (
    <section aria-labelledby="reviews-h">
      <h2 id="reviews-h" className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
        Reviews
      </h2>
      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          No reviews yet. Be the first —{" "}
          {mailto ? (
            <a href={`mailto:${mailto}?subject=A review for you`} className="text-primary underline underline-offset-2">
              tell us how it went
            </a>
          ) : (
            "reviews go here once real customers leave them."
          )}
          .
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {reviews.map((r, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <p className="text-sm leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
              <p className="mt-2.5 text-xs text-muted-foreground">
                {[r.author, r.context, r.date].filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
