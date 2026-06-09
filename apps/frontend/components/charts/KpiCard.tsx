'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  trend?: 'up' | 'down' | 'flat';
  positiveIsGood?: boolean;
  subtitle?: string;
  sparkline?: number[];
  onClick?: () => void;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>();
  const startTime = useRef<number>();
  const startValue = useRef(0);

  useEffect(() => {
    const target = value;
    const start = startValue.current;
    startTime.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - (startTime.current || now);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + (target - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startValue.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

export function KpiCard({
  title, value, change, changeLabel, icon: Icon, iconColor = 'text-primary',
  prefix, suffix, loading, trend, positiveIsGood = true, subtitle, sparkline, onClick
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="kpi-card p-5">
        <div className="skeleton h-3 w-24 mb-3" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  const isPositive = (change ?? 0) > 0;
  const isNegative = (change ?? 0) < 0;
  const trendGood = positiveIsGood ? isPositive : isNegative;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = trendGood ? 'text-success' : isPositive || isNegative ? 'text-danger' : 'text-muted';

  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={cn('kpi-card p-5', onClick && 'cursor-pointer')}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={cn('p-1.5 rounded-lg bg-card/80', iconColor.replace('text-', 'bg-').replace('primary', 'primary/10').replace('success', 'success/10'))}>
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        {prefix && <span className="text-sm text-muted font-medium">{prefix}</span>}
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {typeof numericValue === 'number' && !isNaN(numericValue)
            ? <AnimatedNumber value={numericValue} />
            : value}
        </span>
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </div>

      {subtitle && <p className="text-xs text-muted mb-2">{subtitle}</p>}

      {change !== undefined && (
        <div className={cn('flex items-center gap-1', trendColor)}>
          <TrendIcon className="w-3 h-3" />
          <span className="text-xs font-medium">
            {Math.abs(change).toFixed(1)}% {changeLabel || 'vs last period'}
          </span>
        </div>
      )}

      {sparkline && sparkline.length > 1 && (
        <div className="mt-3 h-8">
          <SparklineMini data={sparkline} color={trendGood ? '#10B981' : '#EF4444'} />
        </div>
      )}
    </motion.div>
  );
}

function SparklineMini({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 100, h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
