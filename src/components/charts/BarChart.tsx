"use client";
interface BarChartProps {
  data: { label: string; value: number; value2?: number }[];
  height?: number;
  color?: string;
  color2?: string;
  formatValue?: (v: number) => string;
}
export function BarChart({ data, height = 120, color = "#16A34A", color2 = "#FBBF24", formatValue }: BarChartProps) {
  const maxVal = Math.max(...data.flatMap((d) => [d.value, d.value2 ?? 0]), 1);
  const W = 320; const H = height; const PAD = 20; const BAR_AREA = H - PAD;
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: "100%", height: H + 20 }}>
        {data.map((d, i) => {
          const colW  = W / data.length;
          const has2  = d.value2 !== undefined;
          const barW  = has2 ? colW * 0.34 : colW * 0.55;
          const gap   = has2 ? colW * 0.04 : 0;
          const xBase = i * colW + (colW - (has2 ? barW * 2 + gap : barW)) / 2;
          const h1    = Math.max((d.value  / maxVal) * BAR_AREA, 2);
          const h2    = has2 ? Math.max(((d.value2 ?? 0) / maxVal) * BAR_AREA, 2) : 0;
          const isMax = d.value === Math.max(...data.map((x) => x.value));
          return (
            <g key={i}>
              <rect x={xBase} y={H - h1} width={barW} height={h1} rx={3} fill={isMax ? color : color + "88"} />
              {has2 && <rect x={xBase + barW + gap} y={H - h2} width={barW} height={h2} rx={3} fill={color2 + "cc"} />}
              <text x={i * colW + colW / 2} y={H + 14} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="Inter,sans-serif">{d.label}</text>
              {isMax && formatValue && (
                <text x={xBase + barW / 2} y={H - h1 - 4} textAnchor="middle" fontSize={8} fill={color} fontFamily="Inter,sans-serif" fontWeight="bold">{formatValue(d.value)}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
