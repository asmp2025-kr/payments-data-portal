'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, AlertTriangle, Users, RefreshCcw } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Account {
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
  status: string;
  last_activity_at: string;
}

const accountColumns: ColumnDef<Account>[] = [
  { accessorKey: 'account_number', header: 'Account' },
  { accessorKey: 'account_type', header: 'Type' },
  { accessorKey: 'balance', header: 'Balance', cell: ({ row }) => formatCurrency(row.original.balance, row.original.currency) },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={statusBadgeClass(getValue() as string)}>{getValue() as string}</span> },
  { accessorKey: 'last_activity_at', header: 'Last Activity', cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleDateString() : 'N/A' },
];

export default function AccountsDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.accounts.summary(params),
      api.accounts.list({ ...params, limit: 20 }),
      api.accounts.trend(params),
    ]).then(([s, a, t]) => {
      setSummary(s.data);
      setAccounts(a.data || []);
      setTrend(t.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Total Accounts', value: Number(summary?.total_accounts || 0), icon: Wallet, iconColor: 'text-primary', subtitle: 'Across all types' },
    { title: 'Total Balance', value: Number(summary?.total_balance || 0), prefix: '$', icon: TrendingUp, iconColor: 'text-success', subtitle: 'Aggregate balance' },
    { title: 'Dormant Accounts', value: Number(summary?.dormant_count || 0), icon: AlertTriangle, iconColor: 'text-warning', subtitle: 'No activity 90+ days', positiveIsGood: false },
    { title: 'Active Accounts', value: Number(summary?.active_count || 0), icon: Users, iconColor: 'text-success', subtitle: 'Transacted last 30 days' },
    { title: 'New Accounts', value: Number(summary?.new_accounts || 0), icon: RefreshCcw, iconColor: 'text-info', subtitle: 'Opened this period' },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Accounts Dashboard</h1>
        <p className="page-subtitle">Account portfolio and activity · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Balance Trend</h3>
          <p className="text-xs text-muted mb-4">Daily aggregate balance movement</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={trend} xKey="date" series={[{ key: 'balance', name: 'Balance', color: '#2563EB' }]} formatY={(v) => `$${formatNumber(v)}`} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Account Status</h3>
          <p className="text-xs text-muted mb-4">Distribution by status</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <DonutChart data={[
              { name: 'Active', value: Number(summary?.active_count || 0), color: '#10B981' },
              { name: 'Dormant', value: Number(summary?.dormant_count || 0), color: '#F59E0B' },
              { name: 'Closed', value: Number(summary?.closed_count || 0), color: '#EF4444' },
              { name: 'Frozen', value: Number(summary?.frozen_count || 0), color: '#8B5CF6' },
            ]} centerLabel="Total" centerValue={formatNumber(summary?.total_accounts || 0)} />
          )}
        </motion.div>
      </div>

      <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-1">Account Listing</h3>
        <p className="text-xs text-muted mb-4">Recent accounts with balance and status</p>
        <DataTable data={accounts} columns={accountColumns} loading={loading} pageSize={10} />
      </motion.div>
    </div>
  );
}
