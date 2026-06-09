'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/app.store';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function Topbar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { user, unreadCount, setUnreadCount, notifications, setNotifications } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api.notifications.unreadCount()
      .then(r => setUnreadCount(Number(r.data.count || 0)))
      .catch(() => {});
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
    window.location.reload();
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left — Page title */}
      <div>
        {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>

      {/* Right — Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-foreground transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 280 }}
                exit={{ opacity: 0, width: 0 }}
                className="absolute right-0 top-0 overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Search transactions, reports, data products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  className="w-full h-9 px-4 bg-elevated border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-foreground transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-12 w-80 glass-card shadow-2xl border border-border z-50"
              >
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold">Notifications</span>
                  <button className="text-xs text-primary hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted text-sm">No new notifications</div>
                  ) : notifications.slice(0, 8).map((n: any) => (
                    <div key={n.id} className={cn('p-3 border-b border-border/50 hover:bg-elevated/50 cursor-pointer', !n.is_read && 'bg-primary/5')}>
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-elevated transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-foreground leading-tight">
              {user?.firstName || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] text-muted capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted" />
        </button>
      </div>
    </header>
  );
}
