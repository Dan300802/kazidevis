"use client";
interface Segment { label: string; value: number; color: string; }
export function DonutChart({ segments, size = 120 }: { segments: Segment[]; size?: number }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;
  const cx = size / 2; const cy = size / 2; const R = size * 0.38; const r = size * 0.24;
  let angle = -Math.PI / 2;
  const arcs = segments.map((seg) => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle); const y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle); const y2 = cy + R * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const xi1 = cx + r * Math.cos(angle - sweep); const yi1 = cy + r * Math.sin(angle - sweep);
    const xi2 = cx + r * Math.cos(angle);          const yi2 = cy + r * Math.sin(angle);
    return { ...seg, path: `M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${xi2},${yi2} A${r},${r},0,${large},0,${xi1},${yi1} Z`, pct: Math.round((seg.value / total) * 100) };
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} />)}
      <circle cx={cx} cy={cy} r={r - 2} fill="#fff" />
    </svg>
  );
}
