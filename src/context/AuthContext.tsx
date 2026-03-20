'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface AuthUser {
  sub: string;
  email: string;
  firstName?: string;
  lastName?: string;
  postcode?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoaded: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoaded: false,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    setUser(data);
    setIsLoaded(true);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, isLoaded, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
