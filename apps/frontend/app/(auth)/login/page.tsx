'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { email: 'admin@bank-alpha.com', role: 'Bank Admin', bank: 'Alpha Bank', color: '#2563EB' },
  { email: 'executive@bank-alpha.com', role: 'Executive', bank: 'Alpha Bank', color: '#2563EB' },
  { email: 'compliance@bank-beta.com', role: 'Compliance', bank: 'Beta Financial', color: '#10B981' },
  { email: 'operations@bank-gamma.com', role: 'Operations', bank: 'Gamma Payments', color: '#F59E0B' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@bank-alpha.com');
  const [password, setPassword] = useState('BankAdmin123!');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('tenant_id', user.tenant_id);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const loginAs = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('BankAdmin123!');
  };

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.06) 0%, transparent 50%)',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Payments Data Portal</h1>
          <p className="text-sm text-muted mt-1">Enterprise payment intelligence platform</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-7"
        >
          <h2 className="text-base font-semibold text-foreground mb-1">Sign in</h2>
          <p className="text-xs text-muted mb-5">Use a demo account below or enter your credentials</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                placeholder="you@bank.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors mt-1"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-5 pt-4 border-t border-border/50">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => loginAs(acc)}
                  className="text-left p-2 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <p className="text-[11px] font-semibold" style={{ color: acc.color }}>{acc.role}</p>
                  <p className="text-[10px] text-muted truncate">{acc.bank}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted mt-2 text-center">
              All demo accounts use password: <code className="text-primary">BankAdmin123!</code>
            </p>
          </div>
        </motion.div>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>JWT secured · Multi-tenant · Row-level security enforced</span>
        </motion.div>
      </div>
    </div>
  );
}
