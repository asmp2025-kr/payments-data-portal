'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts';
import { formatNumber } from '@/lib/utils';

interface BarChartProps {
  data: any[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
  height?: number;
  formatY?: (v: number) => string;
  stacked?: boolean;
  horizontal?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 shadow-xl border border-border text-xs">
      <p className="text-muted mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-muted">{p.name}:</span>
          <span className="text-foreground font-semibold">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function BarChartComp({ data, xKey, series, height = 220, formatY, stacked, horizontal }: BarChartProps) {
  const ChartComp = BarChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComp
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" />
        {horizontal ? (
          <>
            <YAxis dataKey={xKey} type="category" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={100} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={formatY || ((v) => formatNumber(v))} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={formatY || ((v) => formatNumber(v))} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: '11px' }} />}
        {series.map(s => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            stackId={stacked ? 'stack' : undefined}
            radius={stacked ? [0, 0, 0, 0] : [3, 3, 0, 0]}
          />
        ))}
      </ChartComp>
    </ResponsiveContainer>
  );
}
