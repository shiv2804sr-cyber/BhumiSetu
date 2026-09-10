import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import {
  api,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getStoredUser,
  setStoredUser,
} from "../lib/api";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  designation: string;
  department: string;

  role:
    | "SUPER_ADMIN"
    | "CENTRAL_MINISTRY"
    | "STATE_GOVERNMENT"
    | "DISTRICT_AUTHORITY"
    | "PIA"
    | "FIELD_OFFICER"
    | "VIEWER";

  state?: string | null;
  district?: string | null;
  phone?: string | null;
}

export interface RegisterVerifyPayload {
  email: string;
  otp: string;
  fullName: string;
  password: string;
  designation?: string;
  department?: string;
  state?: string;
  district?: string;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Existing password login
  login: (email: string, password: string) => Promise<void>;

  // Existing account OTP authentication
  requestOtp: (identifier: string) => Promise<void>;
  verifyOtp: (identifier: string, otp: string) => Promise<void>;

  // New account registration OTP authentication
  registerRequestOtp: (email: string) => Promise<void>;
  registerVerifyOtp: (
    payload: RegisterVerifyPayload
  ) => Promise<void>;

  logout: () => void;

  // Kept for compatibility with older components
  switchDemoRole: (role: string) => Promise<void>;

  hasRole: (...roles: string[]) => boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

/*
|--------------------------------------------------------------------------
| Demo users
|--------------------------------------------------------------------------
|
| Kept for backward compatibility with older parts
| of the application.
|
*/

export const DEMO_USERS: Record<
  string,
  {
    email: string;
    pass: string;
    title: string;
  }
> = {
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

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<UserProfile | null>(
      getStoredUser()
    );

  const [token, setToken] =
    useState<string | null>(
      getAuthToken()
    );

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  /*
  |--------------------------------------------------------------------------
  | Restore existing session
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function initAuth() {
      const storedToken = getAuthToken();

      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile =
          await api.auth.getProfile();

        setUser(profile);
        setStoredUser(profile);
        setToken(storedToken);
      } catch (error) {
        console.warn(
          "Stored authentication session is invalid or expired."
        );

        clearAuthToken();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Existing email + password login
  |--------------------------------------------------------------------------
  */

  const login = async (
    email: string,
    password: string
  ) => {
    setIsLoading(true);

    try {
      const res =
        await api.auth.login({
          email,
          password,
        });

      if (!res?.token) {
        throw new Error(
          "Authentication succeeded but no session token was returned."
        );
      }

      setAuthToken(res.token);

      if (res.user) {
        setStoredUser(res.user);
        setUser(res.user);
      }

      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | EXISTING ACCOUNT - REQUEST OTP
  |--------------------------------------------------------------------------
  |
  | POST /api/v1/auth/request-otp
  |
  | Used only for an already registered BhoomiSetu account.
  |
  */

  const requestOtp = async (
    identifier: string
  ): Promise<void> => {
    const value = identifier.trim();

    if (!value) {
      throw new Error(
        "Please enter your registered email address."
      );
    }

    try {
      await api.post(
        "/api/v1/auth/request-otp",
        {
          identifier: value,
        }
      );
    } catch (error: any) {
      throw new Error(
        error?.message ||
          "Unable to send verification code."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | EXISTING ACCOUNT - VERIFY OTP
  |--------------------------------------------------------------------------
  |
  | POST /api/v1/auth/verify-otp
  |
  */

  const verifyOtp = async (
    identifier: string,
    otp: string
  ): Promise<void> => {
    const value = identifier.trim();
    const code = otp.trim();

    if (!value) {
      throw new Error(
        "Email address is required."
      );
    }

    if (!code) {
      throw new Error(
        "Verification code is required."
      );
    }

    try {
      const res =
        await api.post<{
          token: string;
          user: UserProfile;
        }>(
          "/api/v1/auth/verify-otp",
          {
            identifier: value,
            otp: code,
          }
        );

      if (!res?.token) {
        throw new Error(
          "OTP verified but no authentication token was returned."
        );
      }

      setAuthToken(res.token);
      setToken(res.token);

      if (res.user) {
        setStoredUser(res.user);
        setUser(res.user);
      }
    } catch (error: any) {
      throw new Error(
        error?.message ||
          "Invalid or expired verification code."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | NEW ACCOUNT - REQUEST REGISTRATION OTP
  |--------------------------------------------------------------------------
  |
  | POST /api/v1/auth/register/request-otp
  |
  | This is DIFFERENT from requestOtp().
  |
  | requestOtp()
  |   -> existing account
  |
  | registerRequestOtp()
  |   -> new account registration
  |
  */

  const registerRequestOtp = async (
    email: string
  ): Promise<void> => {
    const value = email.trim();

    if (!value) {
      throw new Error(
        "Please enter your email address."
      );
    }

    try {
      await api.post(
        "/api/v1/auth/register/request-otp",
        {
          email: value,
        }
      );
    } catch (error: any) {
      throw new Error(
        error?.message ||
          "Unable to send registration verification code."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | NEW ACCOUNT - VERIFY OTP + CREATE ACCOUNT
  |--------------------------------------------------------------------------
  |
  | POST /api/v1/auth/register/verify-otp
  |
  | Backend expects:
  |
  | {
  |   email,
  |   otp,
  |   fullName,
  |   password,
  |   designation,
  |   department,
  |   state,
  |   district,
  |   phone
  | }
  |
  | On success backend returns:
  |
  | {
  |   token,
  |   user
  | }
  |
  */

  const registerVerifyOtp = async (
    payload: RegisterVerifyPayload
  ): Promise<void> => {
    const email =
      payload.email.trim();

    const otp =
      payload.otp.trim();

    const fullName =
      payload.fullName.trim();

    const password =
      payload.password;

    if (!email) {
      throw new Error(
        "Email address is required."
      );
    }

    if (!otp) {
      throw new Error(
        "Verification code is required."
      );
    }

    if (!fullName) {
      throw new Error(
        "Full name is required."
      );
    }

    if (!password) {
      throw new Error(
        "Password is required."
      );
    }

    try {
      const res =
        await api.post<{
          token: string;
          user: UserProfile;
        }>(
          "/api/v1/auth/register/verify-otp",
          {
            email,
            otp,
            fullName,
            password,
            designation:
              payload.designation?.trim() ||
              "Citizen User",
            department:
              payload.department?.trim() ||
              "Public",
            state:
              payload.state?.trim() ||
              undefined,
            district:
              payload.district?.trim() ||
              undefined,
            phone:
              payload.phone?.trim() ||
              undefined,
          }
        );

      if (!res?.token) {
        throw new Error(
          "Account created but no authentication token was returned."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Automatically login newly registered user
      |--------------------------------------------------------------------------
      */

      setAuthToken(res.token);
      setToken(res.token);

      if (res.user) {
        setStoredUser(res.user);
        setUser(res.user);
      }
    } catch (error: any) {
      throw new Error(
        error?.message ||
          "Unable to create your BhoomiSetu account."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    api.auth.logout().catch(() => {});

    clearAuthToken();

    setUser(null);
    setToken(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Legacy demo role switch
  |--------------------------------------------------------------------------
  */

  const switchDemoRole = async (
    roleKey: string
  ) => {
    const demo =
      DEMO_USERS[roleKey];

    if (!demo) {
      throw new Error(
        "Demo user not found."
      );
    }

    await login(
      demo.email,
      demo.pass
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Role permissions
  |--------------------------------------------------------------------------
  */

  const hasRole = (
    ...roles: string[]
  ) => {
    if (!user) {
      return false;
    }

    if (
      user.role === "SUPER_ADMIN"
    ) {
      return true;
    }

    return roles.some(
      (role) =>
        role.toUpperCase() ===
        user.role.toUpperCase()
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Context
  |--------------------------------------------------------------------------
  */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,

        login,

        requestOtp,
        verifyOtp,

        registerRequestOtp,
        registerVerifyOtp,

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
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}