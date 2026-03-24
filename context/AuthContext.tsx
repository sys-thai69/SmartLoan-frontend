'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User, LoginCredentials, RegisterData } from '@/types';
import { authApi } from '@/lib/api';
import { storage } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.get<string>('token', '');
      const storedUser = storage.get<User | null>('user', null);

      if (token && storedUser) {
        setUser(storedUser);
        // Verify token is still valid
        try {
          const freshUser = await authApi.me();
          setUser(freshUser);
          storage.set('user', freshUser);
        } catch {
          // Token invalid, clear storage
          storage.remove('token');
          storage.remove('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    storage.set('token', response.token);
    storage.set('user', response.user);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authApi.register(data);
    storage.set('token', response.token);
    storage.set('user', response.user);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    storage.remove('token');
    storage.remove('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authApi.me();
      setUser(freshUser);
      storage.set('user', freshUser);
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
