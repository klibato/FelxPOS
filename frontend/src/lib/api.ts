import axios, { AxiosError } from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT token
api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Types
export interface Transaction {
  id: string;
  uuid: string;
  receiptNumber: string;
  transactionDate: string;
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer' | 'voucher' | 'mobile';
  items: TransactionItem[];
  vatDetails: Record<string, VatDetail>;
  currentHash: string;
  previousHash: string;
}

export interface TransactionItem {
  sku?: string;
  name: string;
  quantity: number;
  price: number;
  vatRate: 'standard' | 'intermediate' | 'reduced' | 'super_reduced' | 'minimum';
}

export interface VatDetail {
  ht: number;
  vat: number;
  ttc: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  price: number;
  vatRate: string;
  category: string;
  isActive: boolean;
  trackInventory?: boolean;
  stockQuantity?: number;
}

export interface DailyStats {
  totalTransactions: number;
  totalSales: number;
  totalRefunds: number;
  totalRevenue: number;
  totalRefunded: number;
  paymentMethods: Record<string, number>;
  vatBreakdown: Record<string, VatDetail>;
}

export interface DailyClosure {
  id: string;
  closureDate: string;
  totalTransactions: number;
  totalTtc: number;
  vatBreakdown: Record<string, VatDetail>;
  paymentBreakdown: Record<string, number>;
  isVerified: boolean;
  archivedAt?: string;
}

export interface Tenant {
  id: string;
  siret: string;
  companyName: string;
  vatNumber: string;
  businessType: 'restaurant' | 'retail' | 'beauty' | 'event';
  nf525Compliant: boolean;
}

// API Endpoints
export const transactionsApi = {
  create: (data: {
    items: TransactionItem[];
    paymentMethod: string;
    customerEmail?: string;
  }) => api.post<Transaction>('/transactions', data),

  list: (params?: { date?: string; registerId?: string }) =>
    api.get<Transaction[]>('/transactions', { params }),

  getOne: (uuid: string) => api.get<Transaction>(`/transactions/${uuid}`),

  verifyHashChain: () => api.get<{ isValid: boolean }>('/transactions/verify-hash-chain'),
};

export const closuresApi = {
  create: (data: { date: string; registerId: string }) =>
    api.post<DailyClosure>('/closures', data),

  list: () => api.get<DailyClosure[]>('/closures'),

  getOne: (id: string) => api.get<DailyClosure>(`/closures/${id}`),
};

export const statsApi = {
  daily: (params?: { date?: string }) => api.get<DailyStats>('/stats/daily', { params }),
};

export const productsApi = {
  list: () => api.get<Product[]>('/products'),

  create: (data: Partial<Product>) => api.post<Product>('/products', data),

  update: (id: string, data: Partial<Product>) =>
    api.patch<Product>(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),
};

export const auditApi = {
  getAnomalies: () =>
    api.get<Array<{ message: string; severity: 'warning' | 'error' }>>('/audit/anomalies'),
};

// Operators API
export interface Operator {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'cashier' | 'admin';
  isActive: boolean;
  lastActivity?: string;
}

export const operatorsApi = {
  list: () => api.get<Operator[]>('/operators'),
  create: (data: Partial<Operator>) => api.post<Operator>('/operators', data),
  update: (id: string, data: Partial<Operator>) => api.patch<Operator>(`/operators/${id}`, data),
  delete: (id: string) => api.delete(`/operators/${id}`),
};

// Registers API
export interface CashRegister {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  lastActivity?: string;
}

export const registersApi = {
  list: () => api.get<CashRegister[]>('/registers'),
  create: (data: Partial<CashRegister>) => api.post<CashRegister>('/registers', data),
  update: (id: string, data: Partial<CashRegister>) => api.patch<CashRegister>(`/registers/${id}`, data),
  delete: (id: string) => api.delete(`/registers/${id}`),
};

// Categories API
export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  update: (id: string, data: Partial<Category>) => api.patch<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Tenant/Settings API
export const tenantsApi = {
  getCurrent: () => api.get<Tenant>('/tenants/current'),
  update: (data: Partial<Tenant>) => api.patch<Tenant>('/tenants/current', data),
};

// FEC Export API
export interface FECExport {
  id: string;
  startDate: string;
  endDate: string;
  year: number;
  createdAt: string;
  downloadUrl?: string;
}

export const fecApi = {
  generate: (data: { startDate: string; endDate: string; year: number }) =>
    api.post<FECExport>('/fec/generate', data),
  list: () => api.get<FECExport[]>('/fec'),
  download: (id: string) => api.get(`/fec/${id}/download`, { responseType: 'blob' }),
};

// Archives API
export interface Archive {
  id: string;
  date: string;
  type: string;
  size: number;
  url: string;
  hash: string;
}

export const archivesApi = {
  list: (params?: { startDate?: string; endDate?: string }) =>
    api.get<Archive[]>('/archives', { params }),
};
