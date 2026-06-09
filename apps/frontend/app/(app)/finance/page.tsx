'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, BarChart2, PieChart } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent, getDefaultDateRange } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [revenueBySource, setRevenueBySource] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.finance.summary(params),
      api.finance.revenueTrend(params),
      api.finance.revenueBySource(params),
    ]).then(([s, rt, rs]) => {
      setSummary(s.data);
      setRevenueTrend(rt.data || []);
      setRevenueBySource(rs.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Total Revenue', value: Number(summary?.total_revenue || 0), prefix: '$', icon: DollarSign, iconColor: 'text-success', subtitle: 'Gross revenue this period' },
    { title: 'Net Revenue', value: Number(summary?.net_revenue || 0), prefix: '$', icon: TrendingUp, iconColor: 'text-info', subtitle: 'After costs and fees' },
    { title: 'Total Costs', value: Number(summary?.total_costs || 0), prefix: '$', icon: TrendingDown, iconColor: 'text-danger', subtitle: 'Operating costs', positiveIsGood: false },
    { title: 'Net Margin', value: Number(summary?.net_margin || 0), suffix: '%', icon: BarChart2, iconColor: 'text-success', subtitle: 'Net profit margin' },
    { title: 'Interchange Rev.', value: Number(summary?.interchange_revenue || 0), prefix: '$', icon: PieChart, iconColor: 'text-warning', subtitle: 'Interchange income' },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Finance Dashboard</h1>
        <p className="page-subtitle">Revenue and profitability overview · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Revenue Trend</h3>
          <p className="text-xs text-muted mb-4">Daily revenue and costs</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={revenueTrend} xKey="date" series={[
              { key: 'revenue', name: 'Revenue', color: '#10B981' },
              { key: 'costs', name: 'Costs', color: '#EF4444' },
            ]} formatY={(v) => `$${formatNumber(v)}`} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Revenue by Source</h3>
          <p className="text-xs text-muted mb-4">Revenue stream breakdown</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <DonutChart
              data={revenueBySource.map((r: any, i: number) => ({
                name: r.source,
                value: Number(r.amount || 0),
                color: ['#10B981','#2563EB','#F59E0B','#8B5CF6','#06B6D4'][i % 5],
              }))}
              centerLabel="Revenue"
              centerValue={`$${formatNumber(summary?.total_revenue || 0)}`}
            />
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Monthly P&L</h3>
          <p className="text-xs text-muted mb-4">Revenue vs. costs by month</p>
          {loading ? <div className="skeleton h-[200px]" /> : (
            <BarChartComp data={revenueTrend} xKey="date" series={[
              { key: 'revenue', name: 'Revenue', color: '#10B981' },
              { key: 'costs', name: 'Costs', color: '#EF4444' },
            ]} height={200} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Key Metrics</h3>
          <p className="text-xs text-muted mb-4">Financial performance summary</p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { label: 'Processing Revenue', value: formatCurrency(summary?.processing_revenue || 0), color: 'text-success' },
              { label: 'Scheme Fees (Paid)', value: formatCurrency(summary?.scheme_fees_paid || 0), color: 'text-danger' },
              { label: 'Fraud Losses', value: formatCurrency(summary?.fraud_losses || 0), color: 'text-danger' },
              { label: 'Net Interchange', value: formatCurrency(summary?.net_interchange || 0), color: 'text-info' },
              { label: 'EBITDA', value: formatCurrency(summary?.ebitda || 0), color: 'text-success' },
              { label: 'Cost/Transaction', value: `$${(summary?.cost_per_transaction || 0).toFixed(4)}`, color: 'text-warning' },
            ].map(m => (
              <div key={m.label} className="p-3 rounded bg-elevated/50 border border-border/50">
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[11px] text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
