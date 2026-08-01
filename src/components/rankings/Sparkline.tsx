/** Minimal Elo trend line, the row-level miniature of the detail chart. */
export function Sparkline({
  values,
  width = 120,
  height = 28,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const y = (v: number) => height - 2 - ((v - min) / span) * (height - 4);

  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");

  const first = values[0]!;
  const lastV = values[values.length - 1]!;
  const up = lastV >= first;
  const stroke = up ? "var(--signal)" : "var(--danger)";
  const lastX = (values.length - 1) * step;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" style={{ display: "block", width: "100%", height: "auto" }}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={y(lastV)} r={2} fill={stroke} />
    </svg>
  );
}
