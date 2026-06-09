'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Banknote, Users, ShieldAlert,
  AlertTriangle, ClipboardCheck, Building2, RefreshCw, TrendingUp, Package,
  BarChart3, FileText, Settings, LogOut, ChevronLeft, ChevronRight, Bell,
  Search, Database, Wrench, Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store/app.store';
import { logout } from '@/lib/auth';

const NAV_GROUPS = [
  {
    label: 'Analytics',
    items: [
      { label: 'Executive', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Clearing', href: '/clearing', icon: ArrowLeftRight },
      { label: 'Settlement', href: '/settlement', icon: Banknote },
      { label: 'Accounts', href: '/accounts', icon: Users },
      { label: 'Cards', href: '/cards', icon: CreditCard },
    ],
  },
  {
    label: 'Risk & Compliance',
    items: [
      { label: 'Fraud', href: '/fraud', icon: ShieldAlert },
      { label: 'AML', href: '/aml', icon: AlertTriangle },
      { label: 'Compliance', href: '/compliance', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Scheme', href: '/scheme', icon: Building2 },
      { label: 'Reconciliation', href: '/reconciliation', icon: RefreshCw },
      { label: 'Finance', href: '/finance', icon: TrendingUp },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Marketplace', href: '/marketplace', icon: Package },
      { label: 'Reports', href: '/reports', icon: FileText },
      { label: 'Builder', href: '/builder', icon: Wrench },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Subscriptions', href: '/subscriptions', icon: Receipt },
      { label: 'Audit', href: '/audit', icon: Database },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border bg-card overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border min-h-[64px]">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm gradient-text">Payments Portal</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-foreground transition-colors ml-auto"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-semibold text-dimmed uppercase tracking-widest px-3 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'nav-item',
                        isActive && 'active',
                        sidebarCollapsed && 'justify-center px-2',
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted')} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <button
          onClick={logout}
          className={cn('nav-item w-full text-danger hover:bg-danger/10', sidebarCollapsed && 'justify-center px-2')}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
