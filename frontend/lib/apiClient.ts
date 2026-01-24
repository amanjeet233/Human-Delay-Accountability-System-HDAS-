import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

// Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
  path?: string;
}

export interface FeatureDisabledResponse {
  error: 'FEATURE_DISABLED';
  message: 'Feature Coming Soon';
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  success: boolean;
  message: string;
}

// Global error handler (toast/alert) signature
export type ErrorHandler = (message: string, type?: 'error' | 'warn' | 'info') => void;

class ApiClient {
  private axios: AxiosInstance;
  private errorHandler?: ErrorHandler;

  constructor() {
    this.axios = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Allow the app to install a global 403/feature-disabled handler (toast/alert)
  setErrorHandler(handler: ErrorHandler) {
    this.errorHandler = handler;
  }

  private setupInterceptors() {
    // Attach JWT automatically
    this.axios.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Global response interceptor
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (!error.response) {
          // Network or other non-HTTP errors
          this.errorHandler?.('Network error. Please check your connection.', 'error');
          return Promise.reject(error);
        }

        const { status, data } = error.response;
        const payload = data as ApiResponse | undefined;

        switch (status) {
          case 401:
            // Clear token and redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
            break;

          case 403:
            if (payload?.error === 'FEATURE_DISABLED') {
              // Feature flag disabled
              this.errorHandler?.(payload.message || 'Feature Coming Soon', 'warn');
            } else {
              // General forbidden (permission denied)
              this.errorHandler?.(payload.message || 'Access denied', 'error');
            }
            break;

          default:
            // Optionally surface other errors
            this.errorHandler?.(payload?.message || 'Request failed', 'error');
        }

        return Promise.reject(error);
      }
    );
  }

  // Low-level methods
  async get<T = any>(url: string, params?: Record<string, any>): Promise<AxiosResponse<T>> {
    return this.axios.get<T>(url, { params });
  }

  async post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.axios.post<T>(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.axios.put<T>(url, data);
  }

  async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.axios.delete<T>(url);
  }

  // Auth helpers
  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', credentials);
    const { token, username, email, role, roles, permissions } = response.data;

    // Persist token and minimal user info
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username, email, role }));
    }

    return response.data;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  // Feature flag helper
  async getFeatureFlags(): Promise<Record<string, boolean>> {
    const response = await this.get<any>('/admin/feature-flags');
    const data = response.data;
    if (Array.isArray(data)) {
      return data.reduce((acc: Record<string, boolean>, flag: any) => {
        if (flag?.name) acc[flag.name] = Boolean(flag.enabled);
        return acc;
      }, {});
    }
    return data || {};
  }

  // Role sync from token (minimal)
  getCurrentUser(): { username: string; email: string; role: string } | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getCurrentRole(): string | null {
    return this.getCurrentUser()?.role ?? null;
  }
}

// Export a singleton
export const apiClient = new ApiClient();

// Export a hook to install a global error handler from React components
export const useApiErrorHandler = (handler: ErrorHandler) => {
  apiClient.setErrorHandler(handler);
};
