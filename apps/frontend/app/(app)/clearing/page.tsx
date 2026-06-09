'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatNumber, formatCurrency, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Participant {
  participant_code: string;
  participant_name: string;
  total_transactions: number;
  success_rate: number;
  total_value: number;
  avg_processing_time_ms: number;
}

interface ExceptionRow {
  id: string;
  transaction_ref: string;
  amount: number;
  currency: string;
  status: string;
  exception_code: string;
  participant_code: string;
  created_at: string;
}

const participantColumns: ColumnDef<Participant>[] = [
  { accessorKey: 'participant_code', header: 'Code' },
  { accessorKey: 'participant_name', header: 'Participant' },
  { accessorKey: 'total_transactions', header: 'Transactions', cell: ({ getValue }) => formatNumber(getValue() as number) },
  { accessorKey: 'success_rate', header: 'Success Rate', cell: ({ getValue }) => <span className={`font-medium ${Number(getValue()) >= 98 ? 'text-success' : Number(getValue()) >= 95 ? 'text-warning' : 'text-danger'}`}>{formatPercent(getValue() as number)}</span> },
  { accessorKey: 'total_value', header: 'Value (USD)', cell: ({ getValue }) => formatCurrency(getValue() as number) },
  { accessorKey: 'avg_processing_time_ms', header: 'Avg Time', cell: ({ getValue }) => `${getValue()}ms` },
];

const exceptionColumns: ColumnDef<ExceptionRow>[] = [
  { accessorKey: 'transaction_ref', header: 'Reference' },
  { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency) },
  { accessorKey: 'exception_code', header: 'Exception Code' },
  { accessorKey: 'participant_code', header: 'Participant' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={statusBadgeClass(getValue() as string)}>{getValue() as string}</span> },
  { accessorKey: 'created_at', header: 'Time', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString() },
];

export default function ClearingDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [hourlyTrend, setHourlyTrend] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(7);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.clearing.summary(params),
      api.clearing.hourlyTrend(params),
      api.clearing.dailyTrend(params),
      api.clearing.participants(params),
      api.clearing.exceptions({ ...params, limit: 50 }),
    ]).then(([s, ht, dt, p, ex]) => {
      setSummary(s.data);
      setHourlyTrend(ht.data || []);
      setDailyTrend(dt.data || []);
      setParticipants(p.data || []);
      setExceptions(ex.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Total Cleared', value: Number(summary?.total_transactions || 0), icon: Activity, iconColor: 'text-primary', subtitle: `${formatCurrency(summary?.total_amount || 0)} total value` },
    { title: 'Success Rate', value: Number(summary?.success_rate || 0), suffix: '%', icon: CheckCircle2, iconColor: 'text-success', subtitle: 'Clearing success' },
    { title: 'Failed', value: Number(summary?.failed_transactions || 0), icon: XCircle, iconColor: 'text-danger', subtitle: 'Requires investigation', positiveIsGood: false },
    { title: 'Avg Processing', value: Number(summary?.avg_processing_time_ms || 0), suffix: 'ms', icon: Clock, iconColor: 'text-info', subtitle: 'Average time to clear' },
    { title: 'Interchange Fees', value: Number(summary?.total_interchange_fees || 0), prefix: '$', icon: TrendingUp, iconColor: 'text-warning', subtitle: 'Total earned this period' },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Clearing Dashboard</h1>
        <p className="page-subtitle">Payment clearing operations · Last 7 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Hourly Clearing Throughput</h3>
          <p className="text-xs text-muted mb-4">Transactions cleared per hour</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={hourlyTrend} xKey="hour" series={[
              { key: 'cleared', name: 'Cleared', color: '#10B981' },
              { key: 'failed', name: 'Failed', color: '#EF4444' },
            ]} formatY={formatNumber} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Status Distribution</h3>
          <p className="text-xs text-muted mb-4">By clearing outcome</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <DonutChart
              data={[
                { name: 'Cleared', value: Number(summary?.cleared_transactions || 0), color: '#10B981' },
                { name: 'Pending', value: Number(summary?.pending_transactions || 0), color: '#F59E0B' },
                { name: 'Failed', value: Number(summary?.failed_transactions || 0), color: '#EF4444' },
              ]}
              centerLabel="Success"
              centerValue={formatPercent(summary?.success_rate || 0)}
            />
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Daily Volume Trend</h3>
          <p className="text-xs text-muted mb-4">7-day clearing volume</p>
          {loading ? <div className="skeleton h-[200px]" /> : (
            <BarChartComp data={dailyTrend} xKey="date" series={[{ key: 'volume', name: 'Volume', color: '#2563EB' }]} height={200} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Participant Performance</h3>
          <p className="text-xs text-muted mb-4">Top clearing participants</p>
          <DataTable data={participants} columns={participantColumns} loading={loading} pageSize={5} />
        </motion.div>
      </div>

      <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-1">Clearing Exceptions</h3>
        <p className="text-xs text-muted mb-4">Failed and exception transactions requiring action</p>
        <DataTable data={exceptions} columns={exceptionColumns} loading={loading} pageSize={10} />
      </motion.div>
    </div>
  );
}
