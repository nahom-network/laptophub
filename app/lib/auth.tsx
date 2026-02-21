import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  api,
  type RegisterData,
  type TokenResponse,
  type UserProfile,
} from "./api";

export interface AuthUser {
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("lh_access");
      const email = localStorage.getItem("lh_email");
      if (token && email) {
        setAccessToken(token);
        setUser({ email });
        // Fetch profile in background
        api.profile
          .get(token)
          .then(setProfile)
          .catch(() => {});
      }
    } catch {}
  }, []);

  async function refreshProfile() {
    if (!accessToken) return;
    const p = await api.profile.get(accessToken);
    setProfile(p);
  }

  async function login(
    email: string,
    password: string,
  ): Promise<UserProfile | null> {
    const data: TokenResponse = await api.auth.login(email, password);
    try {
      localStorage.setItem("lh_access", data.access);
      localStorage.setItem("lh_refresh", data.refresh);
      localStorage.setItem("lh_email", email);
    } catch {}
    setAccessToken(data.access);
    setUser({ email });
    // Fetch profile after login
    try {
      const p = await api.profile.get(data.access);
      setProfile(p);
      return p;
    } catch {
      return null;
    }
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
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        profile,
        login,
        register,
        logout,
        refreshProfile,
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
