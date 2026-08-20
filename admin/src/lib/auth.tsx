'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setToken } from './api';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'staff';
  permissions: string[];
};

type AuthState = {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  can: (module: string) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('lw_admin_user');
    const token = localStorage.getItem('lw_admin_token');
    if (!token || !raw) {
      setLoading(false);
      return;
    }
    try {
      setUser(JSON.parse(raw) as AdminUser);
      setLoading(false);
    } catch {
      setUser(null);
      setLoading(false);
      return;
    }
    void api<AdminUser>('/api/admin/auth/me')
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('lw_admin_user', JSON.stringify(res.data));
          return;
        }
        const expired = (res.message || '').toLowerCase().includes('expired');
        if (expired) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('lw_admin_user');
        }
      })
      .catch(() => {
        // Keep the restored session if the API is briefly unreachable.
      });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const res = await api<{ token: string; user: AdminUser }>('/api/admin/auth/login', {
          method: 'POST',
          auth: false,
          body: JSON.stringify({ email, password }),
        });
        if (!res.success || !res.data) return res.message || 'Login failed';
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('lw_admin_user', JSON.stringify(res.data.user));
        return null;
      },
      logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem('lw_admin_user');
      },
      can(module) {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        return user.permissions.includes('*') || user.permissions.includes(module);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
