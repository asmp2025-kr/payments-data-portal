'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber } from '@/lib/utils';

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, height = 200, innerRadius = 55, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 25}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="glass-card p-2 text-xs border border-border">
                <p className="text-foreground font-medium">{p.name}</p>
                <p className="text-muted">{formatNumber(p.value as number)} ({((p.value as number / total) * 100).toFixed(1)}%)</p>
              </div>
            );
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
        />
        {centerLabel && (
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-muted text-xs">
            {centerLabel}
          </text>
        )}
        {centerValue && (
          <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-sm font-bold">
            {centerValue}
          </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
