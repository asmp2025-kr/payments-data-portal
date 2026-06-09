'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, CheckCircle2, DollarSign, Users, TrendingUp } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Participant {
  participant_code: string;
  name: string;
  type: string;
  country: string;
  volume: number;
  value: number;
  sla_met_rate: number;
  status: string;
}

const participantColumns: ColumnDef<Participant>[] = [
  { accessorKey: 'participant_code', header: 'Code' },
  { accessorKey: 'name', header: 'Participant' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'country', header: 'Country' },
  { accessorKey: 'volume', header: 'Volume', cell: ({ getValue }) => formatNumber(getValue() as number) },
  { accessorKey: 'value', header: 'Value', cell: ({ getValue }) => formatCurrency(getValue() as number) },
  { accessorKey: 'sla_met_rate', header: 'SLA', cell: ({ getValue }) => <span className={`font-medium ${Number(getValue()) >= 99 ? 'text-success' : Number(getValue()) >= 95 ? 'text-warning' : 'text-danger'}`}>{formatPercent(getValue() as number)}</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={statusBadgeClass(getValue() as string)}>{getValue() as string}</span> },
];

export default function SchemeDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.scheme.summary(params),
      api.scheme.participants(params),
      api.scheme.trend(params),
    ]).then(([s, p, t]) => {
      setSummary(s.data);
      setParticipants(p.data || []);
      setTrend(t.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Participants', value: Number(summary?.total_participants || 0), icon: Users, iconColor: 'text-primary', subtitle: 'Active scheme members' },
    { title: 'Total Volume', value: Number(summary?.total_volume || 0), icon: Network, iconColor: 'text-info', subtitle: 'Transactions processed' },
    { title: 'Scheme Value', value: Number(summary?.total_value || 0), prefix: '$', icon: DollarSign, iconColor: 'text-success', subtitle: 'Total scheme value' },
    { title: 'SLA Compliance', value: Number(summary?.sla_compliance_rate || 0), suffix: '%', icon: CheckCircle2, iconColor: 'text-success', subtitle: 'SLA targets met' },
    { title: 'Scheme Revenue', value: Number(summary?.scheme_fees || 0), prefix: '$', icon: TrendingUp, iconColor: 'text-warning', subtitle: 'Fees collected' },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Domestic Scheme Dashboard</h1>
        <p className="page-subtitle">Scheme participant performance and SLA · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Scheme Volume Trend</h3>
          <p className="text-xs text-muted mb-4">Daily transactions through scheme</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={trend} xKey="date" series={[
              { key: 'volume', name: 'Volume', color: '#2563EB' },
              { key: 'value', name: 'Value ($)', color: '#10B981' },
            ]} formatY={formatNumber} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Participant Types</h3>
          <p className="text-xs text-muted mb-4">Distribution by member type</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <DonutChart data={[
              { name: 'Direct', value: Number(summary?.direct_participants || 0), color: '#2563EB' },
              { name: 'Indirect', value: Number(summary?.indirect_participants || 0), color: '#8B5CF6' },
              { name: 'Associate', value: Number(summary?.associate_participants || 0), color: '#06B6D4' },
            ]} centerLabel="Total" centerValue={formatNumber(summary?.total_participants || 0)} />
          )}
        </motion.div>
      </div>

      <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-1">Participant Performance</h3>
        <p className="text-xs text-muted mb-4">SLA compliance and volume per participant</p>
        <DataTable data={participants} columns={participantColumns} loading={loading} pageSize={10} />
      </motion.div>
    </div>
  );
}
