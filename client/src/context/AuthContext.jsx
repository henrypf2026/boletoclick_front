import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearToken,
  getUserFromToken,
  loginUser,
  registerUser,
  setSession,
} from '../utils/helpers/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserFromToken()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    const account = loginUser({ email, password });
    await setSession(account);
    setUser(account);
    return account;
  };

  const register = async ({ name, email, password }) => {
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
    () => ({
      user,
      loading,
      authenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
