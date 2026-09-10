/**
 * BhumiSetu Frontend API Client
 * Centralized API communication with JWT authentication.
 */

const API_BASE = "";

/* -------------------------------------------------------------------------- */
/* Auth Storage                                                               */
/* -------------------------------------------------------------------------- */

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
  } catch {
    return null;
  }
}

export function setStoredUser(user: any) {
  localStorage.setItem(
    "bhumisetu_user",
    JSON.stringify(user)
  );
}

/* -------------------------------------------------------------------------- */
/* Generic Request                                                            */
/* -------------------------------------------------------------------------- */

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        `API Error: ${response.status}`
      );
    }

    return data?.data !== undefined
      ? data.data
      : data;
  }

  if (!response.ok) {
    throw new Error(
      `HTTP Error: ${response.statusText || "Request failed"}`
    );
  }

  return (await response.text()) as unknown as T;
}

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

export const api = {

  /* ------------------------------------------------------------------------ */
  /* GET                                                                      */
  /* ------------------------------------------------------------------------ */

  get: <T>(
    url: string,
    params?: Record<
      string,
      string | number | undefined
    >
  ) => {
    let query = "";

    if (params) {
      const filtered = Object.entries(params)
        .filter(
          ([, value]) =>
            value !== undefined &&
            value !== ""
        );

      if (filtered.length > 0) {
        query =
          "?" +
          new URLSearchParams(
            filtered.map(
              ([key, value]) => [
                key,
                String(value),
              ]
            )
          ).toString();
      }
    }

    return request<T>(
      `${url}${query}`
    );
  },

  /* ------------------------------------------------------------------------ */
  /* POST                                                                     */
  /* ------------------------------------------------------------------------ */

  post: <T>(
    url: string,
    body?: any
  ) =>
    request<T>(
      url,
      {
        method: "POST",
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    ),

  /* ------------------------------------------------------------------------ */
  /* PUT                                                                      */
  /* ------------------------------------------------------------------------ */

  put: <T>(
    url: string,
    body?: any
  ) =>
    request<T>(
      url,
      {
        method: "PUT",
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    ),

  /* ------------------------------------------------------------------------ */
  /* File Upload                                                              */
  /* ------------------------------------------------------------------------ */

  upload: async <T>(
    url: string,
    formData: FormData
  ): Promise<T> => {

    const token = getAuthToken();

    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] =
        `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE}${url}`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    const data = contentType.includes(
      "application/json"
    )
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        "Upload failed"
      );
    }

    return data?.data !== undefined
      ? data.data
      : data;
  },

  /* ======================================================================== */
  /* AUTH                                                                     */
  /* ======================================================================== */

  auth: {

    /* ---------------------------------------------------------------------- */
    /* Existing password login                                                */
    /* ---------------------------------------------------------------------- */

    login: (
      credentials: {
        email: string;
        password: string;
      }
    ) =>
      api.post<{
        token: string;
        user: any;
      }>(
        "/api/v1/auth/login",
        credentials
      ),

    /* ---------------------------------------------------------------------- */
    /* NEW: Request OTP                                                       */
    /* ---------------------------------------------------------------------- */

    requestOtp: (
      identifier: string
    ) =>
      api.post<{
        success: boolean;
        message: string;
      }>(
        "/api/v1/auth/request-otp",
        {
          identifier,
        }
      ),

    /* ---------------------------------------------------------------------- */
    /* NEW: Verify OTP                                                        */
    /* ---------------------------------------------------------------------- */

    verifyOtp: (
      identifier: string,
      otp: string
    ) =>
      api.post<{
        token: string;
        user: any;
      }>(
        "/api/v1/auth/verify-otp",
        {
          identifier,
          otp,
        }
      ),

    /* ---------------------------------------------------------------------- */
    /* Register                                                                */
    /* ---------------------------------------------------------------------- */

    register: (
      userData: any
    ) =>
      api.post<{
        token: string;
        user: any;
      }>(
        "/api/v1/auth/register",
        userData
      ),

    /* ---------------------------------------------------------------------- */
    /* Current profile                                                        */
    /* ---------------------------------------------------------------------- */

    getProfile: () =>
      api.get<any>(
        "/api/v1/auth/me"
      ),

    /* ---------------------------------------------------------------------- */
    /* Logout                                                                  */
    /* ---------------------------------------------------------------------- */

    logout: () =>
      api.post<any>(
        "/api/v1/auth/logout"
      ),
  },

  /* ======================================================================== */
  /* PROJECT PROPOSALS                                                        */
  /* ======================================================================== */

  projects: {

    getAll: (
      params?: {
        state?: string;
        district?: string;
        ministry?: string;
        search?: string;
      }
    ) =>
      api.get<any[]>(
        "/api/v1/projects",
        params
      ),

    getById: (
      id: string
    ) =>
      api.get<any>(
        `/api/v1/projects/${id}`
      ),

    create: (
      data: any
    ) =>
      api.post<any>(
        "/api/v1/projects",
        data
      ),

    updateWorkflow: (
      id: string,
      action: string,
      comments?: string
    ) =>
      api.post<any>(
        `/api/v1/projects/${id}/workflow`,
        {
          action,
          comments,
        }
      ),
  },

  /* ======================================================================== */
  /* GIS PARCELS                                                              */
  /* ======================================================================== */

  parcels: {

    getGeoJSON: (
      params?: {
        state?: string;
        district?: string;
        projectId?: string;
      }
    ) =>
      api.get<any>(
        "/api/v1/parcels",
        params
      ),

    getList: (
      params?: {
        state?: string;
        district?: string;
      }
    ) =>
      api.get<any[]>(
        "/api/v1/parcels/list",
        params
      ),
  },

  /* ======================================================================== */
  /* COMPENSATION                                                             */
  /* ======================================================================== */

  compensation: {

    getAll: (
      params?: {
        state?: string;
        district?: string;
        projectId?: string;
      }
    ) =>
      api.get<any[]>(
        "/api/v1/compensation",
        params
      ),

    createAssessment: (
      data: any
    ) =>
      api.post<any>(
        "/api/v1/compensation",
        data
      ),

    disburseDBT: (
      id: string
    ) =>
      api.post<any>(
        `/api/v1/compensation/${id}/disburse`
      ),
  },

  /* ======================================================================== */
  /* R&R                                                                      */
  /* ======================================================================== */

  rnr: {

    getAll: (
      params?: {
        state?: string;
        district?: string;
        projectId?: string;
      }
    ) =>
      api.get<any[]>(
        "/api/v1/rnr",
        params
      ),

    create: (
      data: any
    ) =>
      api.post<any>(
        "/api/v1/rnr",
        data
      ),

    updateStatus: (
      id: string,
      status: string
    ) =>
      api.put<any>(
        `/api/v1/rnr/${id}/status`,
        {
          status,
        }
      ),
  },

  /* ======================================================================== */
  /* DOCUMENTS                                                                */
  /* ======================================================================== */

  documents: {

    getAll: (
      params?: {
        type?: string;
        status?: string;
      }
    ) =>
      api.get<any[]>(
        "/api/v1/documents",
        params
      ),

    upload: (
      formData: FormData
    ) =>
      api.upload<any>(
        "/api/v1/documents",
        formData
      ),

    verify: (
      id: string,
      status: string
    ) =>
      api.put<any>(
        `/api/v1/documents/${id}/verify`,
        {
          status,
        }
      ),
  },

  /* ======================================================================== */
  /* AWARDS                                                                   */
  /* ======================================================================== */

  awards: {

    getAll: (
      params?: {
        projectId?: string;
      }
    ) =>
      api.get<any[]>(
        "/api/v1/awards",
        params
      ),

    create: (
      data: any
    ) =>
      api.post<any>(
        "/api/v1/awards",
        data
      ),

    publish: (
      id: string
    ) =>
      api.post<any>(
        `/api/v1/awards/${id}/publish`
      ),
  },

  /* ======================================================================== */
  /* GRIEVANCES                                                               */
  /* ======================================================================== */

  grievances: {

    getAll: (
      params?: {
        status?: string;
        search?: string;
      }
    ) =>
      api.get<any[]>(
        "/api/v1/grievances",
        params
      ),

    submit: (
      data: any
    ) =>
      api.post<any>(
        "/api/v1/grievances",
        data
      ),

    updateStatus: (
      id: string,
      status: string,
      resolutionNotes?: string
    ) =>
      api.put<any>(
        `/api/v1/grievances/${id}/status`,
        {
          status,
          resolutionNotes,
        }
      ),
  },

  /* ======================================================================== */
  /* ALERTS                                                                   */
  /* ======================================================================== */

  alerts: {

    getAll: (
      params?: {
        unreadOnly?: boolean;
      }
    ) =>
      api.get<any[]>(
        "/api/v1/alerts",
        params
          ? {
              unreadOnly:
                params.unreadOnly
                  ? "true"
                  : "false",
            }
          : undefined
      ),

    markAsRead: (
      id: string
    ) =>
      api.post<any>(
        `/api/v1/alerts/${id}/read`
      ),
  },

  /* ======================================================================== */
  /* DASHBOARD                                                                */
  /* ======================================================================== */

  dashboard: {

    getKPIs: (
      params?: {
        state?: string;
        district?: string;
      }
    ) =>
      api.get<any>(
        "/api/v1/dashboard/kpis",
        params
      ),

    getSummary: (
      params?: {
        state?: string;
        district?: string;
      }
    ) =>
      api.get<any>(
        "/api/v1/dashboard/summary",
        params
      ),
  },

  /* ======================================================================== */
  /* REPORTS                                                                  */
  /* ======================================================================== */

  reports: {

    getAll: () =>
      api.get<any[]>(
        "/api/v1/reports"
      ),

    generate: (
      data: any
    ) =>
      api.post<any>(
        "/api/v1/reports/generate",
        data
      ),

    exportCSVUrl: (
      type: string = "projects"
    ) =>
      `/api/v1/reports/export?type=${encodeURIComponent(type)}`,
  },
};