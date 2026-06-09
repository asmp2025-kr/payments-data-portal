'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Card {
  card_number_masked: string;
  card_type: string;
  brand: string;
  status: string;
  spend_limit: number;
  currency: string;
  activated_at: string;
}

const cardColumns: ColumnDef<Card>[] = [
  { accessorKey: 'card_number_masked', header: 'Card Number' },
  { accessorKey: 'card_type', header: 'Type' },
  { accessorKey: 'brand', header: 'Brand' },
  { accessorKey: 'spend_limit', header: 'Spend Limit', cell: ({ row }) => formatCurrency(row.original.spend_limit, row.original.currency) },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={statusBadgeClass(getValue() as string)}>{getValue() as string}</span> },
  { accessorKey: 'activated_at', header: 'Activated', cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleDateString() : '-' },
];

export default function CardsDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [byBrand, setByBrand] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.cards.summary(params),
      api.cards.list({ ...params, limit: 20 }),
      api.cards.trend(params),
      api.cards.byBrand(params),
    ]).then(([s, c, t, bb]) => {
      setSummary(s.data);
      setCards(c.data || []);
      setTrend(t.data || []);
      setByBrand(bb.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Active Cards', value: Number(summary?.active_cards || 0), icon: CreditCard, iconColor: 'text-primary', subtitle: 'Currently active' },
    { title: 'Auth Success Rate', value: Number(summary?.auth_success_rate || 0), suffix: '%', icon: ShieldCheck, iconColor: 'text-success', subtitle: 'Authorization success' },
    { title: 'Declined', value: Number(summary?.declined || 0), icon: XCircle, iconColor: 'text-danger', subtitle: 'Declined transactions', positiveIsGood: false },
    { title: 'Spend Volume', value: Number(summary?.total_spend || 0), prefix: '$', icon: DollarSign, iconColor: 'text-info', subtitle: 'Total card spend' },
    { title: 'Interchange Revenue', value: Number(summary?.interchange_revenue || 0), prefix: '$', icon: TrendingUp, iconColor: 'text-success', subtitle: 'Earned this period' },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Cards Dashboard</h1>
        <p className="page-subtitle">Card portfolio performance and authorization · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Spend Trend</h3>
          <p className="text-xs text-muted mb-4">Daily card spend volume</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={trend} xKey="date" series={[
              { key: 'authorized', name: 'Authorized', color: '#10B981' },
              { key: 'declined', name: 'Declined', color: '#EF4444' },
            ]} formatY={formatNumber} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Cards by Brand</h3>
          <p className="text-xs text-muted mb-4">Distribution by card network</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <DonutChart
              data={byBrand.map((b: any, i: number) => ({
                name: b.brand,
                value: Number(b.count || 0),
                color: ['#2563EB','#10B981','#F59E0B','#8B5CF6'][i % 4],
              }))}
              centerLabel="Brands"
              centerValue={String(byBrand.length)}
            />
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Auth by Card Type</h3>
          <p className="text-xs text-muted mb-4">Authorization rate per card type</p>
          {loading ? <div className="skeleton h-[200px]" /> : (
            <BarChartComp data={[
              { type: 'Debit', rate: summary?.debit_auth_rate || 0 },
              { type: 'Credit', rate: summary?.credit_auth_rate || 0 },
              { type: 'Prepaid', rate: summary?.prepaid_auth_rate || 0 },
            ]} xKey="type" series={[{ key: 'rate', name: 'Auth Rate %', color: '#10B981' }]} height={200} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Card Portfolio</h3>
          <p className="text-xs text-muted mb-4">Recent cards in portfolio</p>
          <DataTable data={cards} columns={cardColumns} loading={loading} pageSize={5} />
        </motion.div>
      </div>
    </div>
  );
}
