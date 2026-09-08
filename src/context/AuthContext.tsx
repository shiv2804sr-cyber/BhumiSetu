import React, { createContext, useContext, useState, useEffect } from "react";
import { api, getAuthToken, setAuthToken, clearAuthToken, getStoredUser, setStoredUser } from "../lib/api";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  designation: string;
  department: string;
  role: "SUPER_ADMIN" | "CENTRAL_MINISTRY" | "STATE_GOVERNMENT" | "DISTRICT_AUTHORITY" | "PIA" | "FIELD_OFFICER" | "VIEWER";
  state?: string | null;
  district?: string | null;
  phone?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: string) => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Preset demo accounts for quick role-switching
export const DEMO_USERS: Record<string, { email: string; pass: string; title: string }> = {
  DISTRICT_AUTHORITY: {
    email: "lao.nuh@nic.in",
    pass: "Bhoomi@2026",
    title: "District LAO (Nuh, Haryana)",
  },
  CENTRAL_MINISTRY: {
    email: "morth@nic.in",
    pass: "Bhoomi@2026",
    title: "Central Ministry (MoRTH)",
  },
  STATE_GOVERNMENT: {
    email: "state.mh@nic.in",
    pass: "Bhoomi@2026",
    title: "State Govt (Maharashtra Revenue)",
  },
  SUPER_ADMIN: {
    email: "admin@bhumisetu.gov.in",
    pass: "Bhoomi@2026",
    title: "Super Admin (Mission Director)",
  },
  PIA: {
    email: "pia.nhai@nic.in",
    pass: "Bhoomi@2026",
    title: "Project Implementing Agency (NHAI)",
  },
  FIELD_OFFICER: {
    email: "field.surveyor@nic.in",
    pass: "Bhoomi@2026",
    title: "Field Officer / Kanungo",
  },
  VIEWER: {
    email: "viewer@bhumisetu.gov.in",
    pass: "Bhoomi@2026",
    title: "Public Transparency Viewer",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const profile = await api.auth.getProfile();
          setUser(profile);
          setStoredUser(profile);
        } catch (e) {
          console.warn("Session expired or invalid, clearing auth");
          clearAuthToken();
          setUser(null);
          setToken(null);
        }
      } else {
        // Automatically authenticate with default District LAO demo account if no active session
        try {
          const demo = DEMO_USERS.DISTRICT_AUTHORITY;
          const res = await api.auth.login({ email: demo.email, password: demo.pass });
          setAuthToken(res.token);
          setStoredUser(res.user);
          setUser(res.user);
          setToken(res.token);
        } catch (e) {
          // If backend isn't ready yet or login fails, provide offline fallback
          const fallbackUser: UserProfile = {
            id: "usr-nuh-lao-01",
            email: "lao.nuh@nic.in",
            fullName: "Mohammad Irfan Khan",
            designation: "District Land Acquisition Officer (LAO)",
            department: "District Administration, Nuh",
            role: "DISTRICT_AUTHORITY",
            state: "Haryana",
            district: "Nuh",
          };
          setUser(fallbackUser);
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password: pass });
      setAuthToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    clearAuthToken();
    setUser(null);
    setToken(null);
  };

  const switchDemoRole = async (roleKey: string) => {
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      await login(demo.email, demo.pass);
    }
  };

  const hasRole = (...roles: string[]) => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    return roles.some((r) => r.toUpperCase() === user.role.toUpperCase());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchDemoRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
