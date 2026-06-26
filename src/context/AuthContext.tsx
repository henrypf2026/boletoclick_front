"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getUserFromToken, saveToken, type User } from "@/lib/auth";
import { authService, type RegisterDto } from "@/services/authService";
import { supabase } from "@/lib/supabaseClient";

// Función auxiliar exportable para obtener el token JWT de la sesión activa de Supabase
export const getAuthToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: RegisterDto) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { user: account } = await authService.login({ email, password });

    const actualRole = (account as any).user_role || account.role;
    account.role = actualRole;

    saveToken(actualRole);
    setUser(account);
    return account;
  };
  const register = async (data: RegisterDto) => {
    const { user: account } = await authService.register(data);

    const roleToSave = (account as any).user_role || account.role;
    saveToken(roleToSave);

    setUser(account);
    return account;
  };
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      console.error("Error during logout");
    }
    await supabase.auth.signOut();
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authenticated: Boolean(user),
      login,
      register,
      logout,
      setUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
