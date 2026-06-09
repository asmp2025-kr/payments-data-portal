import axios, { AxiosInstance } from 'axios';

// Bare axios client for auth endpoints (no token needed)
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
});

let apiInstance: AxiosInstance | null = null;

export function getApi(): AxiosInstance {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api',
      timeout: 30000,
    });

    // Request interceptor — inject auth token + tenant header
    apiInstance.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token') || localStorage.getItem('kc_token');
        const tenantId = localStorage.getItem('tenant_id');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
      }
      return config;
    });

    // Response interceptor — handle 401 (token refresh)
    apiInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      },
    );
  }
  return apiInstance;
}

// Domain API helpers
export const api = {
  // Executive
  executive: {
    summary: (params?: any) => getApi().get('/clearing/summary', { params }),
    fraudSummary: (params?: any) => getApi().get('/fraud/summary', { params }),
    settlementSummary: (params?: any) => getApi().get('/settlement/summary', { params }),
    complianceScore: () => getApi().get('/compliance/score'),
  },

  // Clearing
  clearing: {
    summary: (params?: any) => getApi().get('/clearing/summary', { params }),
    hourlyTrend: (params?: any) => getApi().get('/clearing/trend/hourly', { params }),
    dailyTrend: (params?: any) => getApi().get('/clearing/trend/daily', { params }),
    transactions: (params?: any) => getApi().get('/clearing/transactions', { params }),
    participants: (params?: any) => getApi().get('/clearing/participants', { params }),
    exceptions: (params?: any) => getApi().get('/clearing/exceptions', { params }),
  },

  // Settlement
  settlement: {
    summary: (params?: any) => getApi().get('/settlement/summary', { params }),
    positions: (params?: any) => getApi().get('/settlement/positions', { params }),
    trend: (params?: any) => getApi().get('/settlement/trend', { params }),
    records: (params?: any) => getApi().get('/settlement/records', { params }),
    liquidity: () => getApi().get('/settlement/liquidity'),
  },

  // Fraud
  fraud: {
    summary: (params?: any) => getApi().get('/fraud/summary', { params }),
    trend: (params?: any) => getApi().get('/fraud/trend', { params }),
    cases: (params?: any) => getApi().get('/fraud/cases', { params }),
    merchantRisk: (params?: any) => getApi().get('/fraud/merchant-risk', { params }),
    byType: (params?: any) => getApi().get('/fraud/by-type', { params }),
    geographic: (params?: any) => getApi().get('/fraud/geographic', { params }),
  },

  // AML
  aml: {
    summary: (params?: any) => getApi().get('/aml/summary', { params }),
    trend: (params?: any) => getApi().get('/aml/trend', { params }),
    riskDistribution: () => getApi().get('/aml/risk-distribution'),
    alerts: (params?: any) => getApi().get('/aml/alerts', { params }),
    sar: (params?: any) => getApi().get('/aml/sar', { params }),
    sanctions: (params?: any) => getApi().get('/aml/sanctions', { params }),
  },

  // Accounts
  accounts: {
    summary: () => getApi().get('/accounts/summary'),
    list: (params?: any) => getApi().get('/accounts', { params }),
    dormancy: () => getApi().get('/accounts/dormancy'),
  },

  // Cards
  cards: {
    summary: (params?: any) => getApi().get('/cards/summary', { params }),
    spendTrend: (params?: any) => getApi().get('/cards/spend-trend', { params }),
    declineAnalysis: (params?: any) => getApi().get('/cards/decline-analysis', { params }),
    merchantSpend: (params?: any) => getApi().get('/cards/merchant-spend', { params }),
    byChannel: (params?: any) => getApi().get('/cards/by-channel', { params }),
  },

  // Compliance
  compliance: {
    summary: () => getApi().get('/compliance/summary'),
    findings: (params?: any) => getApi().get('/compliance/findings', { params }),
    bySeverity: () => getApi().get('/compliance/by-severity'),
    score: () => getApi().get('/compliance/score'),
  },

  // Scheme
  scheme: {
    summary: (params?: any) => getApi().get('/scheme/summary', { params }),
    participantPerformance: (params?: any) => getApi().get('/scheme/participants/performance', { params }),
    trend: (params?: any) => getApi().get('/scheme/trend', { params }),
    participants: () => getApi().get('/scheme/participants'),
  },

  // Reconciliation
  reconciliation: {
    summary: (params?: any) => getApi().get('/reconciliation/summary', { params }),
    breaks: (params?: any) => getApi().get('/reconciliation/breaks', { params }),
    aging: () => getApi().get('/reconciliation/aging'),
    trend: (params?: any) => getApi().get('/reconciliation/trend', { params }),
  },

  // Finance
  finance: {
    revenueSummary: (params?: any) => getApi().get('/finance/revenue/summary', { params }),
    revenueTrend: (params?: any) => getApi().get('/finance/revenue/trend', { params }),
    interchange: (params?: any) => getApi().get('/finance/interchange', { params }),
  },

  // Data Products
  dataProducts: {
    list: (params?: any) => getApi().get('/data-products', { params }),
    get: (id: string) => getApi().get(`/data-products/${id}`),
    create: (data: any) => getApi().post('/data-products', data),
    update: (id: string, data: any) => getApi().patch(`/data-products/${id}`, data),
    requestAccess: (id: string, reason: string) => getApi().post(`/data-products/${id}/access-request`, { reason }),
    quality: (id: string) => getApi().get(`/data-products/${id}/quality`),
  },

  // Dashboards
  dashboards: {
    list: (params?: any) => getApi().get('/dashboards', { params }),
    templates: () => getApi().get('/dashboards/templates'),
    get: (id: string) => getApi().get(`/dashboards/${id}`),
    create: (data: any) => getApi().post('/dashboards', data),
    update: (id: string, data: any) => getApi().patch(`/dashboards/${id}`, data),
    clone: (id: string) => getApi().post(`/dashboards/${id}/clone`),
    share: (id: string) => getApi().post(`/dashboards/${id}/share`),
    delete: (id: string) => getApi().delete(`/dashboards/${id}`),
  },

  // Reports
  reports: {
    catalog: (params?: any) => getApi().get('/reports/catalog', { params }),
    list: (params?: any) => getApi().get('/reports', { params }),
    runs: (reportId?: string) => getApi().get('/reports/runs', { params: reportId ? { reportId } : {} }),
    generate: (data: any) => getApi().post('/reports/generate', data),
    download: (runId: string) => getApi().get(`/reports/runs/${runId}/download`),
  },

  // Notifications
  notifications: {
    list: (params?: any) => getApi().get('/notifications', { params }),
    unreadCount: () => getApi().get('/notifications/unread-count'),
    markRead: (id: string) => getApi().patch(`/notifications/${id}/read`),
    markAllRead: () => getApi().patch('/notifications/mark-all-read'),
  },

  // Audit
  audit: {
    logs: (params?: any) => getApi().get('/audit/logs', { params }),
  },

  // Search
  search: (q: string, type?: string) => getApi().get('/search', { params: { q, type } }),

  // Auth
  auth: {
    me: () => getApi().get('/auth/me'),
  },

  // Subscriptions
  subscriptions: {
    plans: () => getApi().get('/subscriptions/plans'),
    current: () => getApi().get('/subscriptions/current'),
  },
};
