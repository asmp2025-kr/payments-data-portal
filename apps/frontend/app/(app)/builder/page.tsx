'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Save, Share2, Trash2, Settings, BarChart2, LineChart,
  PieChart, Activity, Table, Hash, GripVertical, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { api } from '@/lib/api';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

type WidgetType = 'kpi' | 'area' | 'bar' | 'donut' | 'table' | 'gauge';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;
  config: Record<string, any>;
  x: number;
  y: number;
  w: number;
  h: number;
}

const WIDGET_TYPES: { type: WidgetType; label: string; icon: React.ReactNode; defaultW: number; defaultH: number }[] = [
  { type: 'kpi', label: 'KPI Card', icon: <Hash className="w-4 h-4" />, defaultW: 1, defaultH: 1 },
  { type: 'area', label: 'Area Chart', icon: <Activity className="w-4 h-4" />, defaultW: 2, defaultH: 2 },
  { type: 'bar', label: 'Bar Chart', icon: <BarChart2 className="w-4 h-4" />, defaultW: 2, defaultH: 2 },
  { type: 'donut', label: 'Donut Chart', icon: <PieChart className="w-4 h-4" />, defaultW: 1, defaultH: 2 },
  { type: 'table', label: 'Data Table', icon: <Table className="w-4 h-4" />, defaultW: 3, defaultH: 2 },
  { type: 'gauge', label: 'Gauge', icon: <Activity className="w-4 h-4" />, defaultW: 1, defaultH: 1 },
];

const DATA_SOURCES = [
  'clearing/summary', 'clearing/daily-trend', 'settlement/summary', 'settlement/positions',
  'fraud/summary', 'fraud/trend', 'aml/summary', 'compliance/score', 'cards/summary',
  'accounts/summary', 'scheme/summary', 'reconciliation/summary', 'finance/summary',
];

const COLS = 4;

function WidgetPreview({ widget }: { widget: Widget }) {
  const icons: Record<WidgetType, React.ReactNode> = {
    kpi: <Hash className="w-8 h-8 text-primary/40" />,
    area: <Activity className="w-8 h-8 text-primary/40" />,
    bar: <BarChart2 className="w-8 h-8 text-primary/40" />,
    donut: <PieChart className="w-8 h-8 text-primary/40" />,
    table: <Table className="w-8 h-8 text-primary/40" />,
    gauge: <Activity className="w-8 h-8 text-primary/40" />,
  };
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 opacity-70">
      {icons[widget.type]}
      <p className="text-xs text-muted text-center">{widget.title}</p>
      <p className="text-[10px] text-muted/60">{widget.dataSource}</p>
    </div>
  );
}

export default function DashboardBuilder() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dashboardName, setDashboardName] = useState('New Dashboard');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState<{ col: number; row: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragType = useRef<WidgetType | null>(null);

  const CELL_W = 200;
  const CELL_H = 140;
  const ROWS = Math.max(4, Math.ceil(widgets.reduce((m, w) => Math.max(m, w.y + w.h), 0)) + 2);

  const addWidget = (type: WidgetType) => {
    const def = WIDGET_TYPES.find(w => w.type === type)!;
    const id = `widget-${Date.now()}`;
    // find first free spot
    let x = 0, y = 0;
    outer: for (let row = 0; row < 20; row++) {
      for (let col = 0; col <= COLS - def.defaultW; col++) {
        const occupied = widgets.some(w =>
          col < w.x + w.w && col + def.defaultW > w.x &&
          row < w.y + w.h && row + def.defaultH > w.y
        );
        if (!occupied) { x = col; y = row; break outer; }
      }
    }
    const w: Widget = { id, type, title: def.label, dataSource: DATA_SOURCES[0], config: {}, x, y, w: def.defaultW, h: def.defaultH };
    setWidgets(prev => [...prev, w]);
    setSelected(id);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selected === id) setSelected(null);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.dashboards.create({
        name: dashboardName,
        layout_config: { cols: COLS, cellW: CELL_W, cellH: CELL_H },
        widgets_config: widgets,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* handled */ } finally { setSaving(false); }
  };

  const selectedWidget = widgets.find(w => w.id === selected);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-0 -m-6">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <input
            value={dashboardName}
            onChange={e => setDashboardName(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-semibold text-foreground w-48 border-b border-transparent hover:border-border focus:border-primary pb-0.5"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs text-muted hover:text-foreground">
            <Share2 className="w-3 h-3" /> Share
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${saved ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary/90'}`}>
            <Save className="w-3 h-3" /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Widget Palette */}
        <div className="w-56 border-r border-border bg-card/30 p-4 overflow-y-auto flex-shrink-0">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Widgets</p>
          <div className="space-y-2">
            {WIDGET_TYPES.map(wt => (
              <button key={wt.type} onClick={() => addWidget(wt.type)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border text-xs text-muted hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                <span className="text-primary/70">{wt.icon}</span>
                {wt.label}
                <Plus className="w-3 h-3 ml-auto opacity-50" />
              </button>
            ))}
          </div>

          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-5 mb-3">Data Sources</p>
          <div className="space-y-1">
            {DATA_SOURCES.map(ds => (
              <div key={ds} className="text-[11px] text-muted px-2 py-1 rounded hover:bg-elevated/50 cursor-pointer truncate">
                {ds}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-background/50 p-6"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(51,65,85,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          {widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BarChart2 className="w-12 h-12 text-muted mb-3" />
              <p className="text-sm text-muted">Click a widget type to add it to your dashboard</p>
              <p className="text-xs text-muted/60 mt-1">Drag and resize widgets to arrange your layout</p>
            </div>
          )}

          <div className="relative" style={{ minHeight: ROWS * CELL_H, minWidth: COLS * CELL_W }}>
            {/* Grid lines */}
            {Array.from({ length: ROWS }).map((_, row) =>
              Array.from({ length: COLS }).map((_, col) => (
                <div key={`${row}-${col}`}
                  className="absolute border border-border/20 rounded"
                  style={{ left: col * CELL_W + 4, top: row * CELL_H + 4, width: CELL_W - 8, height: CELL_H - 8 }} />
              ))
            )}

            {/* Widgets */}
            {widgets.map(w => (
              <motion.div
                key={w.id}
                layout
                className={`absolute glass-card flex flex-col cursor-pointer transition-all ${selected === w.id ? 'border-primary shadow-lg shadow-primary/20' : 'hover:border-primary/40'}`}
                style={{
                  left: w.x * CELL_W + 4,
                  top: w.y * CELL_H + 4,
                  width: w.w * CELL_W - 8,
                  height: w.h * CELL_H - 8,
                }}
                onClick={() => setSelected(w.id)}
              >
                {/* Widget header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-muted/50" />
                    <span className="text-xs font-medium text-foreground truncate">{w.title}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }} className="text-muted hover:text-danger transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 p-2">
                  <WidgetPreview widget={w} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 border-l border-border bg-card/30 p-4 overflow-y-auto flex-shrink-0">
          {selectedWidget ? (
            <>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Widget Properties</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">Title</label>
                  <input value={selectedWidget.title}
                    onChange={e => updateWidget(selectedWidget.id, { title: e.target.value })}
                    className="w-full bg-elevated border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">Data Source</label>
                  <select value={selectedWidget.dataSource}
                    onChange={e => updateWidget(selectedWidget.id, { dataSource: e.target.value })}
                    className="w-full bg-elevated border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary">
                    {DATA_SOURCES.map(ds => <option key={ds} value={ds}>{ds}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">Width (columns)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <button key={n} onClick={() => updateWidget(selectedWidget.id, { w: n })}
                        className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${selectedWidget.w === n ? 'bg-primary border-primary text-white' : 'border-border text-muted hover:text-foreground'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">Height (rows)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => updateWidget(selectedWidget.id, { h: n })}
                        className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${selectedWidget.h === n ? 'bg-primary border-primary text-white' : 'border-border text-muted hover:text-foreground'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">Column Position</label>
                  <input type="number" min={0} max={COLS - selectedWidget.w} value={selectedWidget.x}
                    onChange={e => updateWidget(selectedWidget.id, { x: Number(e.target.value) })}
                    className="w-full bg-elevated border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary" />
                </div>
                <button onClick={() => removeWidget(selectedWidget.id)}
                  className="w-full py-2 rounded border border-danger/30 text-xs text-danger hover:bg-danger/10 transition-colors flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> Remove Widget
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Settings className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-xs text-muted">Select a widget to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
