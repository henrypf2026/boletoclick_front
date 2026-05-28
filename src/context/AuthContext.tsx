'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearToken,
  getUserFromToken,
  loginUser,
  registerUser,
  setSession,
  type User,
} from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserFromToken()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const account = loginUser({ email, password });
    await setSession(account);
    setUser(account);
    return account;
  };

  const register = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const account = registerUser({ name, email, password });
    await setSession(account);
    setUser(account);
    return account;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, authenticated: Boolean(user), login, register, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
