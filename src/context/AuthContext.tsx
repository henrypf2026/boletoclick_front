"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getUserFromToken, saveToken, type User } from "@/lib/auth";
import { saveTabSession, getTabAccessToken } from "@/lib/tabSession";
import { authService, type RegisterDto } from "@/services/authService";
import { supabase } from "@/lib/supabaseClient";

export const getAuthToken = async (): Promise<string | null> => {
  return getTabAccessToken() ?? null;
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

async function persistSessionTokens(
  accessToken?: string,
  refreshToken?: string,
  role?: User["role"],
) {
  if (!accessToken) return;

  saveTabSession({
    accessToken,
    refreshToken,
    role,
  });

  if (refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
}

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
    const { user: account, accessToken, refreshToken } =
      await authService.login({ email, password });

    const actualRole = account.user_role || account.role;
    account.role = actualRole;

    await persistSessionTokens(accessToken, refreshToken, actualRole);
    saveToken(actualRole);
    setUser(account);
    return account;
  };

  const register = async (data: RegisterDto) => {
    const { user: account, accessToken, refreshToken } =
      await authService.register(data);

    const roleToSave = account.user_role || account.role;
    account.role = roleToSave;

    await persistSessionTokens(accessToken, refreshToken, roleToSave);
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
