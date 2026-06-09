'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, ArrowUpDown, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Position {
  participant_code: string;
  participant_name: string;
  gross_debit: number;
  gross_credit: number;
  net_position: number;
  currency: string;
}

const positionColumns: ColumnDef<Position>[] = [
  { accessorKey: 'participant_code', header: 'Code' },
  { accessorKey: 'participant_name', header: 'Participant' },
  { accessorKey: 'gross_debit', header: 'Debit', cell: ({ getValue }) => formatCurrency(getValue() as number) },
  { accessorKey: 'gross_credit', header: 'Credit', cell: ({ getValue }) => formatCurrency(getValue() as number) },
  {
    accessorKey: 'net_position', header: 'Net Position',
    cell: ({ getValue }) => {
      const v = getValue() as number;
      return <span className={v >= 0 ? 'text-success font-medium' : 'text-danger font-medium'}>{formatCurrency(v)}</span>;
    }
  },
  { accessorKey: 'currency', header: 'CCY' },
];

export default function SettlementDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.settlement.summary(params),
      api.settlement.positions(params),
      api.settlement.trend(params),
    ]).then(([s, p, t]) => {
      setSummary(s.data);
      setPositions(p.data || []);
      setTrend(t.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Total Settlements', value: Number(summary?.total_settlements || 0), icon: Landmark, iconColor: 'text-primary', subtitle: 'Settlement cycles' },
    { title: 'Net Settlement Value', value: Number(summary?.total_net_value || 0), prefix: '$', icon: DollarSign, iconColor: 'text-success', subtitle: 'Net position total' },
    { title: 'Liquidity Exposure', value: Number(summary?.liquidity_exposure || 0), prefix: '$', icon: ArrowUpDown, iconColor: 'text-warning', subtitle: 'Peak intraday exposure', positiveIsGood: false },
    { title: 'Failed Settlements', value: Number(summary?.failed_count || 0), icon: AlertCircle, iconColor: 'text-danger', subtitle: 'Require manual funding', positiveIsGood: false },
    { title: 'Success Rate', value: Number(summary?.success_rate || 0), suffix: '%', icon: CheckCircle2, iconColor: 'text-success', subtitle: 'Settlement success' },
  ];

  const liquidityPct = summary ? Math.min((Number(summary.liquidity_exposure || 0) / Number(summary.liquidity_limit || 1)) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Settlement Dashboard</h1>
        <p className="page-subtitle">Net settlement positions and liquidity · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Settlement Value Trend</h3>
          <p className="text-xs text-muted mb-4">Daily gross and net settlement amounts</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={trend} xKey="date" series={[
              { key: 'gross_amount', name: 'Gross', color: '#2563EB' },
              { key: 'net_amount', name: 'Net', color: '#10B981' },
            ]} formatY={(v) => `$${formatNumber(v)}`} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5 flex flex-col items-center justify-center gap-4">
          <div className="w-full">
            <h3 className="text-sm font-semibold mb-1">Liquidity Monitor</h3>
            <p className="text-xs text-muted">Exposure vs. limit</p>
          </div>
          {loading ? <div className="skeleton w-40 h-40 rounded-full" /> : (
            <GaugeChart value={liquidityPct} max={100} size={180} label="Utilization %" color={liquidityPct > 80 ? '#EF4444' : liquidityPct > 60 ? '#F59E0B' : '#10B981'} />
          )}
          <div className="w-full grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded bg-elevated/50">
              <p className="text-sm font-bold text-warning">{formatCurrency(summary?.liquidity_exposure || 0)}</p>
              <p className="text-[10px] text-muted">Exposure</p>
            </div>
            <div className="text-center p-2 rounded bg-elevated/50">
              <p className="text-sm font-bold text-success">{formatCurrency(summary?.liquidity_limit || 0)}</p>
              <p className="text-[10px] text-muted">Limit</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Settlement Status</h3>
          <p className="text-xs text-muted mb-4">By settlement outcome</p>
          {loading ? <div className="skeleton h-[200px]" /> : (
            <DonutChart data={[
              { name: 'Settled', value: Number(summary?.settled_count || 0), color: '#10B981' },
              { name: 'Pending', value: Number(summary?.pending_count || 0), color: '#06B6D4' },
              { name: 'Failed', value: Number(summary?.failed_count || 0), color: '#EF4444' },
            ]} centerLabel="Success" centerValue={formatPercent(summary?.success_rate || 0)} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Net Settlement Positions</h3>
          <p className="text-xs text-muted mb-4">Participant-level positions for current cycle</p>
          <DataTable data={positions} columns={positionColumns} loading={loading} pageSize={6} />
        </motion.div>
      </div>
    </div>
  );
}
