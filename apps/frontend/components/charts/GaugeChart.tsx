'use client';

interface GaugeChartProps {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  color?: string;
}

export function GaugeChart({ value, max = 100, size = 120, label, color }: GaugeChartProps) {
  const pct = Math.min(value / max, 1);
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.55;
  const startAngle = -200;
  const sweepAngle = 220;
  const angle = startAngle + sweepAngle * pct;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number, radius: number) => {
    const s = toRad(start);
    const e = toRad(end);
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const large = Math.abs(end - start) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const gaugeColor = color || (pct > 0.7 ? '#10B981' : pct > 0.4 ? '#F59E0B' : '#EF4444');

  return (
    <svg width={size} height={size * 0.75} className="overflow-visible">
      {/* Track */}
      <path d={arcPath(startAngle, startAngle + sweepAngle, r)} fill="none" stroke="#1E293B" strokeWidth={10} strokeLinecap="round" />
      {/* Value arc */}
      <path d={arcPath(startAngle, angle, r)} fill="none" stroke={gaugeColor} strokeWidth={10} strokeLinecap="round" />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r - 6) * Math.cos(toRad(angle))}
        y2={cy + (r - 6) * Math.sin(toRad(angle))}
        stroke={gaugeColor}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={4} fill={gaugeColor} />
      {/* Value text */}
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize={size * 0.14} fontWeight="bold" fill="#F1F5F9">
        {Math.round(value)}
      </text>
      {label && (
        <text x={cx} y={cy + 32} textAnchor="middle" fontSize={size * 0.08} fill="#94A3B8">
          {label}
        </text>
      )}
    </svg>
  );
}
