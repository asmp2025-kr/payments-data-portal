'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Filter, Download } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  created_at: string;
  result: string;
}

const columns: ColumnDef<AuditLog>[] = [
  { accessorKey: 'created_at', header: 'Timestamp', cell: ({ getValue }) => <span className="text-xs font-mono">{new Date(getValue() as string).toLocaleString()}</span> },
  { accessorKey: 'user_email', header: 'User', cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
  { accessorKey: 'action', header: 'Action', cell: ({ getValue }) => <span className="font-mono text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{getValue() as string}</span> },
  { accessorKey: 'entity_type', header: 'Resource' },
  { accessorKey: 'ip_address', header: 'IP Address', cell: ({ getValue }) => <span className="font-mono text-xs text-muted">{getValue() as string}</span> },
  {
    accessorKey: 'result', header: 'Result',
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return <span className={v === 'success' ? 'badge-success' : 'badge-danger'}>{v}</span>;
    }
  },
];

export default function AuditPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [dateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); });
  const [dateTo] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    api.audit.logs({ dateFrom, dateTo, limit: 200 })
      .then(r => setLogs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    !search || `${l.user_email} ${l.action} ${l.entity_type}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Audit Center</h1>
          <p className="page-subtitle">Complete audit trail of all user actions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded border border-border text-sm text-muted hover:text-foreground">
          <Download className="w-4 h-4" /> Export
        </button>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit logs..."
              className="w-full pl-10 pr-4 py-2 bg-elevated border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <Shield className="w-4 h-4" />
            <span>{filtered.length} events</span>
          </div>
        </div>
        <DataTable data={filtered} columns={columns} loading={loading} pageSize={20} />
      </motion.div>
    </div>
  );
}
