'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, AlertCircle, CheckSquare, Calendar, TrendingUp } from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChartComp } from '@/components/charts/BarChartComp';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { formatNumber, formatPercent, getDefaultDateRange, statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Finding {
  id: string;
  finding_type: string;
  severity: string;
  status: string;
  description: string;
  due_date: string;
  resolved_at: string | null;
}

const findingColumns: ColumnDef<Finding>[] = [
  { accessorKey: 'finding_type', header: 'Type' },
  { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="text-xs">{(getValue() as string).slice(0, 60)}...</span> },
  {
    accessorKey: 'severity', header: 'Severity',
    cell: ({ getValue }) => {
      const s = getValue() as string;
      const cls = s === 'critical' ? 'badge-danger' : s === 'high' ? 'badge-warning' : s === 'medium' ? 'badge-info' : 'badge-success';
      return <span className={cls}>{s}</span>;
    }
  },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={statusBadgeClass(getValue() as string)}>{getValue() as string}</span> },
  { accessorKey: 'due_date', header: 'Due Date', cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString() },
];

export default function ComplianceDashboard() {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<any>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const { dateFrom, dateTo } = getDefaultDateRange(30);

  useEffect(() => {
    const params = { dateFrom, dateTo };
    Promise.all([
      api.compliance.score(),
      api.compliance.findings({ ...params, limit: 20 }),
      api.compliance.trend(params),
    ]).then(([s, f, t]) => {
      setScore(s.data);
      setFindings(f.data || []);
      setTrend(t.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Compliance Score', value: Number(score?.score || 0), suffix: '/100', icon: ClipboardCheck, iconColor: 'text-success', subtitle: 'Overall posture' },
    { title: 'Open Findings', value: Number(score?.open_findings || 0), icon: AlertCircle, iconColor: 'text-warning', subtitle: 'Require remediation', positiveIsGood: false },
    { title: 'Critical Issues', value: Number(score?.critical_count || 0), icon: AlertCircle, iconColor: 'text-danger', subtitle: 'Immediate action required', positiveIsGood: false },
    { title: 'Resolved', value: Number(score?.resolved_count || 0), icon: CheckSquare, iconColor: 'text-success', subtitle: 'Closed this period' },
    { title: 'Overdue', value: Number(score?.overdue_count || 0), icon: Calendar, iconColor: 'text-danger', subtitle: 'Past due date', positiveIsGood: false },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <h1 className="page-title">Compliance Dashboard</h1>
        <p className="page-subtitle">Regulatory compliance posture and findings · Last 30 days</p>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Score Trend</h3>
          <p className="text-xs text-muted mb-4">Compliance score over time</p>
          {loading ? <div className="skeleton h-[220px]" /> : (
            <AreaChart data={trend} xKey="date" series={[{ key: 'score', name: 'Score', color: '#10B981' }]} formatY={(v) => `${v}`} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.12 }} className="glass-card p-5 flex flex-col items-center justify-center gap-4">
          <div className="w-full">
            <h3 className="text-sm font-semibold mb-1">Overall Score</h3>
            <p className="text-xs text-muted">Real-time compliance rating</p>
          </div>
          {loading ? <div className="skeleton w-40 h-40 rounded-full" /> : (
            <GaugeChart value={Number(score?.score || 0)} max={100} size={180} label="Score" />
          )}
          <div className="w-full grid grid-cols-2 gap-2">
            {[
              { label: 'Critical', value: score?.critical_count || 0, color: 'text-danger' },
              { label: 'High', value: score?.high_count || 0, color: 'text-warning' },
              { label: 'Medium', value: score?.medium_count || 0, color: 'text-info' },
              { label: 'Low', value: score?.low_count || 0, color: 'text-success' },
            ].map(m => (
              <div key={m.label} className="text-center p-2 rounded bg-elevated/50">
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[10px] text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Findings by Severity</h3>
          <p className="text-xs text-muted mb-4">Distribution of open findings</p>
          {loading ? <div className="skeleton h-[200px]" /> : (
            <BarChartComp data={[
              { severity: 'Critical', count: score?.critical_count || 0 },
              { severity: 'High', count: score?.high_count || 0 },
              { severity: 'Medium', count: score?.medium_count || 0 },
              { severity: 'Low', count: score?.low_count || 0 },
            ]} xKey="severity" series={[{ key: 'count', name: 'Findings', color: '#F59E0B' }]} height={200} />
          )}
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.17 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Open Compliance Findings</h3>
          <p className="text-xs text-muted mb-4">Findings requiring action</p>
          <DataTable data={findings} columns={findingColumns} loading={loading} pageSize={5} />
        </motion.div>
      </div>
    </div>
  );
}
