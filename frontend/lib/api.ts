import { apiClient } from './apiClient';

const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
};

export default api;

export interface AuthRequest {
  username: string;
  password: string;
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

export interface FeatureFlagsResponse {
  escalation: boolean;
  auditCompliance: boolean;
  advancedAccountability: boolean;
  governanceAnalysis: boolean;
  transparency: boolean;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  process: {
    id: string;
    name: string;
    version: string;
  };
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
}

export interface Assignment {
  id: string;
  status: string;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  allowedDurationSeconds?: number;
  actualDurationSeconds?: number;
  processStep: {
    id: string;
    name: string;
    sequenceOrder: number;
  };
  assignedTo: {
    id: string;
    username: string;
    email: string;
  };
}

export interface Delay {
  id: string;
  delaySeconds: number;
  reason?: string;
  reasonCategory?: string;
  detectedAt: string;
  justified: boolean;
  responsibleUser: {
    id: string;
    username: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export const authApi = {
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    return apiClient.login(credentials);
  },
};

export const featureFlagsApi = {
  getFlags: async (): Promise<FeatureFlagsResponse> => {
    // Align with backend admin endpoint and names; map to typed subset
    const map = await apiClient.getFeatureFlags();
    return {
      escalation: !!map.escalation,
      auditCompliance: !!map.auditCompliance,
      advancedAccountability: !!map.advancedAccountability,
      governanceAnalysis: !!map.governanceAnalysis,
      transparency: !!map.transparency,
    } as FeatureFlagsResponse;
  },
};

export const requestsApi = {
  getAll: async (): Promise<Request[]> => {
    const response = await apiClient.get<Request[]>('/requests');
    return response.data as Request[];
  },
  getById: async (id: string): Promise<Request> => {
    const response = await apiClient.get<Request>(`/requests/${id}`);
    return response.data as Request;
  },
  create: async (data: { processId: string; title: string; description: string }): Promise<Request> => {
    const response = await apiClient.post<Request>('/requests', data);
    return response.data as Request;
  },
};

export const assignmentsApi = {
  start: async (assignmentId: string): Promise<Assignment> => {
    const response = await apiClient.post<Assignment>(`/requests/assignments/${assignmentId}/start`);
    return response.data as Assignment;
  },
  complete: async (assignmentId: string, action: string, notes?: string): Promise<Assignment> => {
    const response = await apiClient.post<Assignment>(`/requests/assignments/${assignmentId}/complete`, {
      action,
      notes,
    });
    return response.data as Assignment;
  },
};

export const usersApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data as any[];
  },
};

// REMOVED: rolesApi - Frontend must NOT discover or enumerate available roles.
// Single role is assigned by backend at login; no frontend role discovery allowed.

export const processesApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiClient.get('/processes');
    return response.data as any[];
  },
};
