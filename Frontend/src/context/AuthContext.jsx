import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth';

const TOKEN_KEY = 'community-connect-token';
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const establishSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  }, []);

  useEffect(() => {
    async function restoreSession() {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        setUser(response.data.user);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, [clearSession]);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login: async (values) => {
      const response = await authService.login(values);
      establishSession(response.data);
      return response.data.user;
    },
    register: async (values) => {
      const response = await authService.register(values);
      establishSession(response.data);
      return response.data.user;
    },
    refreshUser: async () => {
      const response = await authService.getCurrentUser();
      setUser(response.data.user);
      return response.data.user;
    },
    logout: async () => {
      try {
        await authService.logout();
      } finally {
        clearSession();
      }
    },
  }), [establishSession, isLoading, user, clearSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
