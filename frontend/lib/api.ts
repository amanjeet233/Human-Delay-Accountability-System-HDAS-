import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add JWT token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.client.post('/auth/login', { username, password });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
  }

  // User management
  async getUsers() {
    const response = await this.client.get('/admin/users');
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.client.post('/admin/users', data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async assignRole(id: string, role: string) {
    const response = await this.client.put(`/admin/users/${id}/role`, { role });
    return response.data;
  }

  async resetPassword(id: string, newPassword: string) {
    const response = await this.client.put(`/admin/users/${id}/reset-password`, { newPassword });
    return response.data;
  }

  // Roles
  async getRoles() {
    const response = await this.client.get('/admin/roles');
    return response.data;
  }

  // Feature flags
  async getFeatureFlags() {
    const response = await this.client.get('/admin/feature-flags');
    return response.data;
  }

  async toggleFeatureFlag(id: string, enabled: boolean) {
    const response = await this.client.put(`/admin/feature-flags/${id}`, { enabled });
    return response.data;
  }

  // Dashboard stats
  async getDashboardStats() {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  }

  // Generic methods
  async get(url: string) {
    const response = await this.client.get(url);
    return response.data;
  }

  async post(url: string, data?: any) {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put(url: string, data?: any) {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete(url: string) {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const api = new ApiClient();
