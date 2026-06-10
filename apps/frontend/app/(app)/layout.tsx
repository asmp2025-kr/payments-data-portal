'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAppStore } from '@/lib/store/app.store';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect to login if no JWT token found
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen"
      >
        <Topbar />
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
