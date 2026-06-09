'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, DollarSign, RefreshCcw, TrendingDown, AlertTriangle } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface FraudCase {
  id: string;
  transaction_ref: string;
  fraud_type: string;
  amount: number;
  currency: string;
  status: string;
  recovery_amount: number;
  detected_at: string;
}

interface MerchantRisk {
  merchant_id: string;
  merchant_name: string;
  fraud_count: number;
  fraud_amount: number;
  risk_score: number;
  category: string;
}

const caseColumns: ColumnDef<FraudCase>[] = [
  { accessorKey: 'transaction_ref', header: 'Reference' },
  { accessorKey: 'fraud_type', header: 'Type' },
  { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency) },
  { accessorKey: 'recovery_amount', header: 'Recovered', cell: ({ getValue }) => formatCurrency(getValue() as number) },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={statusBadgeClass(getValue() as string)}>{getValue() as string}</span> },
  { accessorKey: 'detected_at', header: 'Detected', cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString() },
];

const merchantColumns: ColumnDef<MerchantRisk>[] = [
  { accessorKey: 'merchant_name', header: 'Merchant' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'fraud_count', header: 'Cases', cell: ({ getValue }) => formatNumber(getValue() as number) },
  { accessorKey: 'fraud_amount', header: 'Loss Amount', cell: ({ getValue }) => formatCurrency(getValue() as number) },
  {
    accessorKey: 'risk_score', header: 'Risk Score',
    cell: ({ getValue }) => {
      const score = getValue() as number;
      const color = score >= 80 ? 'text-danger' : score >= 60 ? 'text-warning' : 'text-success';
      return <span className={`font-bold ${color}`}>{score}</span>;
    }
  },
];

export default function FraudDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [merchantRisk, setMerchantRisk] = useState<MerchantRisk[]>([]);
  const [byType, setByType] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.fraud.summary(params),
      api.fraud.trend(params),
      api.fraud.cases({ ...params, limit: 20 }),
      api.fraud.merchantRisk(params),
      api.fraud.byType(params),
    ]).then(([s, t, c, m, bt]) => {
      setSummary(s.data);
      setTrend(t.data || []);
      setCases(c.data || []);
      setMerchantRisk(m.data || []);
      setByType(bt.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Total Cases', value: Number(summary?.total_cases || 0), icon: ShieldAlert, iconColor: 'text-danger', subtitle: 'Fraud cases detected', positiveIsGood: false },
    { title: 'Fraud Losses', value: Number(summary?.total_fraud_amount || 0), prefix: '$', icon: DollarSign, iconColor: 'text-danger', subtitle: 'Total financial loss', positiveIsGood: false },
    { title: 'Recovery Rate', value: Number(summary?.recovery_rate || 0), suffix: '%', icon: RefreshCcw, iconColor: 'text-success', subtitle: 'Amount recovered' },
    { title: 'Fraud Rate', value: Number(summary?.fraud_rate || 0), suffix: '%', icon: TrendingDown, iconColor: 'text-warning', subtitle: 'As % of transactions', positiveIsGood: false },
    { title: 'Open Cases', value: Number(summary?.open_cases || 0), icon: AlertTriangle, iconColor: 'text-warning', subtitle: 'Pending investigation', positiveIsGood: false },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Fraud Dashboard</h1>
        <p className="page-subtitle">Fraud detection and case management · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Fraud Trend</h3>
          <p className="text-xs text-muted mb-4">Daily cases and loss amounts</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={trend} xKey="date" series={[
              { key: 'cases', name: 'Cases', color: '#EF4444' },
              { key: 'amount', name: 'Loss ($)', color: '#F59E0B' },
            ]} formatY={formatNumber} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Fraud by Type</h3>
          <p className="text-xs text-muted mb-4">Distribution by fraud category</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <DonutChart
              data={byType.map((b: any, i: number) => ({
                name: b.fraud_type,
                value: Number(b.count || 0),
                color: ['#EF4444','#F59E0B','#8B5CF6','#06B6D4','#10B981'][i % 5],
              }))}
              centerLabel="Types"
              centerValue={String(byType.length)}
            />
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">High-Risk Merchants</h3>
          <p className="text-xs text-muted mb-4">Merchants with highest fraud exposure</p>
          <DataTable data={merchantRisk} columns={merchantColumns} loading={loading} pageSize={5} />
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Recent Fraud Cases</h3>
          <p className="text-xs text-muted mb-4">Latest detected fraud cases</p>
          <DataTable data={cases} columns={caseColumns} loading={loading} pageSize={5} />
        </motion.div>
      </div>
    </div>
  );
}
