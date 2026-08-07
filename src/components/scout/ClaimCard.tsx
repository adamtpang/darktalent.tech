"use client";

import { useState } from "react";
import { claimCard } from "@/app/scout/actions";

/**
 * The self-serve claim button on your own /scout lookup. This is the missing
 * piece skill.supply's opt-in didn't cover: someone who lands here directly
 * (say, from an invite) never having gone through a career report at all.
 * Same-origin, so no CORS, and the handle is already known, so it's one
 * click, not a form.
 */
export function ClaimCard({ handle }: { handle: string }) {
  const [contact, setContact] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [overall, setOverall] = useState<number | null>(null);

  async function submit() {
    setStatus("submitting");
    setError(null);
    const res = await claimCard(handle, contact);
    if (res.ok) {
      setOverall(res.overall);
      setStatus("done");
    } else {
      setError(res.error);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="panel" style={{ marginTop: 14, borderColor: "rgba(94,234,212,0.35)" }}>
        <p style={{ fontSize: 14.5 }}>
          <b style={{ color: "var(--signal)" }}>Claimed.</b> @{handle} scored{" "}
          <b>{Math.round(overall ?? 0)}</b>, from your real public GitHub. Companies searching for
          your shape of work can find you now. Free, always, revoke any time by emailing{" "}
          <a href="mailto:adamtpang@gmail.com" style={{ color: "var(--signal)" }}>
            adamtpang@gmail.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ marginTop: 14 }}>
      <p style={{ fontSize: 14.5, color: "var(--ink-dim)" }}>
        This is your real, public GitHub. <b style={{ color: "var(--ink)" }}>Claim it</b> and
        companies looking for your shape of work can find you. Free forever, you choose
        what&rsquo;s visible, leave any time.
      </p>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, fontSize: 12.5, color: "var(--ink-faint)" }}>
        <input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} disabled={status === "submitting"} />
        Let companies contact me directly, not just see the score
      </label>
      <button
        type="button"
        className="btn btn-gold"
        style={{ marginTop: 12 }}
        onClick={submit}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Claiming…" : `Claim @${handle}'s card →`}
      </button>
      {status === "error" && error && (
        <p className="font-mono" style={{ color: "var(--danger)", fontSize: 12.5, marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
