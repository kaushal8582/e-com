'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { User } from '@/types';
import { apiGet } from '@/lib/api';

const TOKEN_KEY = 'shop_token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
  setUser: (u: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    if (typeof window === 'undefined') return;
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const login = useCallback((t: string) => {
    setToken(t);
  }, [setToken]);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!t) {
      setIsLoading(false);
      return;
    }
    setTokenState(t);
    apiGet<{ success: boolean; user: User }>('/auth/me', t)
      .then((res) => {
        if (res.success && res.user) setUser(res.user);
        else setToken(null);
      })
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false));
  }, [setToken]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
