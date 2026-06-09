import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface TenantTheme {
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  name: string;
  logoUrl: string;
}

interface AppState {
  user: User | null;
  theme: TenantTheme;
  sidebarCollapsed: boolean;
  notifications: any[];
  unreadCount: number;
  setUser: (user: User | null) => void;
  setTheme: (theme: Partial<TenantTheme>) => void;
  toggleSidebar: () => void;
  setNotifications: (n: any[]) => void;
  setUnreadCount: (c: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: {
        primaryColor: '#2563EB',
        backgroundColor: '#020617',
        cardColor: '#0F172A',
        name: 'Payments Portal',
        logoUrl: '',
      },
      sidebarCollapsed: false,
      notifications: [],
      unreadCount: 0,
      setUser: (user) => set({ user }),
      setTheme: (theme) => set((s) => ({ theme: { ...s.theme, ...theme } })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setNotifications: (notifications) => set({ notifications }),
      setUnreadCount: (unreadCount) => set({ unreadCount }),
    }),
    { name: 'payments-portal-app', partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }) },
  ),
);
