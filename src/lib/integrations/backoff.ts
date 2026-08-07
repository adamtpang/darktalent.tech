/**
 * Backoff for GitHub's rate limits.
 *
 * GitHub has two distinct limits that show up as failures: the primary limit
 * (x-ratelimit-remaining hits 0, resets at x-ratelimit-reset) and the
 * secondary/abuse limit (a 403 with "secondary rate limit" in the message,
 * often with a retry-after header, triggered by request bursts even under
 * the primary budget). Both are worth retrying; neither should be treated
 * like a real error (a 404 for a bad handle should fail immediately, not
 * retry into the same wrong answer three times slower).
 */

interface OctokitLikeError {
  status?: number;
  message?: string;
  response?: { headers?: Record<string, string | undefined> };
}

export function isRateLimitError(e: unknown): boolean {
  const err = e as OctokitLikeError;
  if (!err || typeof err !== "object") return false;
  if (err.status !== 403 && err.status !== 429) return false;
  const msg = (err.message ?? "").toLowerCase();
  if (msg.includes("rate limit") || msg.includes("abuse")) return true;
  if (err.response?.headers?.["retry-after"]) return true;
  if (err.response?.headers?.["x-ratelimit-remaining"] === "0") return true;
  return false;
}

/** Milliseconds to wait before the next attempt, preferring what GitHub told us. */
function delayFor(e: unknown, attempt: number): number {
  const err = e as OctokitLikeError;
  const headers = err.response?.headers ?? {};

  const retryAfter = headers["retry-after"];
  if (retryAfter) return Number(retryAfter) * 1000 + jitter();

  const reset = headers["x-ratelimit-reset"];
  if (reset) {
    const ms = Number(reset) * 1000 - Date.now();
    if (ms > 0) return ms + jitter();
  }

  // No precise signal: exponential backoff with jitter. 2s, 4s, 8s...
  return 2 ** attempt * 1000 + jitter();
}

function jitter(): number {
  return Math.floor(Math.random() * 500);
}

export interface BackoffOptions {
  maxAttempts?: number;
  /** Cap a single wait, so a bad retry-after header can't stall a whole run. */
  maxDelayMs?: number;
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

/**
 * Run fn(), retrying only on rate-limit-shaped errors. Any other error
 * (a real 404, a malformed query) rethrows immediately on first failure.
 */
export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: BackoffOptions = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const maxDelayMs = opts.maxDelayMs ?? 30_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (!isRateLimitError(e) || attempt === maxAttempts) throw e;
      const delay = Math.min(delayFor(e, attempt), maxDelayMs);
      opts.onRetry?.(attempt, delay, e);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  // Unreachable: the loop always returns or throws.
  throw new Error("withBackoff: exhausted attempts");
}
