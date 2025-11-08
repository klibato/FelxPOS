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
  name: string;
  price: number;
  vatRate: string;
  category: string;
  isActive: boolean;
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
