import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api, type RegisterData, type TokenResponse } from "./api";

export interface AuthUser {
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("lh_access");
      const email = localStorage.getItem("lh_email");
      if (token && email) {
        setAccessToken(token);
        setUser({ email });
      }
    } catch {}
  }, []);

  async function login(email: string, password: string) {
    const data: TokenResponse = await api.auth.login(email, password);
    try {
      localStorage.setItem("lh_access", data.access);
      localStorage.setItem("lh_refresh", data.refresh);
      localStorage.setItem("lh_email", email);
    } catch {}
    setAccessToken(data.access);
    setUser({ email });
  }

  async function register(data: RegisterData) {
    await api.auth.register(data);
  }

  function logout() {
    try {
      localStorage.removeItem("lh_access");
      localStorage.removeItem("lh_refresh");
      localStorage.removeItem("lh_email");
    } catch {}
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
