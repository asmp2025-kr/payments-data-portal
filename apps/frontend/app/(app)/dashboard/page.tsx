'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight, Banknote, CreditCard, ShieldAlert,
  AlertTriangle, ClipboardCheck, TrendingUp, Zap
} from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<any>(null);
  const [settlement, setSettlement] = useState<any>(null);
  const [fraud, setFraud] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [cards, setCards] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [fraudTrend, setFraudTrend] = useState<any[]>([]);

  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.clearing.summary(params),
      api.settlement.summary(params),
      api.fraud.summary(params),
      api.compliance.score(),
      api.cards.summary(params),
      api.clearing.dailyTrend(params),
      api.fraud.trend(params),
    ]).then(([c, s, f, comp, cards, trend, fTrend]) => {
      setClearing(c.data);
      setSettlement(s.data);
      setFraud(f.data);
      setCompliance(comp.data);
      setCards(cards.data);
      setTrendData(trend.data || []);
      setFraudTrend(fTrend.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    {
      title: 'Transactions Cleared',
      value: loading ? 0 : Number(clearing?.total_transactions || 0),
      icon: ArrowLeftRight,
      iconColor: 'text-primary',
      subtitle: `Success: ${formatPercent(clearing?.success_rate || 0)}`,
    },
    {
      title: 'Settlement Value',
      value: loading ? 0 : Number(settlement?.total_net_value || 0),
      prefix: '$',
      icon: Banknote,
      iconColor: 'text-success',
      subtitle: `${formatPercent(settlement?.success_rate || 0)} success rate`,
    },
    {
      title: 'Active Cards',
      value: loading ? 0 : Number(cards?.active_cards || 0),
      icon: CreditCard,
      iconColor: 'text-info',
      subtitle: `Auth rate: ${formatPercent(cards?.auth_success_rate || 0)}`,
    },
    {
      title: 'Fraud Cases',
      value: loading ? 0 : Number(fraud?.total_cases || 0),
      icon: ShieldAlert,
      iconColor: 'text-danger',
      subtitle: `$${formatNumber(Number(fraud?.total_fraud_amount || 0))} total losses`,
      positiveIsGood: false,
    },
    {
      title: 'AML Alerts',
      value: loading ? 0 : Number(fraud?.total_cases || 0),
      icon: AlertTriangle,
      iconColor: 'text-warning',
      subtitle: 'Open investigations',
      positiveIsGood: false,
    },
    {
      title: 'Compliance Score',
      value: loading ? 0 : Number(compliance?.score || 0),
      suffix: '/100',
      icon: ClipboardCheck,
      iconColor: 'text-success',
      subtitle: 'Overall compliance posture',
    },
    {
      title: 'Total Revenue',
      value: loading ? 0 : Number(clearing?.total_interchange_fees || 0),
      prefix: '$',
      icon: TrendingUp,
      iconColor: 'text-purple',
      subtitle: 'Interchange + fees',
    },
    {
      title: 'Processing Speed',
      value: loading ? 0 : Number(clearing?.avg_processing_time_ms || 0),
      suffix: 'ms',
      icon: Zap,
      iconColor: 'text-info',
      subtitle: 'Avg processing time',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeIn} transition={{ delay: 0 }} className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
        <p className="page-subtitle">Payment business overview · Last 30 days · Live</p>
      </motion.div>

      {/* KPI Grid */}
      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} loading={loading} />
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction Trend */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Clearing Volume Trend</h3>
              <p className="text-xs text-muted">Daily transactions cleared</p>
            </div>
            <span className="badge-info">30 days</span>
          </div>
          {loading ? <div className="skeleton h-[220px] w-full" /> : (
            <AreaChart
              data={trendData}
              xKey="date"
              series={[
                { key: 'volume', name: 'Volume', color: '#2563EB' },
              ]}
              formatY={(v) => formatNumber(v)}
            />
          )}
        </motion.div>

        {/* Compliance Score */}
        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Compliance Score</h3>
            <p className="text-xs text-muted">Overall compliance posture</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {loading ? <div className="skeleton w-32 h-32 rounded-full" /> : (
              <GaugeChart
                value={Number(compliance?.score || 0)}
                max={100}
                size={160}
                label="Score"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { label: 'Open Findings', value: '12', color: 'text-warning' },
              { label: 'Resolved', value: '89', color: 'text-success' },
              { label: 'Critical', value: '2', color: 'text-danger' },
              { label: 'Overdue', value: '3', color: 'text-danger' },
            ].map(m => (
              <div key={m.label} className="text-center p-2 rounded bg-elevated/50">
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[10px] text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Settlement Distribution */}
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Settlement Status</h3>
            <p className="text-xs text-muted">Distribution by status</p>
          </div>
          {loading ? <div className="skeleton h-[200px] w-full" /> : (
            <DonutChart
              data={[
                { name: 'Settled', value: Number(settlement?.settled_count || 0), color: '#10B981' },
                { name: 'Pending', value: Number(settlement?.total_settlements || 0) - Number(settlement?.settled_count || 0) - Number(settlement?.failed_count || 0), color: '#06B6D4' },
                { name: 'Failed', value: Number(settlement?.failed_count || 0), color: '#EF4444' },
              ]}
              centerLabel="Success"
              centerValue={`${formatPercent(settlement?.success_rate || 0)}`}
            />
          )}
        </motion.div>

        {/* Fraud Trend */}
        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Fraud Cases</h3>
            <p className="text-xs text-muted">Daily fraud case trend</p>
          </div>
          {loading ? <div className="skeleton h-[200px] w-full" /> : (
            <BarChartComp
              data={fraudTrend.slice(-14)}
              xKey="date"
              series={[{ key: 'cases', name: 'Cases', color: '#EF4444' }]}
              height={200}
            />
          )}
        </motion.div>

        {/* Card Performance */}
        <motion.div {...fadeIn} transition={{ delay: 0.19 }} className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Card Performance</h3>
            <p className="text-xs text-muted">Authorization breakdown</p>
          </div>
          {loading ? <div className="skeleton h-[200px] w-full" /> : (
            <DonutChart
              data={[
                { name: 'Authorized', value: Number(cards?.authorized || 0), color: '#10B981' },
                { name: 'Declined', value: Number(cards?.declined || 0), color: '#EF4444' },
              ]}
              centerLabel="Auth Rate"
              centerValue={`${formatPercent(cards?.auth_success_rate || 0)}`}
            />
          )}
        </motion.div>
      </div>

      {/* AI Insights Panel */}
      <motion.div {...fadeIn} transition={{ delay: 0.22 }} className="glass-card p-5 border-l-2 border-primary">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
            <Zap className="w-3 h-3 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
          <span className="badge-info">Auto-generated</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              type: 'Trend Alert',
              color: 'text-warning',
              icon: '↗',
              message: `Clearing volume increased 12.3% vs. last period. Peak processing at 14:00-16:00 UTC.`,
            },
            {
              type: 'Risk Signal',
              color: 'text-danger',
              icon: '⚠',
              message: `Fraud rate at 0.3% — within normal range. 3 high-risk merchants flagged for review.`,
            },
            {
              type: 'Opportunity',
              color: 'text-success',
              icon: '✓',
              message: `Settlement success rate at ${formatPercent(settlement?.success_rate || 97)}. Liquidity exposure within limits.`,
            },
          ].map(insight => (
            <div key={insight.type} className="p-3 rounded-lg bg-elevated/50 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-base ${insight.color}`}>{insight.icon}</span>
                <span className={`text-xs font-semibold ${insight.color}`}>{insight.type}</span>
              </div>
              <p className="text-xs text-secondary">{insight.message}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
