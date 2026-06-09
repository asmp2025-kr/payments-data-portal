'use client';

import {
  AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatNumber } from '@/lib/utils';

interface AreaChartProps {
  data: any[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
  height?: number;
  formatY?: (v: number) => string;
  formatTooltip?: (v: number) => string;
  stacked?: boolean;
}

const CustomTooltip = ({ active, payload, label, formatTooltip }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 shadow-xl border border-border text-xs">
      <p className="text-muted mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name}:</span>
          <span className="text-foreground font-semibold">{formatTooltip ? formatTooltip(p.value) : formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function AreaChart({ data, xKey, series, height = 220, formatY, formatTooltip, stacked }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
          tickFormatter={formatY || ((v) => formatNumber(v))} />
        <Tooltip content={<CustomTooltip formatTooltip={formatTooltip} />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: '11px' }} />}
        {series.map(s => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            stackId={stacked ? 'stack' : undefined}
            dot={false}
            activeDot={{ r: 4, stroke: s.color, strokeWidth: 2, fill: '#0F172A' }}
          />
        ))}
      </ReAreaChart>
    </ResponsiveContainer>
  );
}
