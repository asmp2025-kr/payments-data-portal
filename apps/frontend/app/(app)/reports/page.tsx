'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Calendar, Filter, Search,
  Clock, CheckCircle2, Loader2, FileSpreadsheet, File
} from 'lucide-react';
import { api } from '@/lib/api';
import { statusBadgeClass } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface ReportTemplate {
  id: string;
  name: string;
  module: string;
  type: string;
  description: string;
  formats: string[];
  defaultSchedule: string;
}

interface ReportRun {
  id: string;
  report_name: string;
  format: string;
  status: string;
  generated_at: string;
  generated_by: string;
  file_url?: string;
}

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-3 h-3" />,
  excel: <FileSpreadsheet className="w-3 h-3" />,
  csv: <File className="w-3 h-3" />,
};

const MODULES = ['All', 'Executive', 'Clearing', 'Settlement', 'Accounts', 'Cards', 'Fraud', 'AML', 'Compliance', 'Scheme', 'Reconciliation', 'Finance', 'Operations', 'Customer', 'Data Products', 'Platform'];

function GenerateModal({ template, onClose }: { template: ReportTemplate; onClose: () => void }) {
  const [format, setFormat] = useState(template.formats[0]);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.reports.generate({ reportId: template.id, format, dateFrom, dateTo });
      setRunId(res.data.runId);
    } catch { /* handled */ } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 w-full max-w-md">
        {runId ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="text-base font-semibold mb-1">Report Queued</h3>
            <p className="text-sm text-muted mb-1">Your report is being generated.</p>
            <p className="text-xs text-muted">Run ID: <code className="text-primary">{runId}</code></p>
            <p className="text-xs text-muted mt-2">Check the <strong>Download History</strong> tab when ready.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded bg-primary text-white text-sm font-medium">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Generate Report</h3>
            </div>
            <p className="text-sm text-muted mb-4">{template.name}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-secondary block mb-1">Format</label>
                <div className="flex gap-2">
                  {template.formats.map(f => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border transition-colors ${format === f ? 'bg-primary border-primary text-white' : 'border-border text-muted hover:text-foreground'}`}>
                      {FORMAT_ICONS[f]} {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">From</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="w-full bg-elevated border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">To</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    className="w-full bg-elevated border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded border border-border text-sm text-muted hover:text-foreground">Cancel</button>
              <button onClick={handleGenerate} disabled={generating}
                className="flex-1 px-4 py-2 rounded bg-primary text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4" /> Generate</>}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState<'catalog' | 'history'>('catalog');
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<ReportTemplate[]>([]);
  const [history, setHistory] = useState<ReportRun[]>([]);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('All');
  const [generateFor, setGenerateFor] = useState<ReportTemplate | null>(null);

  useEffect(() => {
    Promise.all([
      api.reports.catalog(),
      api.reports.runs({ limit: 50 }),
    ]).then(([c, h]) => {
      setCatalog(c.data || []);
      setHistory(h.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredCatalog = catalog.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchModule = module === 'All' || r.module.toLowerCase() === module.toLowerCase();
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <div>
          <h1 className="page-title">Report Center</h1>
          <p className="page-subtitle">Generate and schedule payment reports · {catalog.length} templates</p>
        </div>
        <div className="flex gap-2">
          {(['catalog', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-primary text-white' : 'border border-border text-muted hover:text-foreground'}`}>
              {t === 'catalog' ? 'Report Catalog' : 'Download History'}
            </button>
          ))}
        </div>
      </motion.div>

      {tab === 'catalog' && (
        <>
          <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {MODULES.map(m => (
                <button key={m} onClick={() => setModule(m)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${module === m ? 'bg-primary text-white' : 'bg-card border border-border text-muted hover:text-foreground'}`}>
                  {m}
                </button>
              ))}
            </div>
          </motion.div>

          <p className="text-xs text-muted">{filteredCatalog.length} reports</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="glass-card p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-primary">{r.module}</p>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{r.name}</h3>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-elevated text-muted border border-border/50">{r.id}</span>
                  </div>
                  <p className="text-xs text-secondary line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-2">
                    {r.formats.map(f => (
                      <span key={f} className="flex items-center gap-1 text-[11px] text-muted px-1.5 py-0.5 rounded border border-border/50">
                        {FORMAT_ICONS[f]} {f.toUpperCase()}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{r.defaultSchedule}</span>
                  </div>
                  <button onClick={() => setGenerateFor(r)}
                    className="w-full py-2 rounded bg-primary/10 border border-primary/30 text-xs font-medium text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-1">
                    <FileText className="w-3 h-3" /> Generate Report
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <motion.div {...fadeIn} className="glass-card">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Generated By</th>
                  <th>Date</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6}><div className="skeleton h-8 w-full" /></td></tr>
                  ))
                ) : history.map(run => (
                  <tr key={run.id}>
                    <td className="font-medium text-foreground">{run.report_name}</td>
                    <td>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        {FORMAT_ICONS[run.format]} {run.format?.toUpperCase()}
                      </span>
                    </td>
                    <td><span className={statusBadgeClass(run.status)}>{run.status}</span></td>
                    <td className="text-xs text-muted">{run.generated_by}</td>
                    <td className="text-xs text-muted">{new Date(run.generated_at).toLocaleString()}</td>
                    <td>
                      {run.file_url && run.status === 'completed' ? (
                        <a href={run.file_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <Download className="w-3 h-3" /> Download
                        </a>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {generateFor && <GenerateModal template={generateFor} onClose={() => setGenerateFor(null)} />}
      </AnimatePresence>
    </div>
  );
}
