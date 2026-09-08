/**
 * BhumiSetu Frontend API Client
 * Centralized, type-safe API communication with JWT authentication token injection
 */

const API_BASE = ""; // Relative URL allows dev & production reverse proxying

export function getAuthToken(): string | null {
  return localStorage.getItem("bhumisetu_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("bhumisetu_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("bhumisetu_token");
  localStorage.removeItem("bhumisetu_user");
}

export function getStoredUser(): any | null {
  try {
    const raw = localStorage.getItem("bhumisetu_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user: any) {
  localStorage.setItem("bhumisetu_user", JSON.stringify(user));
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || `API Error: ${response.status}`);
    }
    // Return data property if standardized response wrapper, or data directly
    return data.data !== undefined ? data.data : data;
  }

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.statusText}`);
  }

  return (await response.text()) as unknown as T;
}

export const api = {
  get: <T>(url: string, params?: Record<string, string | number | undefined>) => {
    let query = "";
    if (params) {
      const filtered = Object.entries(params).filter(([_, v]) => v !== undefined && v !== "");
      if (filtered.length > 0) {
        query = "?" + new URLSearchParams(filtered as [string, string][]).toString();
      }
    }
    return request<T>(`${url}${query}`);
  },

  post: <T>(url: string, body?: any) =>
    request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: any) =>
    request<T>(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  upload: async <T>(url: string, formData: FormData): Promise<T> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers,
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Upload failed");
    }
    return json.data !== undefined ? json.data : json;
  },

  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post<{ token: string; user: any }>("/api/v1/auth/login", credentials),
    register: (userData: any) =>
      api.post<{ token: string; user: any }>("/api/v1/auth/register", userData),
    getProfile: () => api.get<any>("/api/v1/auth/me"),
    logout: () => api.post<any>("/api/v1/auth/logout"),
  },

  // Project Proposals
  projects: {
    getAll: (params?: { state?: string; district?: string; ministry?: string; search?: string }) =>
      api.get<any[]>("/api/v1/projects", params),
    getById: (id: string) => api.get<any>(`/api/v1/projects/${id}`),
    create: (data: any) => api.post<any>("/api/v1/projects", data),
    updateWorkflow: (id: string, action: string, comments?: string) =>
      api.post<any>(`/api/v1/projects/${id}/workflow`, { action, comments }),
  },

  // GIS Parcels
  parcels: {
    getGeoJSON: (params?: { state?: string; district?: string; projectId?: string }) =>
      api.get<any>("/api/v1/parcels", params),
    getList: (params?: { state?: string; district?: string }) =>
      api.get<any[]>("/api/v1/parcels/list", params),
  },

  // Compensation
  compensation: {
    getAll: (params?: { state?: string; district?: string; projectId?: string }) =>
      api.get<any[]>("/api/v1/compensation", params),
    createAssessment: (data: any) => api.post<any>("/api/v1/compensation", data),
    disburseDBT: (id: string) => api.post<any>(`/api/v1/compensation/${id}/disburse`),
  },

  // R&R
  rnr: {
    getAll: (params?: { state?: string; district?: string; projectId?: string }) =>
      api.get<any[]>("/api/v1/rnr", params),
    create: (data: any) => api.post<any>("/api/v1/rnr", data),
    updateStatus: (id: string, status: string) => api.put<any>(`/api/v1/rnr/${id}/status`, { status }),
  },

  // Documents
  documents: {
    getAll: (params?: { type?: string; status?: string }) =>
      api.get<any[]>("/api/v1/documents", params),
    upload: (formData: FormData) => api.upload<any>("/api/v1/documents", formData),
    verify: (id: string, status: string) => api.put<any>(`/api/v1/documents/${id}/verify`, { status }),
  },

  // Awards
  awards: {
    getAll: (params?: { projectId?: string }) => api.get<any[]>("/api/v1/awards", params),
    create: (data: any) => api.post<any>("/api/v1/awards", data),
    publish: (id: string) => api.post<any>(`/api/v1/awards/${id}/publish`),
  },

  // Grievances
  grievances: {
    getAll: (params?: { status?: string; search?: string }) =>
      api.get<any[]>("/api/v1/grievances", params),
    submit: (data: any) => api.post<any>("/api/v1/grievances", data),
    updateStatus: (id: string, status: string, resolutionNotes?: string) =>
      api.put<any>(`/api/v1/grievances/${id}/status`, { status, resolutionNotes }),
  },

  // Alerts
  alerts: {
    getAll: (params?: { unreadOnly?: boolean }) =>
      api.get<any[]>("/api/v1/alerts", params ? { unreadOnly: params.unreadOnly ? "true" : "false" } : undefined),
    markAsRead: (id: string) => api.post<any>(`/api/v1/alerts/${id}/read`),
  },

  // Dashboard KPIs
  dashboard: {
    getKPIs: (params?: { state?: string; district?: string }) =>
      api.get<any>("/api/v1/dashboard/kpis", params),
    getSummary: (params?: { state?: string; district?: string }) =>
      api.get<any>("/api/v1/dashboard/summary", params),
  },

  // Reports
  reports: {
    getAll: () => api.get<any[]>("/api/v1/reports"),
    generate: (data: any) => api.post<any>("/api/v1/reports/generate", data),
    exportCSVUrl: (type: string = "projects") => `/api/v1/reports/export?type=${type}`,
  },
};
