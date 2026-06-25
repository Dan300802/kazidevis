"use client";
interface LineChartProps { data: { label: string; value: number }[]; height?: number; color?: string; }
export function LineChart({ data, height = 100, color = "#16A34A" }: LineChartProps) {
  if (data.length < 2) return null;
  const W = 320; const H = height; const PAD = 8;
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const minV = Math.min(...data.map((d) => d.value), 0);
  const range = maxV - minV || 1;
  const pts = data.map((d, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((d.value - minV) / range) * (H - PAD * 2 - 14),
    ...d,
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0].x},${H} ` + pts.map((p) => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length-1].x},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: "100%", height: H + 20 }}>
      <defs>
        <linearGradient id="lineg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lineg)" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="#fff" stroke={color} strokeWidth="2" />
          <text x={p.x} y={H + 14} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="Inter,sans-serif">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}
