'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, FileText, ShieldCheck, Clock } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface AmlAlert {
  id: string;
  customer_id: string;
  alert_type: string;
  risk_score: number;
  status: string;
  assigned_to: string;
  created_at: string;
}

const alertColumns: ColumnDef<AmlAlert>[] = [
  { accessorKey: 'customer_id', header: 'Customer ID' },
  { accessorKey: 'alert_type', header: 'Alert Type' },
  {
    accessorKey: 'risk_score', header: 'Risk Score',
    cell: ({ getValue }) => {
      const s = getValue() as number;
      return <span className={`font-bold ${s >= 80 ? 'text-danger' : s >= 60 ? 'text-warning' : 'text-success'}`}>{s}</span>;
    }
  },
  { accessorKey: 'assigned_to', header: 'Investigator' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={statusBadgeClass(getValue() as string)}>{getValue() as string}</span> },
  { accessorKey: 'created_at', header: 'Created', cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString() },
];

export default function AmlDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<AmlAlert[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [byType, setByType] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.aml.summary(params),
      api.aml.alerts({ ...params, limit: 20 }),
      api.aml.trend(params),
      api.aml.byType(params),
    ]).then(([s, a, t, bt]) => {
      setSummary(s.data);
      setAlerts(a.data || []);
      setTrend(t.data || []);
      setByType(bt.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Total Alerts', value: Number(summary?.total_alerts || 0), icon: AlertTriangle, iconColor: 'text-warning', subtitle: 'AML alerts raised', positiveIsGood: false },
    { title: 'High Risk', value: Number(summary?.high_risk_count || 0), icon: Users, iconColor: 'text-danger', subtitle: 'Customers flagged high risk', positiveIsGood: false },
    { title: 'SARs Filed', value: Number(summary?.sar_filings || 0), icon: FileText, iconColor: 'text-info', subtitle: 'Suspicious activity reports' },
    { title: 'Closure Rate', value: Number(summary?.closure_rate || 0), suffix: '%', icon: ShieldCheck, iconColor: 'text-success', subtitle: 'Cases closed this period' },
    { title: 'Avg Resolution', value: Number(summary?.avg_resolution_hours || 0), suffix: 'h', icon: Clock, iconColor: 'text-warning', subtitle: 'Average time to resolve', positiveIsGood: false },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">AML Dashboard</h1>
        <p className="page-subtitle">Anti-money laundering monitoring · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Alert Trend</h3>
          <p className="text-xs text-muted mb-4">Daily AML alert volume</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={trend} xKey="date" series={[
              { key: 'alerts', name: 'Alerts', color: '#F59E0B' },
              { key: 'high_risk', name: 'High Risk', color: '#EF4444' },
            ]} formatY={formatNumber} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Alerts by Type</h3>
          <p className="text-xs text-muted mb-4">Distribution by alert category</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <DonutChart
              data={byType.map((b: any, i: number) => ({
                name: b.alert_type,
                value: Number(b.count || 0),
                color: ['#F59E0B','#EF4444','#8B5CF6','#06B6D4','#10B981'][i % 5],
              }))}
              centerLabel="Alert Types"
              centerValue={String(byType.length)}
            />
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Risk Distribution</h3>
          <p className="text-xs text-muted mb-4">Alerts by risk level</p>
          {loading ? <div className="skeleton h-[200px]" /> : (
            <BarChartComp
              data={[
                { level: 'Critical', count: summary?.critical_count || 0 },
                { level: 'High', count: summary?.high_risk_count || 0 },
                { level: 'Medium', count: summary?.medium_risk_count || 0 },
                { level: 'Low', count: summary?.low_risk_count || 0 },
              ]}
              xKey="level"
              series={[{ key: 'count', name: 'Count', color: '#F59E0B' }]}
              height={200}
            />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Active AML Alerts</h3>
          <p className="text-xs text-muted mb-4">Open alerts pending investigation</p>
          <DataTable data={alerts} columns={alertColumns} loading={loading} pageSize={5} />
        </motion.div>
      </div>
    </div>
  );
}
