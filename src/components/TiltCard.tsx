"use client";

import { useRef } from "react";

/**
 * Pointer-tracking 3D tilt + holographic glare. Sets CSS custom properties
 * (--rx/--ry for rotation, --mx/--my for the glare) that the .dt-card styles
 * consume. The signature "collectible" micro-interaction.
 */
export function TiltCard({
  children,
  max = 9,
}: {
  children: React.ReactNode;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${-(py - 0.5) * max * 2}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ perspective: "900px" }}
    >
      {children}
    </div>
  );
}
