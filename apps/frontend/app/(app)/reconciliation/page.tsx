'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, CheckCircle2, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface ReconRecord {
  ref: string;
  source_amount: number;
  target_amount: number;
  variance: number;
  status: string;
  break_reason: string;
  aged_days: number;
  recon_date: string;
}

const reconColumns: ColumnDef<ReconRecord>[] = [
  { accessorKey: 'ref', header: 'Reference' },
  { accessorKey: 'source_amount', header: 'Source Amount', cell: ({ getValue }) => formatCurrency(getValue() as number) },
  { accessorKey: 'target_amount', header: 'Target Amount', cell: ({ getValue }) => formatCurrency(getValue() as number) },
  {
    accessorKey: 'variance', header: 'Variance',
    cell: ({ getValue }) => {
      const v = getValue() as number;
      return <span className={v === 0 ? 'text-success' : 'text-danger font-medium'}>{formatCurrency(Math.abs(v))}</span>;
    }
  },
  { accessorKey: 'break_reason', header: 'Break Reason' },
  { accessorKey: 'aged_days', header: 'Age (days)', cell: ({ getValue }) => <span className={Number(getValue()) > 5 ? 'text-danger' : Number(getValue()) > 2 ? 'text-warning' : 'text-success'}>{getValue() as number}d</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={statusBadgeClass(getValue() as string)}>{getValue() as string}</span> },
];

export default function ReconciliationDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<ReconRecord[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.reconciliation.summary(params),
      api.reconciliation.breaks({ ...params, limit: 20 }),
      api.reconciliation.trend(params),
    ]).then(([s, r, t]) => {
      setSummary(s.data);
      setRecords(r.data || []);
      setTrend(t.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Matched Records', value: Number(summary?.matched_count || 0), icon: CheckCircle2, iconColor: 'text-success', subtitle: 'Successfully reconciled' },
    { title: 'Open Breaks', value: Number(summary?.break_count || 0), icon: GitCompare, iconColor: 'text-danger', subtitle: 'Unmatched items', positiveIsGood: false },
    { title: 'Total Variance', value: Number(summary?.total_variance || 0), prefix: '$', icon: DollarSign, iconColor: 'text-warning', subtitle: 'Sum of all variances', positiveIsGood: false },
    { title: 'Match Rate', value: Number(summary?.match_rate || 0), suffix: '%', icon: CheckCircle2, iconColor: 'text-success', subtitle: 'Reconciliation rate' },
    { title: 'Aged Items', value: Number(summary?.aged_items || 0), icon: Clock, iconColor: 'text-danger', subtitle: 'Over 5 days old', positiveIsGood: false },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Reconciliation Dashboard</h1>
        <p className="page-subtitle">Break analysis and reconciliation status · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Reconciliation Trend</h3>
          <p className="text-xs text-muted mb-4">Daily matched vs. breaks</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={trend} xKey="date" series={[
              { key: 'matched', name: 'Matched', color: '#10B981' },
              { key: 'breaks', name: 'Breaks', color: '#EF4444' },
            ]} formatY={formatNumber} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Break by Reason</h3>
          <p className="text-xs text-muted mb-4">Distribution of break causes</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <DonutChart data={[
              { name: 'Timing', value: Number(summary?.timing_breaks || 0), color: '#F59E0B' },
              { name: 'Amount', value: Number(summary?.amount_breaks || 0), color: '#EF4444' },
              { name: 'Missing', value: Number(summary?.missing_breaks || 0), color: '#8B5CF6' },
              { name: 'Duplicate', value: Number(summary?.duplicate_breaks || 0), color: '#06B6D4' },
            ]} centerLabel="Breaks" centerValue={formatNumber(summary?.break_count || 0)} />
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Aged Item Distribution</h3>
          <p className="text-xs text-muted mb-4">Breaks by aging bucket</p>
          {loading ? <div className="skeleton h-[200px]" /> : (
            <BarChartComp data={[
              { bucket: '0-1 days', count: summary?.aged_0_1 || 0 },
              { bucket: '2-5 days', count: summary?.aged_2_5 || 0 },
              { bucket: '6-10 days', count: summary?.aged_6_10 || 0 },
              { bucket: '10+ days', count: summary?.aged_10_plus || 0 },
            ]} xKey="bucket" series={[{ key: 'count', name: 'Items', color: '#F59E0B' }]} height={200} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Open Breaks</h3>
          <p className="text-xs text-muted mb-4">Unmatched items requiring resolution</p>
          <DataTable data={records} columns={reconColumns} loading={loading} pageSize={5} />
        </motion.div>
      </div>
    </div>
  );
}
