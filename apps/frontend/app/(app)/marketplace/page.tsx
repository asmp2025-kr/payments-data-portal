'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Database, Star, Clock, Lock, Unlock,
  ChevronRight, ExternalLink, Activity, BarChart2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatNumber, statusBadgeClass } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface DataProduct {
  id: string;
  name: string;
  domain: string;
  description: string;
  owner_name: string;
  quality_score: number;
  refresh_frequency: string;
  status: string;
  api_endpoint: string;
  subscriber_count: number;
  last_updated: string;
  tags: string[];
}

const DOMAIN_COLORS: Record<string, string> = {
  clearing: '#2563EB',
  settlement: '#10B981',
  fraud: '#EF4444',
  aml: '#F59E0B',
  compliance: '#8B5CF6',
  cards: '#06B6D4',
  accounts: '#F97316',
  scheme: '#EC4899',
  reconciliation: '#14B8A6',
  finance: '#84CC16',
};

const DOMAINS = ['All', 'clearing', 'settlement', 'fraud', 'aml', 'compliance', 'cards', 'accounts', 'scheme', 'reconciliation', 'finance'];

function QualityBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-success border-success/30 bg-success/10' : score >= 70 ? 'text-warning border-warning/30 bg-warning/10' : 'text-danger border-danger/30 bg-danger/10';
  return <span className={`text-xs font-bold px-2 py-0.5 rounded border ${color}`}>{score}%</span>;
}

function ProductCard({ product, onRequest }: { product: DataProduct; onRequest: (p: DataProduct) => void }) {
  const domainColor = DOMAIN_COLORS[product.domain] || '#2563EB';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 flex flex-col gap-3 group hover:border-primary/50 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${domainColor}20` }}>
            <Database className="w-4 h-4" style={{ color: domainColor }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">{product.name}</h3>
            <span className="text-[10px] font-medium capitalize px-1.5 py-0.5 rounded" style={{ color: domainColor, backgroundColor: `${domainColor}15` }}>
              {product.domain}
            </span>
          </div>
        </div>
        <QualityBadge score={product.quality_score} />
      </div>

      {/* Description */}
      <p className="text-xs text-secondary leading-relaxed">{product.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{product.refresh_frequency}</span>
        <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{formatNumber(product.subscriber_count)} subscribers</span>
        <span className={statusBadgeClass(product.status)}>{product.status}</span>
      </div>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 4).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-elevated/80 text-muted border border-border/50">{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-xs text-muted">By {product.owner_name}</span>
        <button
          onClick={() => onRequest(product)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <Unlock className="w-3 h-3" /> Request Access <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

function AccessRequestModal({ product, onClose }: { product: DataProduct; onClose: () => void }) {
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.dataProducts.requestAccess(product.id, { purpose });
      setSubmitted(true);
    } catch { /* handled */ } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 w-full max-w-md"
      >
        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="text-base font-semibold mb-1">Access Request Submitted</h3>
            <p className="text-sm text-muted">Your request for <strong>{product.name}</strong> has been sent for approval. You will be notified when approved.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded bg-primary text-white text-sm font-medium">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Request Access</h3>
            </div>
            <p className="text-sm text-muted mb-4">Requesting access to: <span className="text-foreground font-medium">{product.name}</span></p>
            <div className="mb-4">
              <label className="text-xs font-medium text-secondary block mb-1">Business Purpose *</label>
              <textarea
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="Describe your use case and why you need access..."
                className="w-full bg-elevated border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted resize-none h-24 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded border border-border text-sm text-muted hover:text-foreground">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!purpose.trim() || submitting}
                className="flex-1 px-4 py-2 rounded bg-primary text-white text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<DataProduct[]>([]);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('All');
  const [requestProduct, setRequestProduct] = useState<DataProduct | null>(null);

  useEffect(() => {
    api.dataProducts.list({ limit: 100 })
      .then(r => setProducts(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domain === 'All' || p.domain === domain;
    return matchSearch && matchDomain;
  });

  const stats = {
    total: products.length,
    available: products.filter(p => p.status === 'active').length,
    avgQuality: products.length ? Math.round(products.reduce((s, p) => s + p.quality_score, 0) / products.length) : 0,
  };

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="page-header">
        <div>
          <h1 className="page-title">Data Product Marketplace</h1>
          <p className="page-subtitle">Discover and access certified payment data products</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-foreground">{stats.total}</p>
            <p className="text-muted text-xs">Products</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-success">{stats.available}</p>
            <p className="text-muted text-xs">Available</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-primary">{stats.avgQuality}%</p>
            <p className="text-muted text-xs">Avg Quality</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search data products..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${domain === d ? 'bg-primary text-white' : 'bg-card border border-border text-muted hover:text-foreground'}`}
            >
              {d === 'All' ? 'All Domains' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{filtered.length} products found</p>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onRequest={setRequestProduct} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <Database className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No data products found matching your search</p>
            </div>
          )}
        </div>
      )}

      {/* Access Request Modal */}
      <AnimatePresence>
        {requestProduct && (
          <AccessRequestModal product={requestProduct} onClose={() => setRequestProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
