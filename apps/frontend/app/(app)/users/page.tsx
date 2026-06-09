'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Shield, Mail, UserCheck } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { api } from '@/lib/api';
import { statusBadgeClass } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login_at: string;
}

const ROLES = ['bank_admin', 'operations', 'compliance', 'executive', 'auditor'];

const userColumns: ColumnDef<User>[] = [
  {
    id: 'name', header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
          {row.original.first_name?.[0]}{row.original.last_name?.[0]}
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">{row.original.first_name} {row.original.last_name}</p>
          <p className="text-[10px] text-muted">{row.original.email}</p>
        </div>
      </div>
    )
  },
  { accessorKey: 'role', header: 'Role', cell: ({ getValue }) => <span className="badge-info capitalize">{(getValue() as string).replace('_', ' ')}</span> },
  {
    accessorKey: 'is_active', header: 'Status',
    cell: ({ getValue }) => <span className={getValue() ? 'badge-success' : 'badge-danger'}>{getValue() ? 'Active' : 'Inactive'}</span>
  },
  { accessorKey: 'last_login_at', header: 'Last Login', cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleDateString() : 'Never' },
];

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(ROLES[0]);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    api.users.list({ limit: 100 })
      .then(r => setUsers(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    setInviting(true);
    try {
      await api.users.invite({ email: inviteEmail, role: inviteRole });
      setShowInvite(false);
      setInviteEmail('');
    } catch { } finally { setInviting(false); }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'bank_admin').length,
  };

  return (
    <div className="space-y-6">
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage tenant users and roles</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-success' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-elevated border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary" />
          </div>
        </div>
        <DataTable data={filtered} columns={userColumns} loading={loading} pageSize={15} />
      </motion.div>

      <AnimatePresence>
        {showInvite && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold">Invite User</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">Email Address</label>
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@bank.com"
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary block mb-1">Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                    className="w-full bg-elevated border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                    {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowInvite(false)} className="flex-1 px-4 py-2 rounded border border-border text-sm text-muted hover:text-foreground">Cancel</button>
                <button onClick={handleInvite} disabled={!inviteEmail || inviting}
                  className="flex-1 px-4 py-2 rounded bg-primary text-white text-sm font-medium disabled:opacity-50">
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
